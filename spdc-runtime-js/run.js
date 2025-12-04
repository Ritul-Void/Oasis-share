import http from "http";
import { Miniflare } from "miniflare";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = join(__dirname, "spdc-worker", "cf-spdc-worker.js");

const port = Number(process.env.PORT) || 8787;
const monitorPort = port + 1;

// ---------------------
// Minimal HTML monitor
// ---------------------
const monitorHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>SPDC Worker Monitor</title>
<style>
  body { background:#111; color:#0f0; font-family:monospace; margin:0; padding:1rem; }
  h2 { margin-top:0; color:#0f0; }
  pre { white-space:pre-wrap; word-wrap:break-word; }
  .repeat-count { color:#ff0; font-weight:bold; }
</style>
</head>
<body>
<div style="display:flex;align-items:center;justify-content:space-between;">
  <h2 style="margin:0;">SPDC Worker Log</h2>
  <button id="clearLogBtn" title="Clear logs" style="background:none;border:none;color:#0f0;font-size:1.5rem;cursor:pointer;line-height:1;padding:0 0.5rem;">&#10005;</button>
</div>
<pre id="log"></pre>
<script>
  const log = document.getElementById("log");
  const es = new EventSource("/logs");

  let lastLine = "";
  let lastFriendly = "";
  let repeatCount = 1;
  let logLines = [];

  // Optionally, map technical logs to friendlier messages
  function humanizeLog(line) {
    // Filter out noisy logs first
    if (line.startsWith("[WORKER] Forwarding to Durable Object")) {
      return ""; // Hide these repetitive worker logs
    }
    if (line.startsWith("[WORKER] Fetch:")) {
      return ""; // Hide noisy fetch logs
    }
    if (line.startsWith("[DO] Fetch: OPTIONS")) {
      return ""; // Hide CORS preflight logs
    }
    if (line.startsWith("[DO] Fetch: GET /api/peer-answer/")) {
      return ""; // Hide the fetch event itself, we show the result below
    }
    if (line.startsWith("[DO] Fetch: POST /api/peer-offer")) {
      return ""; // Hide fetch event, we show the result
    }
    if (line.startsWith("[DO] Fetch: POST /api/peer-answer")) {
      return ""; // Hide fetch event, we show the result
    }
    
    // Transform specific logs to friendly messages
    if (line.startsWith("[DO] GET /api/peer-answer/") && line.includes("answered=false")) {
      return "Waiting for the other peer to answer...";
    }
    if (line.startsWith("[DO] GET /api/peer-answer/") && line.includes("answered=true")) {
      return "The other peer has answered!";
    }
    if (line.startsWith("[DO] POST /api/peer-offer:")) {
      return "You sent a connection offer.";
    }
    if (line.startsWith("[DO] POST /api/peer-answer:")) {
      return "You sent a connection answer.";
    }
    if (line.startsWith("[DO] Stored offer")) {
      return "Offer saved on the server.";
    }
    if (line.startsWith("[DO] Stored answer")) {
      return "Answer saved on the server.";
    }
    
    // Default: return the original line
    return line;
  }

  // Exact character-by-character comparison
  function isExactMatch(str1, str2) {
    if (str1.length !== str2.length) return false;
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) return false;
    }
    return true;
  }

  function appendLog(line) {
    const friendly = humanizeLog(line);
    if (friendly === "") return;

    // Exact character comparison with the last friendly log
    if (isExactMatch(friendly, lastFriendly)) {
      repeatCount++;
      // Update the last log line with new multiplier
      logLines[logLines.length - 1] = friendly + ' <span class="repeat-count">x' + repeatCount + '</span>';
    } else {
      // New unique log - reset counter
      repeatCount = 1;
      logLines.push(friendly);
      lastFriendly = friendly;
    }
    
    log.innerHTML = logLines.join('<br>');
    log.scrollTop = log.scrollHeight;
  }

  es.onmessage = (e) => {
    appendLog(e.data);
  };

  es.onerror = (e) => {
    console.error('EventSource error:', e);
    logLines.push('<span style="color:#f00">[Connection Error]</span>');
    log.innerHTML = logLines.join('<br>');
  };

  window.addEventListener('beforeunload', () => {
    es.close();
  });

  // Clear log button handler
  document.getElementById('clearLogBtn').onclick = function() {
    logLines = [];
    lastFriendly = "";
    repeatCount = 1;
    log.innerHTML = "";
  };
</script>
</body>
</html>
`;

const logListeners = new Set();

// Broadcast logs to all SSE clients
function broadcast(data) {
  for (const res of logListeners) {
    res.write(`data: ${data}\n\n`);
  }
}

// ---------------------
// Monitor HTTP server
// ---------------------
function createMonitorServer() {
  return http.createServer((req, res) => {
    if (req.url === "/monitor") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(monitorHtml);
      return;
    }

    if (req.url === "/logs") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });

      res.write(`data: [Monitor Connected]\n\n`);

      logListeners.add(res);
      req.on("close", () => logListeners.delete(res));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });
}

// ---------------------
// Capture console logs
// ---------------------
const originalLog = console.log;
const originalErr = console.error;

console.log = (...args) => {
  const msg = args.join(" ");
  broadcast(msg);
  originalLog(msg);
};

console.error = (...args) => {
  const msg = args.join(" ");
  broadcast("[ERR] " + msg);
  originalErr(msg);
};

const mfLogger = {
  debug: (...args) => broadcast("[debug] " + args.join(" ")),
  info: (...args) => broadcast("[info] " + args.join(" ")),
  warn: (...args) => broadcast("[warn] " + args.join(" ")),
  error: (...args) => broadcast("[error] " + args.join(" ")),
  log: (...args) => broadcast("[log] " + args.join(" ")),
}

async function start() {
  const mf = new Miniflare({
    modules: true,
    scriptPath: WORKER_PATH,
    durableObjects: {
      SIGNALLING_DO: "SignallingDurableObject"
    },
    port,
    host: "0.0.0.0",
    watch: true,
    durableObjectsPersist: true,
  });

  const monitor = createMonitorServer();
  monitor.listen(monitorPort);

  setTimeout(() => {
    console.log(`Worker running at http://localhost:${port}`);
    console.log(`Monitor running at http://localhost:${monitorPort}/monitor`);
    console.log("🚀 Monitor connected and listening for logs...");
  }, 100);

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await mf.dispose();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});