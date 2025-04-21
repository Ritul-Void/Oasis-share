




(() => {
  "use strict";

  

  const SIGNALING_BASE_URL = "https://pearrtc.publicacc039.workers.dev";
  const NICKNAMES = [
    "Nova", "Starlight", "Orbit", "Zen", "Comet",
    "Luna", "Ember", "Void", "Pulse", "Echo",
    "Photon", "Quasar", "Nebula", "Blaze", "Frost",
    "Vortex", "Pixel", "Nimbus", "Spark", "Glitch"
  ];

  const BUFFERED_THRESHOLD = 256 * 1024;
  const BACKOFF_BASE_MS = 150;
  const BACKOFF_MAX_ATTEMPTS = 5;

  

  let peer = null;
  let dataChannel = null;
  let pollingInterval = null;
  let myUsername = "";
  let peerUsername = "";
  let currentPeerId = "";
  let isInitiator = false;
  let isConnected = false;
  let keepConnection = false;
  let quickShareData = null;
  let bufferLowResolvers = [];
  let cancellationTokens = {};
  let activeSendFiles = new Map();
  let sentFiles = [];
  let receivedFiles = [];

  // Incoming file state
  let incomingFile = null;
  let incomingChunks = [];
  let incomingReceivedBytes = 0;

  // ---------- DOM Elements ----------

  const $ = (id) => document.getElementById(id);

  const viewHome = $("viewHome");
  const viewQuickShare = $("viewQuickShare");
  const viewConnecting = $("viewConnecting");
  const viewReceiveInput = $("viewReceiveInput");
  const viewDashboard = $("viewDashboard");
  const allViews = [viewHome, viewQuickShare, viewConnecting, viewReceiveInput, viewDashboard];

  const statusDot = $("statusDot");
  const myUsernameEl = $("myUsername");
  const btnSend = $("btnSend");
  const btnReceive = $("btnReceive");

  
  const qsBackBtn = $("qsBackBtn");
  const qsPreview = $("qsPreview");
  const qsPreviewIcon = $("qsPreviewIcon");
  const qsPreviewName = $("qsPreviewName");
  const qsPreviewMeta = $("qsPreviewMeta");
  const qsImagePreview = $("qsImagePreview");
  const qsImageThumb = $("qsImageThumb");
  const qsKeepConnection = $("qsKeepConnection");
  const qsSendBtn = $("qsSendBtn");

  
  const codeDisplay = $("codeDisplay");
  const peerCodeText = $("peerCodeText");
  const copyCodeBtn = $("copyCodeBtn");
  const connectingHint = $("connectingHint");
  const cancelConnectBtn = $("cancelConnectBtn");

  
  const receiveBackBtn = $("receiveBackBtn");
  const receiveCodeInput = $("receiveCodeInput");
  const receiveKeepConnection = $("receiveKeepConnection");
  const connectBtn = $("connectBtn");

  
  const peerNameDisplay = $("peerNameDisplay");
  const disconnectBtn = $("disconnectBtn");
  const uploadZone = $("uploadZone");
  const fileInput = $("fileInput");
  const transfersSection = $("transfersSection");
  const transfersList = $("transfersList");
  const historyList = $("historyList");

  

  function randomUsername() {
    const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${name}#${num}`;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function generatePeerId() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast-custom";
    t.innerText = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      setTimeout(() => t.classList.add("show"), 30);
      setTimeout(() => {
        t.classList.remove("show");
        setTimeout(() => t.remove(), 300);
      }, 2500);
    });
  }

  

  function showView(view) {
    allViews.forEach((v) => v.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  function updateStatusDot() {
    statusDot.style.background = isConnected ? "#30D158" : "#FF3B30";
  }

  

  async function apiPost(path, body) {
    const res = await fetch(SIGNALING_BASE_URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  }

  async function apiGet(path) {
    const res = await fetch(SIGNALING_BASE_URL + path);
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }

  

  function getAdaptiveChunkSize() {
    const dm = navigator.deviceMemory || 4;
    if (dm >= 8) return 128 * 1024;
    return 96 * 1024;
  }

  

  function waitForDataChannelBuffer(dc) {
    if (!dc) return Promise.resolve();
    if (dc.bufferedAmount <= BUFFERED_THRESHOLD) return Promise.resolve();
    return new Promise((resolve) => bufferLowResolvers.push(resolve));
  }

  async function sendWithRetry(dc, payload) {
    let attempt = 0;
    while (true) {
      try {
        await waitForDataChannelBuffer(dc);
        dc.send(payload);
        return;
      } catch (err) {
        attempt += 1;
        if (attempt > BACKOFF_MAX_ATTEMPTS) throw err;
        const delay = Math.min(BACKOFF_BASE_MS * (2 ** (attempt - 1)), 2000);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  

  function sendControlMessage(payload) {
    if (!peer) return;
    peer.send(JSON.stringify(payload));
  }

  

  function initPeer(initiator, id) {
    try {
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
        isConnected = true;
        updateStatusDot();

        const dc = p._channel;
        if (dc) {
          dataChannel = dc;
          dc.binaryType = "arraybuffer";
          dc.bufferedAmountLowThreshold = BUFFERED_THRESHOLD;
          dc.onbufferedamountlow = () => {
            const resolvers = bufferLowResolvers.splice(0);
            resolvers.forEach((r) => r());
          };
        }

        p.send(JSON.stringify({ type: "username", value: myUsername }));
        toast("Secure connection established");

        
        if (quickShareData) {
          showView(viewDashboard);
          peerNameDisplay.textContent = peerUsername || "Anonymous Peer";
          sendQuickShareData();
        } else {
          showView(viewDashboard);
          peerNameDisplay.textContent = peerUsername || "Anonymous Peer";
        }
      });

      p.on("data", (data) => {
        handleIncomingData(data);
      });

      p.on("close", () => {
        isConnected = false;
        updateStatusDot();
        toast("Peer disconnected.");
        clearInterval(pollingInterval);
        dataChannel = null;
        bufferLowResolvers.splice(0).forEach((r) => r());
        if (!keepConnection) {
          showView(viewHome);
        }
      });

      p.on("error", (err) => {
        console.error("Peer error:", err);
        isConnected = false;
        updateStatusDot();
        toast("Connection error occurred.");
        showView(viewHome);
      });

      peer = p;
    } catch (e) {
      toast("Failed to initialize peer");
      showView(viewHome);
    }
  }

  function pollForAnswer(id, p) {
    pollingInterval = setInterval(async () => {
      try {
        const { status, data } = await apiGet(`/api/peer-answer/${id}`);
        if (status === 200 && data.answer) {
          clearInterval(pollingInterval);
          p.signal(data.answer);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
  }

  

  function handleIncomingData(data) {
    if (typeof data === "string") {
      handleControlMessage(JSON.parse(data));
      return;
    }

    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

      
      if (bytes[0] === 123 || bytes[0] === 91 || bytes[0] === 34) {
        try {
          const text = new TextDecoder().decode(bytes);
          if (text.startsWith("{") || text.startsWith("[") || text.startsWith('"')) {
            handleControlMessage(JSON.parse(text));
            return;
          }
        } catch (e) {  }
      }

      handleIncomingChunk(data instanceof Uint8Array ? data : new Uint8Array(data));
      return;
    }

    if (data?.buffer) {
      handleIncomingChunk(new Uint8Array(data.buffer));
    }
  }

  

  function handleControlMessage(msg) {
    if (msg.type === "username") {
      peerUsername = msg.value;
      peerNameDisplay.textContent = peerUsername;
      return;
    }

    if (msg.type === "file-meta") {
      incomingFile = {
        name: msg.name,
        size: msg.size,
        fileId: msg.fileId,
        startOffset: msg.startOffset || 0,
        startTime: Date.now(),
      };
      incomingChunks = [];
      incomingReceivedBytes = msg.startOffset || 0;

      updateTransferUI();
      return;
    }

    if (msg.type === "file-end") {
      if (!incomingFile) return;

      const blob = new Blob(incomingChunks, { type: "application/octet-stream" });
      triggerDownload(blob, incomingFile.name, incomingFile.fileId, incomingReceivedBytes);
      incomingFile = null;
      incomingChunks = [];
      incomingReceivedBytes = 0;
      updateTransferUI();
      return;
    }

    if (msg.type === "cancel-file") {
      if (cancellationTokens[msg.fileId] !== undefined) {
        cancellationTokens[msg.fileId] = true;
      }
      incomingFile = null;
      incomingChunks = [];
      incomingReceivedBytes = 0;
      updateTransferUI();
      toast("Transfer cancelled");
      return;
    }

    if (msg.type === "resume-file") {
      const sourceFile = activeSendFiles.get(msg.fileId);
      if (sourceFile) {
        sendFileInChunks(sourceFile, { fileId: msg.fileId, startOffset: msg.offset || 0, isResume: true });
      }
    }
  }

  

  function handleIncomingChunk(chunk) {
    if (!(chunk instanceof Uint8Array)) {
      chunk = new Uint8Array(chunk);
    }
    incomingChunks.push(chunk);
    incomingReceivedBytes += chunk.byteLength;
    updateTransferUI();
  }

  

  async function sendFileInChunks(file, options = {}) {
    const fileId = options.fileId || `${file.name}-${file.size}-${Date.now()}`;
    const startOffset = options.startOffset || 0;
    const startTime = Date.now();
    const dc = dataChannel || peer?._channel;
    let keepForResume = false;

    if (!dc) {
      toast("Data channel not ready");
      return;
    }

    dataChannel = dc;
    cancellationTokens[fileId] = false;
    activeSendFiles.set(fileId, file);

    try {
      await sendWithRetry(dc, JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        fileId,
        startOffset,
      }));

      const reader = file.slice(startOffset).stream().getReader();
      const chunkSize = getAdaptiveChunkSize();
      let offset = startOffset;
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone || !value) {
          done = true;
          break;
        }

        let cursor = 0;
        while (cursor < value.length) {
          if (cancellationTokens[fileId]) {
            sendControlMessage({ type: "cancel-file", fileId });
            keepForResume = true;
            toast(`Transfer of ${file.name} cancelled`);
            updateTransferUI();
            return;
          }

          const slice = value.subarray(cursor, cursor + chunkSize);
          await sendWithRetry(dc, new Uint8Array(slice));
          offset += slice.byteLength;
          cursor += slice.byteLength;
          updateTransferUI();
        }
      }

      await sendWithRetry(dc, JSON.stringify({
        type: "file-end",
        fileId,
      }));

      sentFiles.push({
        name: file.name,
        size: file.size,
        time: new Date().toLocaleTimeString(),
        fileId,
        status: "completed",
      });

      updateHistoryUI();
      toast(`Sent ${file.name}`);

      
      if (!keepConnection && !quickShareData) {
        setTimeout(() => disconnectPeer(), 500);
      }

    } catch (error) {
      console.error("Error sending file:", error);
      toast(`Error sending ${file.name}`);
      keepForResume = true;
    } finally {
      if (!keepForResume) {
        activeSendFiles.delete(fileId);
      }
      delete cancellationTokens[fileId];
      updateTransferUI();
    }
  }

  

  async function sendQuickShareData() {
    if (!quickShareData || !isConnected) return;

    const data = quickShareData;
    quickShareData = null; 

    if (data.type === "text") {
      
      const textBlob = new Blob([data.content], { type: "text/plain" });
      const textFile = new File([textBlob], "shared-text.txt", { type: "text/plain" });
      await sendFileInChunks(textFile);
    } else if (data.type === "image") {
      
      try {
        const response = await fetch(data.content);
        const blob = await response.blob();
        const file = new File([blob], data.filename || "shared-image.png", { type: data.mimeType || "image/png" });
        await sendFileInChunks(file);
      } catch (err) {
        console.error("Failed to process image:", err);
        toast("Failed to process image");
      }
    } else if (data.type === "image-url") {
      
      const textBlob = new Blob([data.content], { type: "text/plain" });
      const textFile = new File([textBlob], "shared-image-url.txt", { type: "text/plain" });
      await sendFileInChunks(textFile);
    }
  }

  

  function triggerDownload(blob, name, fileId, receivedBytes) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      receivedFiles.push({
        name,
        size: receivedBytes,
        time: new Date().toLocaleTimeString(),
        fileId,
        status: "completed",
      });

      updateHistoryUI();
      toast(`Received ${name}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast(`Error saving ${name}`);
    }
  }

  

  function updateTransferUI() {
    const outgoing = Array.from(activeSendFiles.entries());
    const hasIncoming = incomingFile !== null;

    if (outgoing.length === 0 && !hasIncoming) {
      transfersSection.classList.add("hidden");
      transfersList.innerHTML = "";
      return;
    }

    transfersSection.classList.remove("hidden");
    transfersList.innerHTML = "";

    // Outgoing transfers
    outgoing.forEach(([fileId, file]) => {
      const row = document.createElement("div");
      row.className = "transfer-row";
      row.innerHTML = `
        <div class="direction-icon up">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="transfer-details">
          <div class="transfer-top">
            <span class="name">${escapeHtml(file.name)}</span>
            <span class="speed">Sending...</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: 50%"></div></div>
          <div class="transfer-btm">
            <span>${formatBytes(file.size)}</span>
            <button class="text-btn" data-file-id="${fileId}">Cancel</button>
          </div>
        </div>
      `;
      const cancelBtn = row.querySelector(".text-btn");
      cancelBtn.addEventListener("click", () => {
        if (cancellationTokens[fileId] !== undefined) {
          cancellationTokens[fileId] = true;
          toast("Cancelling...");
        }
      });
      transfersList.appendChild(row);
    });

    
    if (hasIncoming) {
      const progress = incomingFile.size > 0 ? (incomingReceivedBytes / incomingFile.size * 100) : 0;
      const row = document.createElement("div");
      row.className = "transfer-row";
      row.innerHTML = `
        <div class="direction-icon down">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <div class="transfer-details">
          <div class="transfer-top">
            <span class="name">${escapeHtml(incomingFile.name)}</span>
            <span class="speed">${progress.toFixed(0)}%</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width: ${progress}%"></div></div>
          <div class="transfer-btm">
            <span>${formatBytes(incomingReceivedBytes)} / ${formatBytes(incomingFile.size)}</span>
          </div>
        </div>
      `;
      transfersList.appendChild(row);
    }
  }

  function updateHistoryUI() {
    const all = [
      ...sentFiles.map((f) => ({ ...f, direction: "sent" })),
      ...receivedFiles.map((f) => ({ ...f, direction: "received" })),
    ];

    if (all.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No transfers yet.</div>';
      return;
    }

    historyList.innerHTML = all
      .map(
        (f) => `
      <div class="history-item">
        <div class="status-dot ${f.direction}">
          ${f.direction === "sent"
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
          }
        </div>
        <div class="file-data">
          <span class="filename">${escapeHtml(f.name)}</span>
          <div class="subtext">
            <span>${formatBytes(f.size)}</span>
            <span>·</span>
            <span>${f.time}</span>
            <span class="tag ${f.direction}">${f.direction === "sent" ? "Sent" : "Received"}</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  

  function disconnectPeer() {
    if (peer) {
      try { peer.destroy(); } catch (e) {}
      peer = null;
    }
    dataChannel = null;
    isConnected = false;
    peerUsername = "";
    clearInterval(pollingInterval);
    bufferLowResolvers.splice(0);
    incomingFile = null;
    incomingChunks = [];
    incomingReceivedBytes = 0;
    updateStatusDot();
    showView(viewHome);
  }

  // ---------- Actions: Send ----------

  function startSend() {
    const id = generatePeerId();
    currentPeerId = id;
    isInitiator = true;

    showView(viewConnecting);
    codeDisplay.classList.remove("hidden");
    peerCodeText.textContent = id;
    connectingHint.textContent = "Waiting for receiver to connect...";

    initPeer(true, id);
  }

  

  async function startReceive(code) {
    if (!code || code.length < 5) {
      toast("Enter a valid code");
      return;
    }

    showView(viewConnecting);
    codeDisplay.classList.add("hidden");
    connectingHint.textContent = "Locating peer...";

    try {
      const { status, data } = await apiGet(`/api/peer-offer/${code}`);
      if (status === 200 && data.offer) {
        initPeer(false, code);
        peer.signal(data.offer);
      } else {
        toast("Invalid or expired code.");
        showView(viewHome);
      }
    } catch (e) {
      toast("Connection error");
      showView(viewHome);
    }
  }

  

  function startQuickShare() {
    keepConnection = qsKeepConnection.checked;

    const id = generatePeerId();
    currentPeerId = id;
    isInitiator = true;

    showView(viewConnecting);
    codeDisplay.classList.remove("hidden");
    peerCodeText.textContent = id;
    connectingHint.textContent = "Share this code with the receiver...";

    initPeer(true, id);
  }

  

  
  btnSend.addEventListener("click", () => {
    keepConnection = false;
    startSend();
  });

  
  btnReceive.addEventListener("click", () => {
    showView(viewReceiveInput);
    receiveCodeInput.focus();
  });

  
  receiveBackBtn.addEventListener("click", () => {
    showView(viewHome);
  });

  
  connectBtn.addEventListener("click", () => {
    keepConnection = receiveKeepConnection.checked;
    startReceive(receiveCodeInput.value.trim());
  });

  receiveCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      keepConnection = receiveKeepConnection.checked;
      startReceive(receiveCodeInput.value.trim());
    }
  });

  
  qsBackBtn.addEventListener("click", () => {
    quickShareData = null;
    chrome.runtime.sendMessage({ action: "clearQuickShareData" });
    showView(viewHome);
  });

  
  qsSendBtn.addEventListener("click", () => {
    startQuickShare();
  });

  
  cancelConnectBtn.addEventListener("click", () => {
    clearInterval(pollingInterval);
    if (peer) {
      try { peer.destroy(); } catch (e) {}
      peer = null;
    }
    isConnected = false;
    updateStatusDot();
    showView(viewHome);
  });

  
  copyCodeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentPeerId);
    toast("Code copied!");
  });

  codeDisplay?.addEventListener("click", () => {
    navigator.clipboard.writeText(currentPeerId);
    toast("Code copied!");
  });

  
  disconnectBtn.addEventListener("click", () => {
    disconnectPeer();
  });

  
  uploadZone.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      sendFileInChunks(file);
    });

    fileInput.value = "";
  });

  // ---------- Quick Share Data Check ----------

  function setupQuickShare(data) {
    quickShareData = data;

    if (data.type === "text") {
      const textLen = data.content.length;
      const preview = data.content.substring(0, 80) + (textLen > 80 ? "..." : "");
      qsPreviewName.textContent = "shared-text.txt";
      qsPreviewMeta.textContent = `${textLen} characters · Text`;
      qsImagePreview.classList.add("hidden");
      qsPreviewIcon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    } else if (data.type === "image" || data.type === "image-url") {
      qsPreviewName.textContent = data.filename || "shared-image.png";
      qsPreviewMeta.textContent = data.size ? formatBytes(data.size) + " · Image" : "Image";
      qsPreviewIcon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

      if (data.type === "image" && data.content) {
        qsImagePreview.classList.remove("hidden");
        qsImageThumb.src = data.content;
      } else {
        qsImagePreview.classList.add("hidden");
      }
    }

    
    startQuickShare();
  }

  

  function init() {
    myUsername = randomUsername();
    myUsernameEl.textContent = myUsername;
    updateStatusDot();

    
    chrome.runtime.sendMessage({ action: "getQuickShareData" }, (data) => {
      if (data && data.timestamp && Date.now() - data.timestamp < 30000) {
        setupQuickShare(data);
      } else {
        
        const params = new URLSearchParams(window.location.search);
        if (params.get("quickshare")) {
          chrome.runtime.sendMessage({ action: "getQuickShareData" }, (data2) => {
            if (data2) {
              setupQuickShare(data2);
            }
          });
        }
      }
    });
  }

  init();
})();
