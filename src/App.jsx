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
  const bufferLowResolversRef = useRef([]);
  const dataChannelRef = useRef(null);
  const incomingFileRef = useRef(null);
  const activeSendFilesRef = useRef(new Map());
  const receiverWorkerRef = useRef(null);
  const BUFFERED_THRESHOLD = 256 * 1024;
  const MAX_QUEUE_BYTES = 4 * 1024 * 1024;
  const BACKOFF_BASE_MS = 150;
  const BACKOFF_MAX_ATTEMPTS = 5;
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
      p.on("connect", () => {
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
        processFileQueue();
      });
      p.on("data", data => {
        console.log("[oasis-share] p.on('data') fired with", typeof data, data instanceof ArrayBuffer ? "ArrayBuffer" : data instanceof Uint8Array ? "Uint8Array" : "string");
        handleIncomingData(data);
      });
      p.on("close", () => {
        setConnected(false);
        setIsConnecting(false);
        toast("Peer disconnected.");
        clearInterval(pollingRef.current);
        dataChannelRef.current = null;
        bufferLowResolversRef.current.splice(0).forEach(r => r());
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
  const detectMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
  const getAdaptiveChunkSize = () => {
    const dm = navigator.deviceMemory || 4;
    if (detectMobile()) {
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
        if (attempt > BACKOFF_MAX_ATTEMPTS) {
          throw err;
        }
        const delay = Math.min(BACKOFF_BASE_MS * 2 ** (attempt - 1), 2000);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  };
  const logDeviceSnapshot = dc => {
    try {
      console.log("[oasis-share] device snapshot", {
        deviceMemory: navigator.deviceMemory,
        performanceMemory: performance?.memory,
        bufferedAmount: dc?.bufferedAmount,
        isMobile: detectMobile(),
        chunkSize: getAdaptiveChunkSize()
      });
    } catch (e) {
      console.debug("snapshot log skipped", e);
    }
  };
  const createWritableSink = async meta => {
    if (window.showSaveFilePicker && window.WritableStream) {
      const handle = await window.showSaveFilePicker({
        suggestedName: meta.name
      });
      const writable = await handle.createWritable();
      let position = meta.startOffset || 0;
      if (position > 0) {
        await writable.write({
          type: "seek",
          position
        });
      }
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
      } catch (e) {
        console.warn("Failed to abort sink", e);
      }
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
        if (active) {
          active.flushPromise = null;
        }
      });
    }
    if (state.queueBytes > MAX_QUEUE_BYTES) {
      console.warn("Incoming queue above target window", state.queueBytes);
    }
  };
  const handleIncomingChunk = chunk => {
    console.log("[oasis-share] handleIncomingChunk called with", chunk.byteLength || chunk.length, "bytes");
    if (!(chunk instanceof Uint8Array)) {
      chunk = new Uint8Array(chunk);
    }
    receiverWorkerRef.current.postMessage({
      type: "chunk",
      payload: chunk
    }, [chunk.buffer]);
  };
  const debugLogIncomingData = data => {
    console.log("[oasis-share] Received data event", {
      type: typeof data,
      isArrayBuffer: data instanceof ArrayBuffer,
      isUint8Array: data instanceof Uint8Array,
      length: data?.length || data?.byteLength || 0,
      sample: data instanceof Uint8Array ? `[${data.slice(0, 8).join(",")}...]` : String(data).slice(0, 100)
    });
  };
  const handleControlMessage = async msg => {
    if (msg.type === "username") {
      setPeerUsername(msg.value);
      return;
    }
    if (msg.type === "file-meta") {
      console.log("[oasis-share] file-meta received", msg);
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
      console.log("[oasis-share] file-end received for", msg.fileId);
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
    let lastMetricLog = Date.now();
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
              const newState = {
                ...prev
              };
              delete newState[fileId];
              return newState;
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
          if (Date.now() - lastMetricLog > 1000) {
            console.log("[oasis-share] send metrics", {
              deviceMemory: navigator.deviceMemory,
              performanceMemory: performance?.memory,
              bufferedAmount: dc?.bufferedAmount,
              offset,
              chunkSize
            });
            lastMetricLog = Date.now();
          }
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
      } catch (e) {
        console.error("Failed to close peer after send error", e);
      }
    } finally {
      setSendingProgress(prev => {
        const newState = {
          ...prev
        };
        delete newState[fileId];
        return newState;
      });
      delete cancellationTokensRef.current[fileId];
      if (!keepForResume) {
        activeSendFilesRef.current.delete(fileId);
      }
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
        console.log("[oasis-share] File transfer complete, triggering download");
        triggerDownload(blob, name, fileId, receivedBytes);
      }
    };
    return () => {
      if (receiverWorkerRef.current) {
        receiverWorkerRef.current.terminate();
      }
    };
  }, []);
  useEffect(() => {
    if (connected && fileQueueRef.current.length > 0) {
      processFileQueue();
    }
  }, [connected, fileQueueRef.current.length]);
  const handleIncomingData = data => {
    debugLogIncomingData(data);
    if (typeof data === "string") {
      console.log("[oasis-share] handleIncomingData: processing string control message");
      handleControlMessage(JSON.parse(data)).catch(err => console.error("control message error", err));
      return;
    }
    if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      if (bytes[0] === 123 || bytes[0] === 91 || bytes[0] === 34) {
        try {
          const text = new TextDecoder().decode(bytes);
          if (text.startsWith("{") || text.startsWith("[") || text.startsWith('"')) {
            console.log("[oasis-share] handleIncomingData: detected JSON in Uint8Array, parsing as control message");
            handleControlMessage(JSON.parse(text)).catch(err => console.error("control message error", err));
            return;
          }
        } catch (e) {
          console.debug("Failed to decode as JSON, treating as binary chunk", e);
        }
      }
      if (data instanceof ArrayBuffer) {
        console.log("[oasis-share] handleIncomingData: processing ArrayBuffer chunk", data.byteLength, "bytes");
        handleIncomingChunk(new Uint8Array(data));
        return;
      }
      if (data instanceof Uint8Array) {
        console.log("[oasis-share] handleIncomingData: processing Uint8Array chunk", data.byteLength, "bytes");
        handleIncomingChunk(data);
        return;
      }
    }
    if (data?.buffer) {
      console.log("[oasis-share] handleIncomingData: processing typed array with .buffer", data.buffer.byteLength, "bytes");
      handleIncomingChunk(new Uint8Array(data.buffer));
      return;
    }
    console.warn("[oasis-share] handleIncomingData: unknown data type, ignoring", typeof data, data);
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
      const endTime = Date.now();
      const duration = (endTime - (incomingFileRef.current?.startTime || Date.now())) / 1000;
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
