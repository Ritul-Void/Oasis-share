import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const SIGNALING_BASE_URL = "https://pearrtc.publicacc039.workers.dev";
const NICKNAMES = ["Nova", "Starlight", "Orbit", "Zen", "Comet", "Luna", "Ember", "Void", "Pulse", "Echo"];
const Icons = {
  Upload: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), React.createElement("polyline", {
    points: "17 8 12 3 7 8"
  }), React.createElement("line", {
    x1: "12",
    y1: "3",
    x2: "12",
    y2: "15"
  })),
  Download: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), React.createElement("line", {
    x1: "12",
    y1: "15",
    x2: "12",
    y2: "3"
  })),
  Send: () => React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("line", {
    x1: "22",
    y1: "2",
    x2: "11",
    y2: "13"
  }), React.createElement("polygon", {
    points: "22 2 15 22 11 13 2 9 22 2"
  })),
  Receive: () => React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("polyline", {
    points: "9 17 4 12 9 7"
  }), React.createElement("path", {
    d: "M20 18v-2a4 4 0 0 0-4-4H4"
  })),
  X: () => React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  })),
  File: () => React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }), React.createElement("line", {
    x1: "16",
    y1: "13",
    x2: "8",
    y2: "13"
  }), React.createElement("line", {
    x1: "16",
    y1: "17",
    x2: "8",
    y2: "17"
  }), React.createElement("polyline", {
    points: "10 9 9 9 8 9"
  })),
  Check: () => React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })),
  Copy: () => React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2",
    ry: "2"
  }), React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  })),
  Gear: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
  }))
};
function randomUsername() {
  const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${name}#${num}`;
}
const formatBytes = bytes => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
function App() {
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerId, setPeerId] = useState("");
  const [isInitiator, setIsInitiator] = useState(false);
  const [myUsername] = useState(randomUsername());
  const [peerUsername, setPeerUsername] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sendingProgress, setSendingProgress] = useState({});
  const [receivingProgress, setReceivingProgress] = useState({});
  const [showReceiveInput, setShowReceiveInput] = useState(false);
  const [receiveCode, setReceiveCode] = useState("");
  const peerRef = useRef(null);
  const pollingRef = useRef(null);
  const fileQueueRef = useRef([]);
  const cancellationTokensRef = useRef({});
  const apiPost = async (path, body) => {
    const res = await fetch(SIGNALING_BASE_URL + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  };
  const apiGet = async path => {
    const res = await fetch(SIGNALING_BASE_URL + path);
    return {
      status: res.status,
      data: await res.json().catch(() => ({}))
    };
  };
  const generatePeerId = () => String(Math.floor(100000 + Math.random() * 900000));
  const toast = msg => {
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
  const initPeer = (initiator, id) => {
    try {
      const p = new SimplePeer({
        initiator,
        trickle: false
      });
      p.on("signal", async data => {
        if (initiator) {
          await apiPost("/api/peer-offer", {
            peerId: id,
            offer: data
          });
          pollForAnswer(id, p);
        } else {
          await apiPost("/api/peer-answer", {
            peerId: id,
            answer: data
          });
        }
      });
      p.on("connect", async () => {
        setConnected(true);
        setIsConnecting(false);
        toast("Secure connection established");
        p.send(JSON.stringify({
          type: "username",
          value: myUsername
        }));
        processFileQueue();
        const info = await detectConnectionType(p);
        if (info) {
          console.log("Connection info:", info);
          if (info.localType === "host" && info.remoteType === "host") {
            toast("Local network connection (LAN)");
          } else if (info.localType === "relay" || info.remoteType === "relay") {
            toast("Connected via relay (TURN)");
          } else {
            toast("Connected via internet (STUN)");
          }
        }
      });
      p.on("data", data => {
        handleIncomingData(data);
      });
      p.on("close", () => {
        setConnected(false);
        setIsConnecting(false);
        toast("Peer disconnected.");
        clearInterval(pollingRef.current);
      });
      p.on("error", err => {
        console.error("Peer error:", err);
        setConnected(false);
        setIsConnecting(false);
        toast("Connection error occurred.");
      });
      peerRef.current = p;
    } catch (e) {
      setIsConnecting(false);
      toast("Failed to initialize peer");
    }
  };
  const pollForAnswer = (id, p) => {
    pollingRef.current = setInterval(async () => {
      const {
        status,
        data
      } = await apiGet(`/api/peer-answer/${id}`);
      if (status === 200 && data.answer) {
        clearInterval(pollingRef.current);
        p.signal(data.answer);
      }
    }, 2000);
  };
  const CHUNK_SIZE = 16 * 1024;
  const handleControlMessage = msg => {
    if (msg.type === "username") {
      setPeerUsername(msg.value);
      return;
    }
    if (msg.type === "file-meta") {
      peerRef.current._incomingFile = {
        ...msg,
        receivedChunks: [],
        receivedBytes: 0,
        startTime: Date.now()
      };
      setReceivingProgress(prev => ({
        ...prev,
        [msg.fileId]: {
          name: msg.name,
          size: msg.size,
          receivedBytes: 0,
          progress: 0,
          speed: 0,
          fileId: msg.fileId,
          status: "receiving"
        }
      }));
      return;
    }
    if (msg.type === "file-end") {
      const meta = peerRef.current._incomingFile;
      const blob = new Blob(meta.receivedChunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      const endTime = Date.now();
      const duration = (endTime - meta.startTime) / 1000;
      const speed = (meta.size / duration / 1024).toFixed(2);
      setReceivedFiles(r => [...r, {
        name: meta.name,
        size: meta.size,
        time: new Date().toLocaleTimeString(),
        speed: speed,
        fileId: meta.fileId,
        status: "completed"
      }]);
      peerRef.current._incomingFile = null;
      setReceivingProgress(prev => {
        const n = {
          ...prev
        };
        delete n[meta.fileId];
        return n;
      });
      toast(`Received ${meta.name}`);
      return;
    }
    if (msg.type === "cancel-file") {
      peerRef.current._incomingFile = null;
      setReceivingProgress(prev => {
        const n = {
          ...prev
        };
        delete n[msg.fileId];
        return n;
      });
      toast("Transfer cancelled");
    }
  };
  const sendFileInChunks = async file => {
    const fileId = `${file.name}-${file.size}-${Date.now()}`;
    const startTime = Date.now();
    cancellationTokensRef.current[fileId] = false;
    setSendingProgress(prev => ({
      ...prev,
      [fileId]: {
        progress: 0,
        speed: 0,
        startTime: startTime,
        status: "sending",
        size: file.size,
        name: file.name,
        fileId: fileId
      }
    }));
    try {
      peerRef.current.send(JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        fileId: fileId
      }));
      const buffer = await file.arrayBuffer();
      let offset = 0;
      while (offset < buffer.byteLength) {
        if (cancellationTokensRef.current[fileId] === true) {
          console.log(`Sending of ${file.name} cancelled by user.`);
          try {
            peerRef.current.send(JSON.stringify({
              type: "cancel-file",
              fileId: fileId
            }));
          } catch (e) {
            console.error("Error sending cancel message:", e);
          }
          setSendingProgress(prev => {
            const newState = {
              ...prev
            };
            delete newState[fileId];
            return newState;
          });
          delete cancellationTokensRef.current[fileId];
          toast(`Transfer of ${file.name} cancelled`);
          return;
        }
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        peerRef.current.send(chunk);
        offset += chunk.byteLength;
        const progress = offset / buffer.byteLength * 100;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = offset / elapsedTime / 1024;
        setSendingProgress(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: progress,
            speed: speed
          }
        }));
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      peerRef.current.send(JSON.stringify({
        type: "file-end",
        fileId: fileId
      }));
      setSentFiles(s => [...s, {
        name: file.name,
        size: file.size,
        time: new Date().toLocaleTimeString(),
        fileId: fileId,
        status: "completed"
      }]);
    } catch (error) {
      console.error("Error sending file:", error);
      toast(`Error sending ${file.name}`);
    } finally {
      setSendingProgress(prev => {
        const newState = {
          ...prev
        };
        delete newState[fileId];
        return newState;
      });
      delete cancellationTokensRef.current[fileId];
    }
  };
  const processFileQueue = async () => {
    if (!peerRef.current || !connected) {
      return;
    }
    while (fileQueueRef.current.length > 0) {
      const file = fileQueueRef.current.shift();
      await sendFileInChunks(file);
    }
    setSelectedFiles([]);
  };
  useEffect(() => {
    if (connected && fileQueueRef.current.length > 0) {
      processFileQueue();
    }
  }, [connected, fileQueueRef.current.length]);
  const handleIncomingData = data => {
    if (typeof data === "string") {
      handleControlMessage(JSON.parse(data));
      return;
    }
    if (data instanceof Uint8Array) {
      try {
        const text = new TextDecoder().decode(data);
        if (text.startsWith("{") && text.endsWith("}")) {
          handleControlMessage(JSON.parse(text));
          return;
        }
      } catch (e) {}
      if (peerRef.current?._incomingFile) {
        const meta = peerRef.current._incomingFile;
        meta.receivedChunks.push(data);
        meta.receivedBytes += data.byteLength;
        const progress = meta.receivedBytes / meta.size * 100;
        const elapsedTime = (Date.now() - meta.startTime) / 1000;
        const speed = meta.receivedBytes / elapsedTime / 1024;
        setReceivingProgress(prev => ({
          ...prev,
          [meta.fileId]: {
            ...prev[meta.fileId],
            receivedBytes: meta.receivedBytes,
            progress,
            speed
          }
        }));
      }
    }
  };
  const handleSend = () => {
    const id = generatePeerId();
    setPeerId(id);
    setIsInitiator(true);
    setIsConnecting(true);
    initPeer(true, id);
  };
  const handleReceive = async () => {
    if (!receiveCode) return toast("Please enter a code");
    setIsConnecting(true);
    try {
      const {
        status,
        data
      } = await apiGet(`/api/peer-offer/${receiveCode}`);
      if (status === 200 && data.offer) {
        initPeer(false, receiveCode);
        peerRef.current.signal(data.offer);
        setShowReceiveInput(false);
      } else {
        toast("Invalid or expired connection code.");
        setIsConnecting(false);
      }
    } catch (e) {
      setIsConnecting(false);
      toast("Connection error");
    }
  };
  const copyCode = () => {
    navigator.clipboard.writeText(peerId);
    toast("Code copied to clipboard");
  };
  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files).map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      tempId: `${f.name}-${f.size}-${Date.now()}`
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
    fileQueueRef.current = [...fileQueueRef.current, ...newFiles.map(item => item.file)];
    if (connected) {
      processFileQueue();
    }
  };
  const handleRemoveSelectedFile = tempIdToRemove => {
    const fileObjectToRemove = selectedFiles.find(f => f.tempId === tempIdToRemove);
    if (fileObjectToRemove) {
      fileQueueRef.current = fileQueueRef.current.filter(f => f !== fileObjectToRemove.file);
    }
    setSelectedFiles(prev => prev.filter(f => f.tempId !== tempIdToRemove));
  };
  const handleCancelSend = fileId => {
    if (cancellationTokensRef.current[fileId] !== undefined) {
      cancellationTokensRef.current[fileId] = true;
      toast("Cancelling...");
    }
  };
  const detectConnectionType = async peer => {
    const pc = peer._pc;
    if (!pc) return null;
    const stats = await pc.getStats();
    let selectedPair = null;
    let localCandidate = null;
    let remoteCandidate = null;
    stats.forEach(report => {
      if (report.type === "transport" && report.selectedCandidatePairId) {
        selectedPair = report.selectedCandidatePairId;
      }
    });
    stats.forEach(report => {
      if (report.type === "candidate-pair" && report.id === selectedPair) {
        localCandidate = stats.get(report.localCandidateId);
        remoteCandidate = stats.get(report.remoteCandidateId);
      }
    });
    if (!localCandidate || !remoteCandidate) return null;
    return {
      localType: localCandidate.candidateType,
      remoteType: remoteCandidate.candidateType,
      localIp: localCandidate.address,
      remoteIp: remoteCandidate.address,
      protocol: localCandidate.protocol
    };
  };
  const unifiedHistory = [...sentFiles.map(f => ({
    ...f,
    direction: 'sent'
  })), ...receivedFiles.map(f => ({
    ...f,
    direction: 'received'
  }))].sort((a, b) => 0);
  return React.createElement("div", {
    className: "app-container"
  }, React.createElement("header", {
    className: "app-header glass"
  }, React.createElement("div", {
    className: "brand"
  }, React.createElement("h1", null, "Oasis-Share")), React.createElement("div", {
    className: "user-status"
  }, React.createElement("div", {
    className: "user-pill glass-interactive"
  }, React.createElement("span", {
    className: "status-indicator",
    style: {
      background: connected ? '#00FF88' : '#FF3B30'
    }
  }), React.createElement("span", {
    className: "username"
  }, myUsername)))), React.createElement("main", {
    className: "main-stage"
  }, !connected && !isConnecting && React.createElement("div", {
    className: "welcome-stage fade-in"
  }, React.createElement("h1", {
    className: "hero-title"
  }, "Secure Peer-to-Peer", React.createElement("br", null), React.createElement("span", {
    className: "gradient-text"
  }, "File Transfer.")), React.createElement("p", {
    className: "hero-subtitle"
  }, "No cloud limits. No servers. Direct device connection."), React.createElement("div", {
    className: "action-cards"
  }, React.createElement("div", {
    className: "card glass-card hover-lift",
    onClick: handleSend
  }, React.createElement("div", {
    className: "icon-circle"
  }, React.createElement(Icons.Send, null)), React.createElement("h3", null, "Send Files"), React.createElement("p", null, "Generate a code and start sharing instantly.")), React.createElement("div", {
    className: "card glass-card hover-lift",
    onClick: () => setShowReceiveInput(true)
  }, React.createElement("div", {
    className: "icon-circle"
  }, React.createElement(Icons.Receive, null)), React.createElement("h3", null, "Receive Files"), React.createElement("p", null, "Enter a connection code to link devices.")))), isConnecting && React.createElement("div", {
    className: "connecting-stage fade-in"
  }, React.createElement("div", {
    className: "radar-spinner"
  }, React.createElement("div", {
    className: "ripple"
  }), React.createElement("div", {
    className: "ripple delay-1"
  }), React.createElement("div", {
    className: "center-dot"
  })), React.createElement("h2", null, "Establishing Secure Link..."), isInitiator && peerId && React.createElement("div", {
    className: "code-display glass",
    onClick: copyCode
  }, React.createElement("span", {
    className: "code-label"
  }, "CONNECTION CODE"), React.createElement("div", {
    className: "code-value"
  }, peerId, " ", React.createElement(Icons.Copy, null)), React.createElement("p", {
    className: "hint"
  }, "Share this code with the receiver")), !isInitiator && React.createElement("p", {
    className: "hint"
  }, "Locating peer..."), React.createElement("button", {
    className: "cancel-btn-text",
    onClick: () => {
      setIsConnecting(false);
      setPeerId("");
      window.location.reload();
    }
  }, "Cancel")), showReceiveInput && !connected && !isConnecting && React.createElement("div", {
    className: "modal-overlay fade-in"
  }, React.createElement("div", {
    className: "modal glass-card"
  }, React.createElement("div", {
    className: "modal-header"
  }, React.createElement("h3", null, "Connect to Device"), React.createElement("button", {
    className: "icon-btn",
    onClick: () => setShowReceiveInput(false)
  }, React.createElement(Icons.X, null))), React.createElement("div", {
    className: "modal-body"
  }, React.createElement("input", {
    type: "number",
    placeholder: "Enter 6-digit code",
    value: receiveCode,
    onChange: e => setReceiveCode(e.target.value),
    autoFocus: true
  }), React.createElement("button", {
    className: "primary-btn full-width",
    onClick: handleReceive
  }, "Connect")))), connected && React.createElement("div", {
    className: "dashboard fade-in"
  }, React.createElement("div", {
    className: "dashboard-header"
  }, React.createElement("div", {
    className: "connection-info glass"
  }, React.createElement("span", {
    className: "label"
  }, "Connected to"), React.createElement("span", {
    className: "value"
  }, peerUsername || "Anonymous Peer")), React.createElement("label", {
    className: "primary-btn upload-btn"
  }, React.createElement(Icons.Upload, null), " Send Files", React.createElement("input", {
    type: "file",
    multiple: true,
    onChange: handleFileChange,
    hidden: true
  }))), selectedFiles.length > 0 && React.createElement("div", {
    className: "section"
  }, React.createElement("h6", {
    className: "section-title"
  }, "Queue"), React.createElement("div", {
    className: "file-grid"
  }, selectedFiles.map(f => React.createElement("div", {
    key: f.tempId,
    className: "file-card glass-interactive"
  }, React.createElement("div", {
    className: "file-icon"
  }, React.createElement(Icons.File, null)), React.createElement("div", {
    className: "file-info"
  }, React.createElement("div", {
    className: "name"
  }, f.name), React.createElement("div", {
    className: "meta"
  }, formatBytes(f.size))), React.createElement("button", {
    onClick: () => handleRemoveSelectedFile(f.tempId),
    className: "icon-btn-sm red"
  }, React.createElement(Icons.X, null)))))), (Object.keys(sendingProgress).length > 0 || Object.keys(receivingProgress).length > 0) && React.createElement("div", {
    className: "section"
  }, React.createElement("h6", {
    className: "section-title"
  }, "Active Transfers"), React.createElement("div", {
    className: "transfers-list"
  }, Object.values(sendingProgress).map(f => React.createElement("div", {
    key: f.fileId,
    className: "transfer-row glass"
  }, React.createElement("div", {
    className: "direction-icon up"
  }, React.createElement(Icons.Upload, null)), React.createElement("div", {
    className: "transfer-details"
  }, React.createElement("div", {
    className: "transfer-top"
  }, React.createElement("span", {
    className: "name"
  }, f.name), React.createElement("span", {
    className: "speed"
  }, f.speed.toFixed(1), " KB/s")), React.createElement("div", {
    className: "progress-track"
  }, React.createElement("div", {
    className: "progress-fill",
    style: {
      width: `${f.progress}%`
    }
  })), React.createElement("div", {
    className: "transfer-btm"
  }, React.createElement("span", null, formatBytes(f.size)), React.createElement("button", {
    className: "text-btn red",
    onClick: () => handleCancelSend(f.fileId)
  }, "Cancel"))))), Object.values(receivingProgress).map(f => React.createElement("div", {
    key: f.fileId,
    className: "transfer-row glass"
  }, React.createElement("div", {
    className: "direction-icon down"
  }, React.createElement(Icons.Download, null)), React.createElement("div", {
    className: "transfer-details"
  }, React.createElement("div", {
    className: "transfer-top"
  }, React.createElement("span", {
    className: "name"
  }, f.name), React.createElement("span", {
    className: "speed"
  }, f.speed.toFixed(1), " KB/s")), React.createElement("div", {
    className: "progress-track"
  }, React.createElement("div", {
    className: "progress-fill",
    style: {
      width: `${f.progress}%`
    }
  })), React.createElement("div", {
    className: "transfer-btm"
  }, React.createElement("span", null, formatBytes(f.size)), React.createElement("span", null, f.progress.toFixed(0), "%"))))))), React.createElement("div", {
    className: "section grow"
  }, React.createElement("h6", {
    className: "section-title"
  }, "History"), React.createElement("div", {
    className: "history-list glass"
  }, unifiedHistory.length === 0 ? React.createElement("div", {
    className: "empty-state"
  }, "No file history yet.") : unifiedHistory.map((f, i) => React.createElement("div", {
    key: f.fileId + i,
    className: "history-item"
  }, React.createElement("div", {
    className: `status-dot ${f.direction}`
  }, f.direction === 'sent' ? React.createElement(Icons.Check, null) : React.createElement(Icons.Download, null)), React.createElement("div", {
    className: "file-data"
  }, React.createElement("span", {
    className: "filename"
  }, f.name), React.createElement("div", {
    className: "subtext"
  }, React.createElement("span", {
    className: "size"
  }, formatBytes(f.size)), React.createElement("span", {
    className: "separator"
  }, "\u2022"), React.createElement("span", {
    className: "time"
  }, f.time), f.direction === 'sent' ? React.createElement("span", {
    className: "tag sent"
  }, "Sent") : React.createElement("span", {
    className: "tag received"
  }, "Received"))))))))));
}
export default App;
