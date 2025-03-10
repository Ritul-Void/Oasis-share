import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/* global SimplePeer */

const SIGNALING_BASE_URL = "https://pearrtc.publicacc039.workers.dev";

const NICKNAMES = [
  "nova", "starlight", "orbit", "zen", "comet",
  "luna", "ember", "void", "pulse", "echo"
];

function randomUsername() {
  const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${name}#${num}`;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [peerId, setPeerId] = useState("");
  const [isInitiator, setIsInitiator] = useState(false);

  const [myUsername] = useState(randomUsername());
  const [peerUsername, setPeerUsername] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);

  const [showCodeBar, setShowCodeBar] = useState(false);
  const [showReceiveInput, setShowReceiveInput] = useState(false);
  const [receiveCode, setReceiveCode] = useState("");

  const peerRef = useRef(null);
  const pollingRef = useRef(null);
  const fileQueueRef = useRef([]);

  /* ---------------- API helpers ---------------- */

  const apiPost = async (path, body) => {
    const res = await fetch(SIGNALING_BASE_URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  };

  const apiGet = async (path) => {
    const res = await fetch(SIGNALING_BASE_URL + path);
    return { status: res.status, data: await res.json().catch(() => ({})) };
  };

  const generatePeerId = () =>
    String(Math.floor(100000 + Math.random() * 900000));

  /* ---------------- Toast ---------------- */

  const toast = (msg) => {
    const t = document.createElement("div");
    t.className = "toast-custom";
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 50);
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 2500);
  };

  /* ---------------- Peer ---------------- */

  const initPeer = (initiator, id) => {
    const p = new SimplePeer({ initiator, trickle: false });

    p.on("signal", async (data) => {
      if (initiator) {
        await apiPost("/api/peer-offer", { peerId: id, offer: data });
        pollForAnswer(id, p);
      } else {
        await apiPost("/api/peer-answer", { peerId: id, answer: data });
      }
    });

    p.on("connect", () => {
      setConnected(true);
      toast("Connected securely");
      p.send(JSON.stringify({ type: "username", value: myUsername }));
      processFileQueue();
    });

    p.on("data", (data) => handleIncomingData(data));

    peerRef.current = p;
  };

  const pollForAnswer = (id, p) => {
    pollingRef.current = setInterval(async () => {
      const { status, data } = await apiGet(`/api/peer-answer/${id}`);
      if (status === 200 && data.answer) {
        clearInterval(pollingRef.current);
        p.signal(data.answer);
      }
    }, 2000);
  };

  /* ---------------- File Transfer ---------------- */

  const processFileQueue = async () => {
    for (const file of fileQueueRef.current) {
      const buffer = await file.arrayBuffer();
      peerRef.current.send(
        JSON.stringify({
          type: "file-meta",
          name: file.name,
          size: file.size
        })
      );
      peerRef.current.send(buffer);
      setSentFiles((s) => [
        ...s,
        {
          name: file.name,
          size: file.size,
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
    fileQueueRef.current = [];
    setSelectedFiles([]);
  };

  const handleIncomingData = (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "username") {
        setPeerUsername(msg.value);
        return;
      }
      if (msg.type === "file-meta") {
        peerRef.current._incomingFile = msg;
        peerRef.current._incomingChunks = [];
        return;
      }
    } catch {}

    if (peerRef.current._incomingFile) {
      const meta = peerRef.current._incomingFile;
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);

      setReceivedFiles((r) => [
        ...r,
        {
          name: meta.name,
          size: meta.size,
          url,
          time: new Date().toLocaleTimeString()
        }
      ]);

      peerRef.current._incomingFile = null;
    }
  };

  /* ---------------- Actions ---------------- */

  const handleSend = () => {
    const id = generatePeerId();
    setPeerId(id);
    setIsInitiator(true);
    setShowCodeBar(true);
    initPeer(true, id);
  };

  const handleReceive = async () => {
    const { data } = await apiGet(`/api/peer-offer/${receiveCode}`);
    initPeer(false, receiveCode);
    peerRef.current.signal(data.offer);
    setShowReceiveInput(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(peerId);
    toast("Code copied");
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="app-root">
      {/* Header */}
      <div className="top-bar glass">
        <div>SPDC Share</div>
        <div className="status">
          <span className={`dot ${connected ? "green" : "red"}`} />
          <i className="bi bi-gear" />
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <h6>You: {myUsername}</h6>
        {peerUsername && <h6>Connected with: {peerUsername}</h6>}

        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
            fileQueueRef.current = files;
          }}
        />

        <h6>Sent</h6>
        {sentFiles.map((f, i) => (
          <div key={i}>{f.name} • {f.size} bytes • {f.time}</div>
        ))}

        <h6>Received</h6>
        {receivedFiles.map((f, i) => (
          <a key={i} href={f.url} download={f.name}>
            {f.name} • {f.size} bytes • {f.time}
          </a>
        ))}
      </div>

      {/* Code bar */}
      {showCodeBar && (
        <div className="code-bar glass" onClick={copyCode}>
          Connection Code: <strong>{peerId}</strong>
        </div>
      )}

      {/* Bottom bar */}
      <div className="bottom-bar glass">
        <button onClick={handleSend}>Send</button>
        <button onClick={() => setShowReceiveInput(true)}>Receive</button>
      </div>

      {showReceiveInput && (
        <div className="receive-box glass">
          <input
            value={receiveCode}
            onChange={(e) => setReceiveCode(e.target.value)}
            placeholder="Enter code"
          />
          <button onClick={handleReceive}>Connect</button>
        </div>
      )}
    </div>
  );
}

export default App;
