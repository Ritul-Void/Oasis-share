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
  const [sendingProgress, setSendingProgress] = useState({}); // New state for progress

  const [showCodeBar, setShowCodeBar] = useState(false);
  const [showReceiveInput, setShowReceiveInput] = useState(false);
  const [receiveCode, setReceiveCode] = useState("");

  const peerRef = useRef(null);
  const pollingRef = useRef(null);
  const fileQueueRef = useRef([]);
  const sendBufferRef = useRef([]); // To manage file sending in chunks

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
      console.log("Peer connected. Username sent.");
      processFileQueue();
    });

    p.on("data", (data) => {
      console.log("Peer 'data' event fired. Data length:", data.length || data.byteLength);
      handleIncomingData(data)
    });

    p.on("close", () => {
      console.log("Peer connection closed.");
      setConnected(false);
      toast("Peer disconnected.");
      clearInterval(pollingRef.current);
    });
    p.on("error", (err) => {
      console.error("Peer error:", err);
      toast("Peer connection error.");
    });

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

  const CHUNK_SIZE = 16 * 1024; // 16KB chunks

  const sendFileInChunks = async (file) => {
    const fileId = `${file.name}-${file.size}`;
    const startTime = Date.now(); // Capture startTime once at the beginning
    console.log(`Sending file metadata for ${file.name} (ID: ${fileId})`);
    setSendingProgress((prev) => ({ ...prev, [fileId]: { progress: 0, speed: 0, startTime: startTime } })); // Use the local startTime

    peerRef.current.send(
      JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        fileId: fileId,
      })
    );

    const buffer = await file.arrayBuffer();
    let offset = 0;

    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      peerRef.current.send(chunk);
      offset += chunk.byteLength;
      console.log(`Sent chunk for ${file.name}. Offset: ${offset}/${buffer.byteLength}`);

      const progress = (offset / buffer.byteLength) * 100;
      const elapsedTime = (Date.now() - startTime) / 1000; // Use the local startTime here
      const speed = offset / elapsedTime / 1024; // KB/s

      setSendingProgress((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], progress: progress, speed: speed }
      }));
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to prevent blocking
    }

    peerRef.current.send(
      JSON.stringify({
        type: "file-end",
        fileId: fileId,
      })
    );
    console.log(`Sent file-end for ${file.name} (ID: ${fileId})`);

    setSentFiles((s) => [
      ...s,
      {
        name: file.name,
        size: file.size,
        time: new Date().toLocaleTimeString(),
        fileId: fileId,
      }
    ]);
    setSendingProgress((prev) => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
    console.log(`File ${file.name} marked as sent.`);
  };

  const processFileQueue = async () => {
    console.log("processFileQueue called. Connected:", connected, "Queue length:", fileQueueRef.current.length);
    if (!peerRef.current || !connected) {
      console.log("processFileQueue: Not connected or no peerRef. Returning.");
      return;
    }

    while (fileQueueRef.current.length > 0) {
      const file = fileQueueRef.current.shift(); // Get file from the front of the queue
      console.log("Processing file from queue:", file.name);
      await sendFileInChunks(file);
    }
    setSelectedFiles([]); // Clear selected files after processing
    console.log("File queue processed. Selected files cleared.");
  };

  useEffect(() => {
    console.log("useEffect: Connected status changed or fileQueueRef changed. Connected:", connected, "Queue length:", fileQueueRef.current.length);
    if (connected && fileQueueRef.current.length > 0) {
      processFileQueue();
    }
  }, [connected, fileQueueRef.current.length]); // Added fileQueueRef.current.length to dependency array

  const handleIncomingData = (data) => {
    console.log("handleIncomingData received data. Type:", typeof data, "Length:", data.length || data.byteLength);

    // If a file transfer is currently active, assume incoming data is a file chunk
    if (peerRef.current && peerRef.current._incomingFile) {
      peerRef.current._incomingFile.receivedChunks.push(data);
      console.log(`Received file chunk for ${peerRef.current._incomingFile.name}. Total chunks: ${peerRef.current._incomingFile.receivedChunks.length}`);
      return; // Crucial: return after handling a chunk
    }

    // If no file transfer is active, try to parse as JSON for control messages
    try {
      const msg = JSON.parse(data.toString());
      console.log("Parsed incoming message:", msg);
      if (msg.type === "username") {
        setPeerUsername(msg.value);
        return;
      }
      if (msg.type === "file-meta") {
        peerRef.current._incomingFile = { ...msg, receivedChunks: [] };
        peerRef.current._incomingFile.startTime = Date.now();
        console.log("Received file-meta:", msg.name);
        return;
      }
      if (msg.type === "file-end") {
        const meta = peerRef.current._incomingFile;
        console.log("Received file-end for:", meta ? meta.name : "unknown file");
        const blob = new Blob(meta.receivedChunks);
        const url = URL.createObjectURL(blob);

        const endTime = Date.now();
        const duration = (endTime - meta.startTime) / 1000;
        const speed = (meta.size / duration / 1024).toFixed(2);

        setReceivedFiles((r) => [
          ...r,
          {
            name: meta.name,
            size: meta.size,
            url,
            time: new Date().toLocaleTimeString(),
            speed: speed,
          }
        ]);
        peerRef.current._incomingFile = null;
        console.log(`File ${meta.name} received and processed.`);
        return;
      }
    } catch (e) {
      // This catch block will now primarily handle unexpected non-JSON data
      // when no file transfer is active.
      console.warn("Received unexpected non-JSON data when no file transfer was active or JSON parsing failed:", e);
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
    const { status, data } = await apiGet(`/api/peer-offer/${receiveCode}`);
    if (status === 200 && data.offer) {
      initPeer(false, receiveCode);
      peerRef.current.signal(data.offer);
      setShowReceiveInput(false);
    } else {
      toast("Invalid or expired connection code.");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(peerId);
    toast("Code copied");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    fileQueueRef.current = [...fileQueueRef.current, ...files];
    if (connected) {
      processFileQueue();
    }
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    fileQueueRef.current = fileQueueRef.current.filter((_, index) => index !== indexToRemove);
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

        <div className="file-input-container">
          <input
            type="file"
            multiple
            id="file-upload"
            className="file-input-hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="file-input-label glass">
            <i className="bi bi-upload"></i> Choose Files
          </label>
        </div>


        <h6>Selected Files</h6>
        <div className="file-list-container glass">
          {selectedFiles.length === 0 ? (
            <p className="no-files-msg">No files selected.</p>
          ) : (
            selectedFiles.map((f, i) => (
              <div key={i} className="file-item">
                <span>{f.name} • {(f.size / 1024 / 1024).toFixed(2)} MB</span>
                <button
                  onClick={() => handleRemoveSelectedFile(i)}
                  className="remove-file-btn"
                  title="Remove File"
                >
                  &times;
                </button>
              </div>
            )))
          }
        </div>

        <h6>Sent</h6>
        <div className="file-list-container glass">
          {sentFiles.length === 0 ? (
            <p className="no-files-msg">No files sent yet.</p>
          ) : (
            sentFiles.map((f, i) => (
              <div key={i} className="file-item">
                <span>{f.name} • {(f.size / 1024 / 1024).toFixed(2)} MB • {f.time}</span>
                {sendingProgress[f.fileId] && (
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${sendingProgress[f.fileId].progress}%` }}
                    ></div>
                    <span className="progress-text">
                      {sendingProgress[f.fileId].progress.toFixed(0)}% (
                      {sendingProgress[f.fileId].speed.toFixed(2)} KB/s)
                    </span>
                  </div>
                )}
              </div>
            )))
          }
        </div>

        <h6>Received</h6>
        <div className="file-list-container glass">
          {receivedFiles.length === 0 ? (
            <p className="no-files-msg">No files received yet.</p>
          ) : (
            receivedFiles.map((f, i) => (
              <div key={i} className="file-item">
                <span>{f.name} • {(f.size / 1024 / 1024).toFixed(2)} MB • {f.time}</span>
                {f.speed && <span className="transfer-speed"> ({f.speed} KB/s)</span>}
                <button
                  onClick={() => window.open(f.url, '_blank')}
                  className="download-btn"
                  title="Download File"
                >
                  Download
                </button>
              </div>
            )))
          }
        </div>
      </div>

      {/* Code bar */}
      {showCodeBar && (
        <div className="code-bar glass" onClick={copyCode}>
          Connection Code: <strong>{peerId}</strong>
        </div>
      )}

      {/* Bottom bar */}
      <div className="bottom-bar glass">
        <button onClick={handleSend} disabled={connected}>Send</button>
        <button onClick={() => setShowReceiveInput(true)} disabled={connected}>Receive</button>
      </div>

      {showReceiveInput && (
        <div className="receive-box glass">
          <input
            value={receiveCode}
            onChange={(e) => setReceiveCode(e.target.value)}
            placeholder="Enter code"
          />
          <button onClick={handleReceive}>Connect</button>
          <button onClick={() => setShowReceiveInput(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
