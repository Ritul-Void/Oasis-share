import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const SIGNALING_BASE_URL = "https://pearrtc.publicacc039.workers.dev";
const NICKNAMES = ["Nova", "Starlight", "Orbit", "Zen", "Comet", "Luna", "Ember", "Void", "Pulse", "Echo", "Photon", "Quasar", "Nebula", "Blaze", "Frost", "Vortex", "Pixel", "Nimbus", "Spark", "Glitch"];
const DEFAULT_SETTINGS = {
  chunkSizeOverride: null,
  bufferThreshold: 256,
  connectionTimeout: 20,
  enableLanBoost: true
};
const loadSettings = () => {
  try {
    const raw = localStorage.getItem("oasis-settings");
    if (raw) return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw)
    };
  } catch (_) {}
  return {
    ...DEFAULT_SETTINGS
  };
};
const saveSettings = s => {
  try {
    localStorage.setItem("oasis-settings", JSON.stringify(s));
  } catch (_) {}
};
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
  Link: () => React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  }), React.createElement("path", {
    d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
  })),
  Wifi: () => React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M5 12.55a11 11 0 0 1 14.08 0"
  }), React.createElement("path", {
    d: "M1.42 9a16 16 0 0 1 21.16 0"
  }), React.createElement("path", {
    d: "M8.53 16.11a6 6 0 0 1 6.95 0"
  }), React.createElement("line", {
    x1: "12",
    y1: "20",
    x2: "12.01",
    y2: "20"
  })),
  Disconnect: () => React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("line", {
    x1: "1",
    y1: "1",
    x2: "23",
    y2: "23"
  }), React.createElement("path", {
    d: "M16.72 11.06A10.94 10.94 0 0 1 19 12.55"
  }), React.createElement("path", {
    d: "M5 12.55a10.94 10.94 0 0 1 5.17-2.39"
  }), React.createElement("path", {
    d: "M10.71 5.05A16 16 0 0 1 22.56 9"
  }), React.createElement("path", {
    d: "M1.42 9a15.91 15.91 0 0 1 4.7-2.88"
  }), React.createElement("path", {
    d: "M8.53 16.11a6 6 0 0 1 6.95 0"
  }), React.createElement("line", {
    x1: "12",
    y1: "20",
    x2: "12.01",
    y2: "20"
  })),
  Text: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  })),
  Folder: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
  })),
  Clipboard: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
  }), React.createElement("rect", {
    x: "8",
    y: "2",
    width: "8",
    height: "4",
    rx: "1",
    ry: "1"
  })),
  History: () => React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), React.createElement("polyline", {
    points: "12 6 12 12 16 14"
  })),
  Settings: () => React.createElement("svg", {
    width: "18",
    height: "18",
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
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
  })),
  Plus: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })),
  Back: () => React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("line", {
    x1: "19",
    y1: "12",
    x2: "5",
    y2: "12"
  }), React.createElement("polyline", {
    points: "12 19 5 12 12 5"
  }))
};
function randomUsername() {
  const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${name}#${num}`;
}
const formatBytes = bytes => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const generatePeerId = () => String(Math.floor(100000 + Math.random() * 900000));
function App() {
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [myCode] = useState(generatePeerId);
  const [peerCode, setPeerCode] = useState("");
  const [myUsername] = useState(randomUsername);
  const [peerUsername, setPeerUsername] = useState("");
  const [isLocalNetwork, setIsLocalNetwork] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sendingProgress, setSendingProgress] = useState({});
  const [receivingProgress, setReceivingProgress] = useState({});
  const [userInitiatedConnection, setUserInitiatedConnection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPastePreview, setShowPastePreview] = useState(false);
  const [pasteContent, setPasteContent] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState("sent");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const peerRef = useRef(null);
  const pollingRef = useRef(null);
  const fileQueueRef = useRef([]);
  const cancellationTokensRef = useRef({});
  const bufferLowResolversRef = useRef([]);
  const dataChannelRef = useRef(null);
  const incomingFileRef = useRef(null);
  const activeSendFilesRef = useRef(new Map());
  const receiverWorkerRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const folderInputRef = useRef(null);
  const pendingTextRef = useRef(null);
  const dragCounterRef = useRef(0);
  const BUFFERED_THRESHOLD = (settings.bufferThreshold || 256) * 1024;
  const MAX_QUEUE_BYTES = 4 * 1024 * 1024;
  const BACKOFF_BASE_MS = 150;
  const BACKOFF_MAX_ATTEMPTS = 5;
  const CONNECTION_TIMEOUT = (settings.connectionTimeout || 20) * 1000;
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
        trickle: false,
        channelName: "oasis-file-channel",
        config: {
          iceServers: [{
            urls: "stun:stun.l.google.com:19302"
          }, {
            urls: "stun:stun1.l.google.com:19302"
          }, {
            urls: "stun:stun2.l.google.com:19302"
          }, {
            urls: "stun:stun3.l.google.com:19302"
          }, {
            urls: "stun:stun4.l.google.com:19302"
          }, {
            urls: "stun:stun.l.google.com:19302"
          }, {
            urls: "stun:stun.services.mozilla.com:3478"
          }],
          iceTransportPolicy: "all",
          iceCandidatePoolSize: 10
        },
        offerOptions: {
          offerToReceiveAudio: false,
          offerToReceiveVideo: false
        }
      });
      let signalEventHandled = false;
      p.on("signal", async data => {
        if (initiator && !signalEventHandled) {
          signalEventHandled = true;
          try {
            await apiPost("/api/peer-offer", {
              peerId: id,
              offer: data
            });
            pollForAnswer(id, p);
          } catch (err) {
            console.error("Failed to post offer:", err);
            if (userInitiatedConnection) {
              toast("Failed to post offer to server");
            }
          }
        } else if (!initiator && !signalEventHandled) {
          signalEventHandled = true;
          try {
            await apiPost("/api/peer-answer", {
              peerId: id,
              answer: data
            });
          } catch (err) {
            console.error("Failed to post answer:", err);
            if (userInitiatedConnection) {
              toast("Failed to post answer to server");
            }
          }
        }
      });
      p.on("connect", () => {
        clearInterval(pollingRef.current);
        setConnected(true);
        setIsConnecting(false);
        toast("Secure connection established");
        const dc = p._channel;
        if (dc) {
          dataChannelRef.current = dc;
          dc.binaryType = "arraybuffer";
          dc.bufferedAmountLowThreshold = BUFFERED_THRESHOLD;
          dc.onbufferedamountlow = () => {
            const resolvers = bufferLowResolversRef.current.splice(0);
            resolvers.forEach(r => r());
          };
          logDeviceSnapshot(dc);
        }
        p.send(JSON.stringify({
          type: "username",
          value: myUsername
        }));
        const activeId = isInitiatorRef.current ? myCode : peerCode;
        apiPost(`/api/session/${activeId}/meta`, {}).catch(_ => {});
        setTimeout(() => {
          apiGet(`/api/session/${activeId}/meta`).then(({
            data
          }) => {
            if (data?.isLocalNetwork) {
              setIsLocalNetwork(true);
            }
          }).catch(_ => {});
        }, 1000);
        processFileQueue();
      });
      p.on("data", data => handleIncomingData(data));
      p.on("close", () => {
        const wasConnected = connected;
        setConnected(false);
        setIsConnecting(false);
        setIsLocalNetwork(false);
        if (wasConnected && userInitiatedConnection) {
          toast("Peer disconnected");
        }
        clearInterval(pollingRef.current);
        dataChannelRef.current = null;
        bufferLowResolversRef.current.splice(0).forEach(r => r());
      });
      p.on("error", err => {
        if (userInitiatedConnection) {
          console.error("[oasis] peer error:", err.message || err);
          setConnected(false);
          setIsConnecting(false);
          toast("Connection error: " + (err.message || String(err)));
        }
      });
      const connectionTimeout = setTimeout(() => {
        if (!connected && p._pc && userInitiatedConnection) {
          const finalIceState = p._pc.iceConnectionState;
          if (finalIceState !== "connected" && finalIceState !== "completed") {
            try {
              p.destroy();
            } catch (_) {}
            setConnected(false);
            setIsConnecting(false);
            toast("Connection timeout — make sure both devices are on the same network");
          }
        }
      }, CONNECTION_TIMEOUT);
      const originalOnConnect = p.listeners("connect")?.[0];
      if (originalOnConnect) {
        p.removeListener("connect", originalOnConnect);
        p.on("connect", () => {
          clearTimeout(connectionTimeout);
          originalOnConnect();
        });
      }
      const originalOnError = p.listeners("error")?.[0];
      if (originalOnError) {
        p.removeListener("error", originalOnError);
        p.on("error", err => {
          clearTimeout(connectionTimeout);
          originalOnError(err);
        });
      }
      const originalOnClose = p.listeners("close")?.[0];
      if (originalOnClose) {
        p.removeListener("close", originalOnClose);
        p.on("close", () => {
          clearTimeout(connectionTimeout);
          originalOnClose();
        });
      }
      peerRef.current = p;
    } catch (e) {
      setIsConnecting(false);
      toast("Failed to initialize peer");
    }
  };
  const pollForAnswer = (id, p) => {
    let pollCount = 0;
    let answerSignaled = false;
    pollingRef.current = setInterval(async () => {
      if (answerSignaled) return;
      pollCount += 1;
      const {
        status,
        data
      } = await apiGet(`/api/peer-answer/${id}`);
      if (status === 200 && data.answer) {
        answerSignaled = true;
        clearInterval(pollingRef.current);
        p.signal(data.answer);
      } else if (pollCount > 120) {
        answerSignaled = true;
        clearInterval(pollingRef.current);
        try {
          p.destroy();
        } catch (_) {}
        setIsConnecting(false);
        if (userInitiatedConnection) {
          toast("Connection timeout — peer did not respond");
        }
      }
    }, 1000);
  };
  const initAsInitiator = () => {
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (_) {}
    }
    clearInterval(pollingRef.current);
    isInitiatorRef.current = true;
    initPeer(true, myCode);
  };
  const handleConnect = async () => {
    if (!peerCode || peerCode.length !== 6) {
      toast("Enter a valid 6-digit code");
      return;
    }
    setUserInitiatedConnection(true);
    setIsConnecting(true);
    try {
      clearInterval(pollingRef.current);
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch (_) {}
      }
      let offerData = null;
      let offerFound = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const {
          status,
          data
        } = await apiGet(`/api/peer-offer/${peerCode}`);
        if (status === 200 && data.offer) {
          offerData = data;
          offerFound = true;
          break;
        }
        if (attempt < 4) {
          await new Promise(res => setTimeout(res, (attempt + 1) * 200));
        }
      }
      if (offerFound && offerData) {
        isInitiatorRef.current = false;
        initPeer(false, peerCode);
        setTimeout(() => {
          if (peerRef.current) {
            peerRef.current.signal(offerData.offer);
          }
        }, 100);
      } else {
        toast("Code not found — make sure the other device is ready");
        initAsInitiator();
        setIsConnecting(false);
      }
    } catch (e) {
      console.error("handleConnect error:", e);
      toast("Connection error");
      initAsInitiator();
      setIsConnecting(false);
    }
  };
  const detectMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
  const getAdaptiveChunkSize = () => {
    if (settings.chunkSizeOverride) return settings.chunkSizeOverride * 1024;
    const dm = navigator.deviceMemory || 4;
    const isMobile = detectMobile();
    const lan = isLocalNetwork && settings.enableLanBoost;
    if (lan) {
      return isMobile ? 128 * 1024 : 512 * 1024;
    }
    if (isMobile) {
      if (dm <= 2) return 16 * 1024;
      if (dm <= 4) return 24 * 1024;
      return 32 * 1024;
    }
    if (dm >= 8) return 128 * 1024;
    return 96 * 1024;
  };
  const waitForDataChannelBuffer = dc => {
    if (!dc) return Promise.resolve();
    if (dc.bufferedAmount <= BUFFERED_THRESHOLD) return Promise.resolve();
    return new Promise(resolve => bufferLowResolversRef.current.push(resolve));
  };
  const sendWithRetry = async (dc, payload) => {
    let attempt = 0;
    while (true) {
      try {
        await waitForDataChannelBuffer(dc);
        dc.send(payload);
        return;
      } catch (err) {
        attempt += 1;
        if (attempt > BACKOFF_MAX_ATTEMPTS) throw err;
        const delay = Math.min(BACKOFF_BASE_MS * 2 ** (attempt - 1), 2000);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  };
  const logDeviceSnapshot = dc => {
    try {} catch (_) {}
  };
  const createWritableSink = async meta => {
    if (window.showSaveFilePicker && window.WritableStream) {
      const handle = await window.showSaveFilePicker({
        suggestedName: meta.name
      });
      const writable = await handle.createWritable();
      let position = meta.startOffset || 0;
      if (position > 0) await writable.write({
        type: "seek",
        position
      });
      return {
        mode: "file-system",
        write: async chunk => {
          await writable.write({
            type: "write",
            position,
            data: chunk
          });
          position += chunk.byteLength;
        },
        seek: async pos => {
          await writable.write({
            type: "seek",
            position: pos
          });
          position = pos;
        },
        close: () => writable.close(),
        abort: () => writable.abort()
      };
    }
    if (window.streamSaver) {
      const fileStream = window.streamSaver.createWriteStream(meta.name, {
        size: meta.size
      });
      const writer = fileStream.getWriter();
      return {
        mode: "stream-saver",
        write: chunk => writer.write(chunk),
        close: () => writer.close(),
        abort: () => writer.abort?.()
      };
    }
    const fallbackChunks = [];
    return {
      mode: "memory",
      write: async chunk => fallbackChunks.push(chunk),
      close: async () => {
        const blob = new Blob(fallbackChunks);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = meta.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      abort: async () => {
        fallbackChunks.length = 0;
      }
    };
  };
  const resetIncomingState = async fileId => {
    const state = incomingFileRef.current;
    if (state && (!fileId || state.fileId === fileId)) {
      try {
        await state.sink?.abort?.();
      } catch (_) {}
    }
    incomingFileRef.current = null;
  };
  const sendControlMessage = payload => {
    if (!peerRef.current) return;
    peerRef.current.send(JSON.stringify(payload));
  };
  const requestResume = (fileId, offset = 0) => {
    sendControlMessage({
      type: "resume-file",
      fileId,
      offset
    });
  };
  const enqueueIncomingChunk = chunk => {
    const state = incomingFileRef.current;
    if (!state) return;
    state.queue.push(chunk);
    state.queueBytes += chunk.byteLength;
    if (!state.flushPromise) {
      state.flushPromise = (async () => {
        while (state.queue.length > 0) {
          const next = state.queue.shift();
          state.queueBytes -= next.byteLength;
          await state.sink.write(next);
          state.receivedBytes += next.byteLength;
          const progress = state.receivedBytes / state.size * 100;
          const elapsedTime = (Date.now() - state.startTime) / 1000;
          const speed = state.receivedBytes / elapsedTime / 1024;
          setReceivingProgress(prev => ({
            ...prev,
            [state.fileId]: {
              ...prev[state.fileId],
              receivedBytes: state.receivedBytes,
              progress,
              speed
            }
          }));
        }
      })().catch(async err => {
        console.error("Error writing incoming chunk", err);
        sendControlMessage({
          type: "cancel-file",
          fileId: state.fileId
        });
        requestResume(state.fileId, state.receivedBytes);
        await resetIncomingState(state.fileId);
        setReceivingProgress(prev => {
          const n = {
            ...prev
          };
          delete n[state.fileId];
          return n;
        });
        toast("Incoming transfer halted; attempting resume");
      }).finally(() => {
        const active = incomingFileRef.current;
        if (active) active.flushPromise = null;
      });
    }
    if (state.queueBytes > MAX_QUEUE_BYTES) {}
  };
  const handleIncomingChunk = chunk => {
    if (!(chunk instanceof Uint8Array)) chunk = new Uint8Array(chunk);
    receiverWorkerRef.current.postMessage({
      type: "chunk",
      payload: chunk
    }, [chunk.buffer]);
  };
  const handleControlMessage = async msg => {
    if (msg.type === "username") {
      setPeerUsername(msg.value);
      return;
    }
    if (msg.type === "text-message") {
      setMessageHistory(prev => [...prev, {
        id: msg.messageId,
        content: msg.content,
        direction: "received",
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now()
      }]);
      toast("Text message received");
      return;
    }
    if (msg.type === "file-meta") {
      incomingFileRef.current = {
        ...msg,
        startTime: Date.now()
      };
      receiverWorkerRef.current.postMessage({
        type: "meta",
        payload: msg
      });
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
      receiverWorkerRef.current.postMessage({
        type: "end"
      });
      return;
    }
    if (msg.type === "cancel-file") {
      if (cancellationTokensRef.current[msg.fileId] !== undefined) {
        cancellationTokensRef.current[msg.fileId] = true;
      }
      await resetIncomingState(msg.fileId);
      setReceivingProgress(prev => {
        const n = {
          ...prev
        };
        delete n[msg.fileId];
        return n;
      });
      toast("Transfer cancelled");
      return;
    }
    if (msg.type === "resume-file") {
      const sourceFile = activeSendFilesRef.current.get(msg.fileId);
      if (sourceFile) {
        await sendFileInChunks(sourceFile, {
          fileId: msg.fileId,
          startOffset: msg.offset || 0,
          isResume: true
        });
      }
    }
  };
  const sendFileInChunks = async (file, options = {}) => {
    const fileId = options.fileId || `${file.name}-${file.size}-${Date.now()}`;
    const startOffset = options.startOffset || 0;
    const startTime = Date.now();
    const dc = dataChannelRef.current || peerRef.current?._channel;
    let keepForResume = false;
    if (!dc) {
      toast("Data channel not ready");
      return;
    }
    dataChannelRef.current = dc;
    cancellationTokensRef.current[fileId] = false;
    activeSendFilesRef.current.set(fileId, file);
    setSendingProgress(prev => ({
      ...prev,
      [fileId]: {
        progress: startOffset / file.size * 100,
        speed: 0,
        startTime,
        status: options.isResume ? "resuming" : "sending",
        size: file.size,
        name: file.name,
        fileId
      }
    }));
    try {
      await sendWithRetry(dc, JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        fileId,
        startOffset
      }));
      logDeviceSnapshot(dc);
      const reader = file.slice(startOffset).stream().getReader();
      const chunkSize = getAdaptiveChunkSize();
      let offset = startOffset;
      let done = false;
      while (!done) {
        const {
          value,
          done: streamDone
        } = await reader.read();
        if (streamDone || !value) {
          done = true;
          break;
        }
        let cursor = 0;
        while (cursor < value.length) {
          if (cancellationTokensRef.current[fileId]) {
            sendControlMessage({
              type: "cancel-file",
              fileId
            });
            keepForResume = true;
            setSendingProgress(prev => {
              const n = {
                ...prev
              };
              delete n[fileId];
              return n;
            });
            toast(`Transfer of ${file.name} cancelled`);
            return;
          }
          const slice = value.subarray(cursor, cursor + chunkSize);
          await sendWithRetry(dc, new Uint8Array(slice));
          offset += slice.byteLength;
          cursor += slice.byteLength;
          const progress = offset / file.size * 100;
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = offset / elapsedTime / 1024;
          setSendingProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress,
              speed
            }
          }));
        }
      }
      await sendWithRetry(dc, JSON.stringify({
        type: "file-end",
        fileId
      }));
      setSentFiles(s => [...s, {
        name: file.name,
        size: file.size,
        time: new Date().toLocaleTimeString(),
        fileId,
        status: "completed"
      }]);
    } catch (error) {
      console.error("Error sending file:", error);
      toast(`Error sending ${file.name}`);
      sendControlMessage({
        type: "cancel-file",
        fileId
      });
      keepForResume = true;
      try {
        peerRef.current?.destroy?.();
        setConnected(false);
      } catch (_) {}
    } finally {
      setSendingProgress(prev => {
        const n = {
          ...prev
        };
        delete n[fileId];
        return n;
      });
      delete cancellationTokensRef.current[fileId];
      if (!keepForResume) activeSendFilesRef.current.delete(fileId);
    }
  };
  const processFileQueue = async () => {
    if (!peerRef.current || !connected) return;
    while (fileQueueRef.current.length > 0) {
      const file = fileQueueRef.current.shift();
      await sendFileInChunks(file);
    }
    setSelectedFiles([]);
  };
  const handleIncomingData = data => {
    if (typeof data === "string") {
      handleControlMessage(JSON.parse(data)).catch(err => console.error("control message error", err));
      return;
    }
    if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      if (bytes[0] === 123 || bytes[0] === 91 || bytes[0] === 34) {
        try {
          const text = new TextDecoder().decode(bytes);
          if (text.startsWith("{") || text.startsWith("[") || text.startsWith('"')) {
            handleControlMessage(JSON.parse(text)).catch(err => console.error("control message error", err));
            return;
          }
        } catch (_) {}
      }
      handleIncomingChunk(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
      return;
    }
    if (data?.buffer) {
      handleIncomingChunk(new Uint8Array(data.buffer));
      return;
    }
  };
  const handleDisconnect = () => {
    Object.keys(cancellationTokensRef.current).forEach(id => {
      cancellationTokensRef.current[id] = true;
    });
    fileQueueRef.current = [];
    setSelectedFiles([]);
    setSendingProgress({});
    setReceivingProgress({});
    setPeerUsername("");
    setPeerCode("");
    setIsLocalNetwork(false);
    setConnected(false);
    setIsConnecting(false);
    dataChannelRef.current = null;
    bufferLowResolversRef.current.splice(0).forEach(r => r());
    incomingFileRef.current = null;
    clearInterval(pollingRef.current);
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (_) {}
    }
    receiverWorkerRef.current?.postMessage({
      type: "abort"
    });
    toast("Disconnected");
    setTimeout(() => initAsInitiator(), 200);
  };
  const handleCancelReceive = fileId => {
    sendControlMessage({
      type: "cancel-file",
      fileId
    });
    receiverWorkerRef.current?.postMessage({
      type: "abort"
    });
    incomingFileRef.current = null;
    setReceivingProgress(prev => {
      const n = {
        ...prev
      };
      delete n[fileId];
      return n;
    });
    toast("Cancelled incoming transfer");
  };
  const handleSendText = () => {
    if (!textInput.trim()) return;
    if (!connected) {
      pendingTextRef.current = {
        content: textInput.trim()
      };
      setTextInput("");
      setShowTextModal(false);
      toast("Text saved — will send when connected");
      return;
    }
    const messageId = `text-${Date.now()}`;
    sendControlMessage({
      type: "text-message",
      content: textInput.trim(),
      messageId
    });
    setMessageHistory(prev => [...prev, {
      id: messageId,
      content: textInput.trim(),
      direction: "sent",
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    }]);
    setTextInput("");
    setShowTextModal(false);
    toast("Text sent");
  };
  const handleDroppedFiles = files => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map(f => ({
      file: f,
      name: f.webkitRelativePath || f.name,
      size: f.size,
      tempId: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
    fileQueueRef.current = [...fileQueueRef.current, ...newFiles.map(i => i.file)];
    if (connected) processFileQueue();
  };
  const handleDragEnter = e => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };
  const handleDragOver = e => {
    e.preventDefault();
  };
  const handleDrop = e => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    handleDroppedFiles(e.dataTransfer.files);
  };
  const handleFolderChange = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = files.map(f => ({
      file: f,
      name: f.webkitRelativePath || f.name,
      size: f.size,
      tempId: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
    fileQueueRef.current = [...fileQueueRef.current, ...files];
    if (connected) processFileQueue();
    e.target.value = "";
  };
  const handleSharePaste = async () => {
    try {
      if (navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(t => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split("/")[1] || "png";
            const file = new File([blob], `clipboard-image.${ext}`, {
              type: imageType
            });
            setPasteContent({
              type: "image",
              data: URL.createObjectURL(blob),
              file
            });
            setShowPastePreview(true);
            return;
          }
          if (item.types.includes("text/plain")) {
            const blob = await item.getType("text/plain");
            const text = await blob.text();
            if (text.trim()) {
              setPasteContent({
                type: "text",
                data: text.trim()
              });
              setShowPastePreview(true);
              return;
            }
          }
        }
        toast("Nothing to paste");
      } else {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          setPasteContent({
            type: "text",
            data: text.trim()
          });
          setShowPastePreview(true);
        } else {
          toast("Nothing to paste");
        }
      }
    } catch (err) {
      toast("Clipboard access denied");
    }
  };
  const handleConfirmPaste = () => {
    if (!pasteContent) return;
    if (pasteContent.type === "text") {
      if (!connected) {
        pendingTextRef.current = {
          content: pasteContent.data
        };
        setShowPastePreview(false);
        setPasteContent(null);
        toast("Text saved — will send when connected");
        return;
      }
      const messageId = `paste-${Date.now()}`;
      sendControlMessage({
        type: "text-message",
        content: pasteContent.data,
        messageId
      });
      setMessageHistory(prev => [...prev, {
        id: messageId,
        content: pasteContent.data,
        direction: "sent",
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now()
      }]);
      toast("Pasted text sent");
    } else if (pasteContent.type === "image" && pasteContent.file) {
      const f = pasteContent.file;
      const item = {
        file: f,
        name: f.name,
        size: f.size,
        tempId: `${f.name}-${f.size}-${Date.now()}`
      };
      setSelectedFiles(prev => [...prev, item]);
      fileQueueRef.current = [...fileQueueRef.current, f];
      if (connected) processFileQueue();
      toast("Image added to queue");
    }
    setShowPastePreview(false);
    setPasteContent(null);
  };
  const updateSettings = patch => {
    setSettings(prev => {
      const next = {
        ...prev,
        ...patch
      };
      saveSettings(next);
      return next;
    });
  };
  useEffect(() => {
    receiverWorkerRef.current = new Worker(new URL("./fileReceiver.worker.js", import.meta.url), {
      type: "module"
    });
    receiverWorkerRef.current.onmessage = e => {
      const {
        type,
        blob,
        name,
        receivedBytes,
        size,
        fileId
      } = e.data;
      if (type === "progress") {
        const elapsedTime = (Date.now() - (incomingFileRef.current?.startTime || Date.now())) / 1000;
        const speed = receivedBytes / elapsedTime / 1024;
        setReceivingProgress(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            receivedBytes,
            progress: receivedBytes / size * 100,
            speed
          }
        }));
      }
      if (type === "done") {
        triggerDownload(blob, name, fileId, receivedBytes);
      }
    };
    initAsInitiator();
    return () => {
      clearInterval(pollingRef.current);
      try {
        peerRef.current?.destroy();
      } catch (_) {}
      receiverWorkerRef.current?.terminate();
    };
  }, []);
  useEffect(() => {
    if (!connected) return;
    if (pendingTextRef.current) {
      const {
        content
      } = pendingTextRef.current;
      const messageId = `text-${Date.now()}`;
      sendControlMessage({
        type: "text-message",
        content,
        messageId
      });
      setMessageHistory(prev => [...prev, {
        id: messageId,
        content,
        direction: "sent",
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now()
      }]);
      pendingTextRef.current = null;
      toast("Queued text sent");
    }
    if (fileQueueRef.current.length > 0) processFileQueue();
  }, [connected]);
  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCodeCopied(true);
    toast("Code copied");
    setTimeout(() => setCodeCopied(false), 2000);
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
    if (connected) processFileQueue();
    e.target.value = "";
  };
  const handleRemoveSelectedFile = tempIdToRemove => {
    const item = selectedFiles.find(f => f.tempId === tempIdToRemove);
    if (item) fileQueueRef.current = fileQueueRef.current.filter(f => f !== item.file);
    setSelectedFiles(prev => prev.filter(f => f.tempId !== tempIdToRemove));
  };
  const handleCancelSend = fileId => {
    if (cancellationTokensRef.current[fileId] !== undefined) {
      cancellationTokensRef.current[fileId] = true;
      toast("Cancelling...");
    }
  };
  const triggerDownload = (blob, name, fileId, receivedBytes) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      const duration = (Date.now() - (incomingFileRef.current?.startTime || Date.now())) / 1000;
      const speed = (receivedBytes / duration / 1024).toFixed(2);
      setReceivedFiles(r => [...r, {
        name,
        size: receivedBytes,
        time: new Date().toLocaleTimeString(),
        speed,
        fileId,
        status: "completed"
      }]);
      incomingFileRef.current = null;
      setReceivingProgress(prev => {
        const n = {
          ...prev
        };
        delete n[fileId];
        return n;
      });
      toast(`Received ${name}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast(`Error saving ${name}`);
    }
  };
  const allTransfers = [...Object.values(sendingProgress).map(f => ({
    ...f,
    direction: "up"
  })), ...Object.values(receivingProgress).map(f => ({
    ...f,
    direction: "down"
  }))];
  const unifiedHistory = [...sentFiles.map(f => ({
    ...f,
    direction: "sent"
  })), ...receivedFiles.map(f => ({
    ...f,
    direction: "received"
  }))].sort((a, b) => 0);
  const hasActiveTransfers = allTransfers.length > 0;
  return React.createElement("div", {
    className: "app-layout",
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop
  }, isDragging && React.createElement("div", {
    className: "drag-overlay"
  }, React.createElement("div", {
    className: "drag-overlay-inner"
  }, React.createElement(Icons.Upload, null), React.createElement("span", null, "Drop files to share"))), React.createElement("div", {
    className: "app-container dark-mode"
  }, React.createElement("header", {
    className: "app-header"
  }, React.createElement("div", {
    className: "brand"
  }, React.createElement("div", {
    className: "brand-icon"
  }, React.createElement("img", {
    src: "/oasis-logo-share.png",
    alt: "Oasis-Share Logo",
    style: {
      width: "22px",
      height: "22px"
    }
  })), React.createElement("h1", null, "Oasis-Share")), React.createElement("div", {
    className: "header-right"
  }, React.createElement("button", {
    className: "header-icon-btn",
    onClick: () => {
      setShowHistory(true);
      setShowSettings(false);
    },
    title: "History"
  }, React.createElement(Icons.History, null)), React.createElement("button", {
    className: "header-icon-btn",
    onClick: () => {
      setShowSettings(true);
      setShowHistory(false);
    },
    title: "Settings"
  }, React.createElement(Icons.Settings, null)), React.createElement("div", {
    className: "user-pill"
  }, React.createElement("span", {
    className: "status-dot-sm",
    style: {
      background: connected ? "#4CAF50" : "#9E9E9E"
    }
  }), React.createElement("span", null, myUsername)))), React.createElement("main", {
    className: "main-stage"
  }, !connected && React.createElement("div", {
    className: "connection-panel fade-in"
  }, React.createElement("div", {
    className: "panel-row"
  }, React.createElement("div", {
    className: "panel-card"
  }, React.createElement("h3", {
    className: "panel-label"
  }, "Your Code"), React.createElement("div", {
    className: "code-block",
    onClick: copyCode
  }, React.createElement("span", {
    className: "code-digits"
  }, myCode), React.createElement("button", {
    className: "copy-btn",
    type: "button"
  }, codeCopied ? React.createElement(Icons.Check, null) : React.createElement(Icons.Copy, null), React.createElement("span", null, codeCopied ? "Copied" : "Copy"))), React.createElement("p", {
    className: "panel-hint"
  }, "Share this code with someone to connect")), React.createElement("div", {
    className: "panel-divider"
  }, React.createElement("span", null, "or")), React.createElement("div", {
    className: "panel-card"
  }, React.createElement("h3", {
    className: "panel-label"
  }, "Enter Code"), React.createElement("div", {
    className: "code-input-row"
  }, React.createElement("input", {
    type: "text",
    inputMode: "numeric",
    maxLength: 6,
    placeholder: "6-digit code",
    value: peerCode,
    onChange: e => setPeerCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
    onKeyDown: e => e.key === "Enter" && handleConnect()
  }), React.createElement("button", {
    className: "connect-btn",
    onClick: handleConnect,
    disabled: isConnecting
  }, React.createElement(Icons.Link, null), React.createElement("span", null, isConnecting ? "Connecting..." : "Connect"))))), isConnecting && React.createElement("div", {
    className: "connecting-indicator"
  }, React.createElement("div", {
    className: "spinner"
  }), React.createElement("span", null, "Looking for peer..."))), connected && React.createElement("div", {
    className: "connected-banner fade-in"
  }, React.createElement("div", {
    className: "banner-left"
  }, React.createElement("span", {
    className: "status-dot-sm",
    style: {
      background: "#4CAF50"
    }
  }), React.createElement("span", null, "Connected to ", React.createElement("strong", null, peerUsername || "Peer"))), React.createElement("div", {
    className: "banner-right"
  }, isLocalNetwork && React.createElement("div", {
    className: "lan-badge"
  }, React.createElement(Icons.Wifi, null), React.createElement("span", null, "Local Network")), React.createElement("button", {
    className: "disconnect-btn",
    onClick: handleDisconnect
  }, React.createElement(Icons.Disconnect, null), React.createElement("span", null, "Disconnect")))), !showHistory && !showSettings && React.createElement("div", {
    className: "dashboard fade-in"
  }, React.createElement("div", {
    className: "upload-area"
  }, React.createElement("div", {
    className: "share-menu"
  }, React.createElement("label", {
    className: "share-menu-item"
  }, React.createElement(Icons.Upload, null), React.createElement("span", null, "Share File"), React.createElement("input", {
    type: "file",
    multiple: true,
    onChange: handleFileChange,
    hidden: true
  })), React.createElement("button", {
    className: "share-menu-item",
    onClick: () => setShowTextModal(true)
  }, React.createElement(Icons.Text, null), React.createElement("span", null, "Share Text")), React.createElement("button", {
    className: "share-menu-item",
    onClick: () => folderInputRef.current?.click()
  }, React.createElement(Icons.Folder, null), React.createElement("span", null, "Share Folder")), React.createElement("button", {
    className: "share-menu-item",
    onClick: handleSharePaste
  }, React.createElement(Icons.Clipboard, null), React.createElement("span", null, "Share Paste"))), React.createElement("input", {
    ref: folderInputRef,
    type: "file",
    webkitdirectory: "",
    directory: "",
    multiple: true,
    onChange: handleFolderChange,
    hidden: true
  }), !connected && selectedFiles.length === 0 && React.createElement("p", {
    className: "queue-hint"
  }, "Drop files anywhere to add them to the queue"), !connected && selectedFiles.length > 0 && React.createElement("p", {
    className: "queue-hint"
  }, "Files will send once connected")), selectedFiles.length > 0 && React.createElement("div", {
    className: "section"
  }, React.createElement("h6", {
    className: "section-title"
  }, "Queue (", selectedFiles.length, ")"), React.createElement("div", {
    className: "file-grid"
  }, selectedFiles.map(f => React.createElement("div", {
    key: f.tempId,
    className: "file-card"
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
    className: "icon-btn-sm",
    "aria-label": "Remove file"
  }, React.createElement(Icons.X, null)))))), hasActiveTransfers && React.createElement("div", {
    className: "section"
  }, React.createElement("h6", {
    className: "section-title"
  }, "Active Transfers"), React.createElement("div", {
    className: "transfers-list"
  }, allTransfers.map(f => React.createElement("div", {
    key: f.fileId,
    className: "transfer-row"
  }, React.createElement("div", {
    className: `direction-icon ${f.direction}`
  }, f.direction === "up" ? React.createElement(Icons.Upload, null) : React.createElement(Icons.Download, null)), React.createElement("div", {
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
  }, React.createElement("span", null, formatBytes(f.size)), React.createElement("span", null, f.progress.toFixed(0), "%"), f.direction === "up" && React.createElement("button", {
    className: "text-btn cancel",
    onClick: () => handleCancelSend(f.fileId)
  }, "Cancel"), f.direction === "down" && React.createElement("button", {
    className: "text-btn cancel",
    onClick: () => handleCancelReceive(f.fileId)
  }, "Cancel"))))))), React.createElement("div", {
    className: "section grow"
  }, React.createElement("h6", {
    className: "section-title"
  }, "Recent"), React.createElement("div", {
    className: "history-list"
  }, unifiedHistory.length === 0 && messageHistory.length === 0 ? React.createElement("div", {
    className: "empty-state"
  }, connected ? "Send or receive files to see them here" : "Connect to a device to start sharing") : [...unifiedHistory, ...messageHistory.map(m => ({
    name: m.content.slice(0, 40) + (m.content.length > 40 ? "..." : ""),
    size: null,
    time: m.time,
    direction: m.direction,
    fileId: m.id,
    isText: true
  }))].sort((a, b) => 0).slice(0, 5).map((f, i) => React.createElement("div", {
    key: (f.fileId || i) + i,
    className: "history-item"
  }, React.createElement("div", {
    className: `history-icon ${f.direction}`
  }, f.isText ? React.createElement(Icons.Text, null) : f.direction === "sent" ? React.createElement(Icons.Upload, null) : React.createElement(Icons.Download, null)), React.createElement("div", {
    className: "file-data"
  }, React.createElement("span", {
    className: "filename"
  }, f.name), React.createElement("div", {
    className: "subtext"
  }, f.size != null && React.createElement(React.Fragment, null, React.createElement("span", null, formatBytes(f.size)), React.createElement("span", {
    className: "sep"
  }, "\u2022")), React.createElement("span", null, f.time), React.createElement("span", {
    className: `tag ${f.direction}`
  }, f.direction === "sent" ? "Sent" : "Received")))))))), showHistory && React.createElement("div", {
    className: "history-screen fade-in"
  }, React.createElement("div", {
    className: "overlay-header"
  }, React.createElement("button", {
    className: "back-btn",
    onClick: () => setShowHistory(false)
  }, React.createElement(Icons.Back, null), React.createElement("span", null, "Back")), React.createElement("h2", null, "Share History")), React.createElement("div", {
    className: "history-tabs"
  }, React.createElement("button", {
    className: `tab-btn ${historyTab === "sent" ? "active" : ""}`,
    onClick: () => setHistoryTab("sent")
  }, "Sent"), React.createElement("button", {
    className: `tab-btn ${historyTab === "received" ? "active" : ""}`,
    onClick: () => setHistoryTab("received")
  }, "Received"), React.createElement("button", {
    className: `tab-btn ${historyTab === "messages" ? "active" : ""}`,
    onClick: () => setHistoryTab("messages")
  }, "Messages")), React.createElement("div", {
    className: "history-list full"
  }, historyTab === "sent" && (sentFiles.length === 0 ? React.createElement("div", {
    className: "empty-state"
  }, "No sent files yet") : sentFiles.map((f, i) => React.createElement("div", {
    key: f.fileId + i,
    className: "history-item"
  }, React.createElement("div", {
    className: "history-icon sent"
  }, React.createElement(Icons.Upload, null)), React.createElement("div", {
    className: "file-data"
  }, React.createElement("span", {
    className: "filename"
  }, f.name), React.createElement("div", {
    className: "subtext"
  }, React.createElement("span", null, formatBytes(f.size)), React.createElement("span", {
    className: "sep"
  }, "\u2022"), React.createElement("span", null, f.time)))))), historyTab === "received" && (receivedFiles.length === 0 ? React.createElement("div", {
    className: "empty-state"
  }, "No received files yet") : receivedFiles.map((f, i) => React.createElement("div", {
    key: f.fileId + i,
    className: "history-item"
  }, React.createElement("div", {
    className: "history-icon received"
  }, React.createElement(Icons.Download, null)), React.createElement("div", {
    className: "file-data"
  }, React.createElement("span", {
    className: "filename"
  }, f.name), React.createElement("div", {
    className: "subtext"
  }, React.createElement("span", null, formatBytes(f.size)), React.createElement("span", {
    className: "sep"
  }, "\u2022"), React.createElement("span", null, f.time), f.speed && React.createElement(React.Fragment, null, React.createElement("span", {
    className: "sep"
  }, "\u2022"), React.createElement("span", null, f.speed, " KB/s"))))))), historyTab === "messages" && (messageHistory.length === 0 ? React.createElement("div", {
    className: "empty-state"
  }, "No messages yet") : messageHistory.map(m => React.createElement("div", {
    key: m.id,
    className: "history-item"
  }, React.createElement("div", {
    className: `history-icon ${m.direction}`
  }, React.createElement(Icons.Text, null)), React.createElement("div", {
    className: "file-data"
  }, React.createElement("span", {
    className: "filename"
  }, m.content.length > 80 ? m.content.slice(0, 80) + "..." : m.content), React.createElement("div", {
    className: "subtext"
  }, React.createElement("span", null, m.time), React.createElement("span", {
    className: `tag ${m.direction}`
  }, m.direction === "sent" ? "Sent" : "Received")))))))), showSettings && React.createElement("div", {
    className: "settings-screen fade-in"
  }, React.createElement("div", {
    className: "overlay-header"
  }, React.createElement("button", {
    className: "back-btn",
    onClick: () => setShowSettings(false)
  }, React.createElement(Icons.Back, null), React.createElement("span", null, "Back")), React.createElement("h2", null, "Settings")), React.createElement("div", {
    className: "settings-body"
  }, React.createElement("div", {
    className: "setting-group"
  }, React.createElement("h3", {
    className: "setting-group-title"
  }, "Transfer"), React.createElement("div", {
    className: "setting-row"
  }, React.createElement("div", {
    className: "setting-label"
  }, React.createElement("span", null, "Chunk Size"), React.createElement("span", {
    className: "setting-hint"
  }, "Override auto-adaptive chunk size (KB). Leave empty for auto.")), React.createElement("input", {
    type: "number",
    className: "setting-input",
    placeholder: "Auto",
    value: settings.chunkSizeOverride ?? "",
    onChange: e => {
      const v = e.target.value === "" ? null : Math.max(8, Math.min(2048, Number(e.target.value)));
      updateSettings({
        chunkSizeOverride: v
      });
    },
    min: 8,
    max: 2048
  })), React.createElement("div", {
    className: "setting-row"
  }, React.createElement("div", {
    className: "setting-label"
  }, React.createElement("span", null, "Buffer Threshold (KB)"), React.createElement("span", {
    className: "setting-hint"
  }, "Send backpressure threshold. Higher = more buffering.")), React.createElement("input", {
    type: "number",
    className: "setting-input",
    value: settings.bufferThreshold,
    onChange: e => updateSettings({
      bufferThreshold: Math.max(64, Math.min(2048, Number(e.target.value) || 256))
    }),
    min: 64,
    max: 2048
  })), React.createElement("div", {
    className: "setting-row"
  }, React.createElement("div", {
    className: "setting-label"
  }, React.createElement("span", null, "LAN Speed Boost"), React.createElement("span", {
    className: "setting-hint"
  }, "Use larger chunks on local network (512 KB desktop, 128 KB mobile).")), React.createElement("label", {
    className: "toggle"
  }, React.createElement("input", {
    type: "checkbox",
    checked: settings.enableLanBoost,
    onChange: e => updateSettings({
      enableLanBoost: e.target.checked
    })
  }), React.createElement("span", {
    className: "toggle-slider"
  })))), React.createElement("div", {
    className: "setting-group"
  }, React.createElement("h3", {
    className: "setting-group-title"
  }, "Connection"), React.createElement("div", {
    className: "setting-row"
  }, React.createElement("div", {
    className: "setting-label"
  }, React.createElement("span", null, "Connection Timeout (seconds)"), React.createElement("span", {
    className: "setting-hint"
  }, "How long to wait before giving up on a connection.")), React.createElement("input", {
    type: "number",
    className: "setting-input",
    value: settings.connectionTimeout,
    onChange: e => updateSettings({
      connectionTimeout: Math.max(5, Math.min(120, Number(e.target.value) || 20))
    }),
    min: 5,
    max: 120
  }))), React.createElement("div", {
    className: "setting-group"
  }, React.createElement("h3", {
    className: "setting-group-title"
  }, "Current Session Info"), React.createElement("div", {
    className: "setting-info"
  }, React.createElement("span", null, "Effective chunk size: ", React.createElement("strong", null, formatBytes(getAdaptiveChunkSize()))), React.createElement("span", null, "Buffer threshold: ", React.createElement("strong", null, formatBytes(BUFFERED_THRESHOLD))), React.createElement("span", null, "Connection timeout: ", React.createElement("strong", null, settings.connectionTimeout, "s")), React.createElement("span", null, "Device memory: ", React.createElement("strong", null, navigator.deviceMemory || "unknown", " GB")), React.createElement("span", null, "Platform: ", React.createElement("strong", null, detectMobile() ? "Mobile" : "Desktop")), React.createElement("span", null, "Network: ", React.createElement("strong", null, isLocalNetwork ? "LAN" : "WAN")))))), React.createElement("div", {
    className: "app-footer"
  }, "Oasis-Share v3.1 \u2022 spdc runtime v2 \u2022 codebyritul@gmail.com"))), showTextModal && React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setShowTextModal(false)
  }, React.createElement("div", {
    className: "modal-box",
    onClick: e => e.stopPropagation()
  }, React.createElement("h3", null, "Share Text"), React.createElement("textarea", {
    className: "modal-textarea",
    placeholder: "Type or paste text to share...",
    value: textInput,
    onChange: e => setTextInput(e.target.value),
    autoFocus: true,
    rows: 5
  }), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "modal-btn secondary",
    onClick: () => {
      setShowTextModal(false);
      setTextInput("");
    }
  }, "Cancel"), React.createElement("button", {
    className: "modal-btn primary",
    onClick: handleSendText,
    disabled: !textInput.trim()
  }, "Send")))), showPastePreview && pasteContent && React.createElement("div", {
    className: "modal-overlay",
    onClick: () => {
      setShowPastePreview(false);
      setPasteContent(null);
    }
  }, React.createElement("div", {
    className: "modal-box",
    onClick: e => e.stopPropagation()
  }, React.createElement("h3", null, "Paste Preview"), pasteContent.type === "text" && React.createElement("div", {
    className: "paste-preview-text"
  }, pasteContent.data.length > 500 ? pasteContent.data.slice(0, 500) + "..." : pasteContent.data), pasteContent.type === "image" && React.createElement("div", {
    className: "paste-preview-image"
  }, React.createElement("img", {
    src: pasteContent.data,
    alt: "Clipboard"
  })), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "modal-btn secondary",
    onClick: () => {
      setShowPastePreview(false);
      setPasteContent(null);
    }
  }, "Cancel"), React.createElement("button", {
    className: "modal-btn primary",
    onClick: handleConfirmPaste
  }, pasteContent.type === "text" ? "Send Text" : "Add to Queue")))), React.createElement("aside", {
    className: "changelog-sidebar dark-mode"
  }, React.createElement("div", {
    className: "changelog-header"
  }, React.createElement("h2", null, "Updates")), React.createElement("div", {
    className: "changelog-content"
  }, React.createElement("div", {
    className: "changelog-section"
  }, React.createElement("div", {
    className: "changelog-version"
  }, "v3.1"), React.createElement("div", {
    className: "changelog-date"
  }, "Current"), React.createElement("ul", {
    className: "changelog-items"
  }, React.createElement("li", null, "Share text, folders & clipboard"), React.createElement("li", null, "Disconnect button"), React.createElement("li", null, "Full share history screen"), React.createElement("li", null, "Settings panel with speed tuning"), React.createElement("li", null, "LAN speed boost (bigger chunks)"), React.createElement("li", null, "Receiver-side cancel"))), React.createElement("div", {
    className: "changelog-section"
  }, React.createElement("div", {
    className: "changelog-version"
  }, "v3.0"), React.createElement("div", {
    className: "changelog-date"
  }, "Previous"), React.createElement("ul", {
    className: "changelog-items"
  }, React.createElement("li", null, "Direct LAN connection optimized"), React.createElement("li", null, "Removed external relay servers"), React.createElement("li", null, "Improved reliability on local networks"), React.createElement("li", null, "Cleaner UI without debug logs"))), React.createElement("div", {
    className: "changelog-section"
  }, React.createElement("div", {
    className: "changelog-version"
  }, "Upcoming"), React.createElement("div", {
    className: "changelog-date"
  }, "v3.2"), React.createElement("ul", {
    className: "changelog-items"
  }, React.createElement("li", null, "Parallel multi-stream transfers"), React.createElement("li", null, "Transfer history export"), React.createElement("li", null, "Custom naming for sessions"))))));
}
export default App;
