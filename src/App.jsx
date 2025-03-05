import React, { useEffect, useRef, useState } from "react";
import { Peer } from "https://esm.sh/peerjs@1.5.5?bundle-deps"
import "./App.css";

const NICKNAME_POOL = [
  "Phoenix",
  "Nebula",
  "Echo",
  "Solace",
  "Nova",
  "Drift",
  "Cipher",
  "Static",
  "Vesper",
  "Comet",
];

function generateNickname() {
  const base =
    NICKNAME_POOL[Math.floor(Math.random() * NICKNAME_POOL.length)];
  const tag = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${base}#${tag}`;
}

function generatePeerId() {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  const num = arr[0] % 1000000;
  return num.toString().padStart(6, "0");
}


let nextLocalItemId = 1;

function App() {
  const [nickname, setNickname] = useState("");
  const [peerId, setPeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [readyState, setReadyState] = useState("Initializing…");

  const [items, setItems] = useState([]); 
  const fileInputRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [targetPeerId, setTargetPeerId] = useState("");

  const [incomingOffer, setIncomingOffer] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Theme: default dark, persisted to localStorage
  const [isDark, setIsDark] = useState(() => {
    try {
      const v = localStorage.getItem("ct_theme");
      return v === null ? true : v === "dark";
    } catch {
      return true;
    }
  });

  // Generate nickname and peer ID once
  useEffect(() => {
    setNickname(generateNickname());
    setPeerId(generatePeerId());
  }, []);


  useEffect(() => {
    try {
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      localStorage.setItem("ct_theme", isDark ? "dark" : "light");
    } catch { }
  }, [isDark]);

  function toggleTheme() {
    setIsDark((s) => !s);
  }

 
  useEffect(() => {
    if (!peerId) return;

    const p = new Peer(peerId, {
      debug: 2,
    });

    setPeer(p);

    p.on("open", () => {
      setReadyState("Ready");
    });

    p.on("error", (err) => {
      console.error(err);
      setReadyState("Error");
      setStatusMessage(err.message || "Peer error");
    });

    p.on("connection", (conn) => {
      setupConnection(conn);
    });

    return () => {
      p.destroy();
    };

  }, [peerId]);

  function setupConnection(conn) {
    conn.on("data", (msg) => handleIncomingMessage(conn, msg));
    conn.on("close", () => {
      setStatusMessage("Connection closed");
    });
  }

  function handleIncomingMessage(conn, msg) {
    if (!msg || typeof msg !== "object") return;

    switch (msg.type) {
      case "offer":
        setIncomingOffer({
          conn,
          fromNickname: msg.fromNickname,
          fromPeerId: msg.fromPeerId,
          itemCount: msg.itemCount,
        });
        break;
      case "accept":
        // Remote accepted: send payload
        sendPayloadOverConnection(conn);
        break;
      case "decline":
        setStatusMessage("Share request declined");
        conn.close();
        break;
      case "payload":
        receivePayload(msg.payload);
        break;
      default:
        break;
    }
  }

  function receivePayload(payload) {
    if (!payload) return;

    const receivedItems = [];

    if (payload.textItems) {
      payload.textItems.forEach((t) => {
        receivedItems.push({
          id: `rx-text-${nextLocalItemId++}`,
          type: "text",
          name: t.name,
          size: t.content.length,
          content: t.content,
          received: true,
        });
      });
    }

    if (payload.files) {
      payload.files.forEach((f) => {
        // Rebuild blob from data URL
        const linkName = f.name;
        receivedItems.push({
          id: `rx-file-${nextLocalItemId++}`,
          type: "file",
          name: linkName,
          size: f.size,
          dataUrl: f.dataUrl,
          received: true,
        });
      });
    }

    setItems((prev) => [...prev, ...receivedItems]);
    setStatusMessage("Received shared items");
  }

  function handleAddClick() {
    setIsMenuOpen((o) => !o);
  }

  function handleAddText() {
    setIsMenuOpen(false);
    setShowTextDialog(true);
  }

  function handleTextDialogSubmit() {
    const text = textInput.trim();
    if (!text) {
      setStatusMessage("Text cannot be empty");
      return;
    }

    const item = {
      id: `local-${nextLocalItemId++}`,
      type: "text",
      name: text.slice(0, 24) + (text.length > 24 ? "…" : ""),
      size: text.length,
      content: text,
    };

    setItems((prev) => [...prev, item]);
    setTextInput("");
    setShowTextDialog(false);
    setStatusMessage("Text added to share");
  }

  function handleTextDialogCancel() {
    setTextInput("");
    setShowTextDialog(false);
  }

  function copyToClipboard(content) {
    navigator.clipboard.writeText(content).then(() => {
      setStatusMessage("Copied to clipboard");
    }).catch(() => {
      setStatusMessage("Failed to copy");
    });
  }

  function handleAddFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map((file) => ({
      id: `local-${nextLocalItemId++}`,
      type: "file",
      name: file.name,
      size: file.size,
      file,
    }));

    setItems((prev) => [...prev, ...newItems]);


    e.target.value = "";
  }

  function triggerFilePicker() {
    setIsMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function sendShareRequest() {
    if (!peer) {
      setStatusMessage("Peer not initialized yet");
      return;
    }
    if (!targetPeerId.trim()) {
      setStatusMessage("Enter a Peer ID to send to");
      return;
    }
    if (!items.length) {
      setStatusMessage("Nothing to share. Add text or files first.");
      return;
    }

    setStatusMessage("Connecting…");

    const conn = peer.connect(targetPeerId.trim());
    setupConnection(conn);

    conn.on("open", () => {
      setStatusMessage("Connected. Sending offer…");
      conn.send({
        type: "offer",
        fromNickname: nickname,
        fromPeerId: peerId,
        itemCount: items.length,
      });
    });
  }

  async function sendPayloadOverConnection(conn) {
    try {
      const textItems = items
        .filter((it) => it.type === "text")
        .map((it) => ({
          name: it.name,
          content: it.content,
        }));

      const fileItems = items.filter((it) => it.type === "file");

      const files = await Promise.all(
        fileItems.map(
          (it) =>
            new Promise((resolve, reject) => {
              const file = it.file;
              if (!file) {
                resolve(null);
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  dataUrl: reader.result,
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      const filteredFiles = files.filter(Boolean);

      conn.send({
        type: "payload",
        payload: {
          textItems,
          files: filteredFiles,
        },
      });

      setStatusMessage("Payload sent");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error while sending payload");
    }
  }

  function acceptIncomingOffer() {
    if (!incomingOffer) return;
    incomingOffer.conn.send({ type: "accept" });
    setIncomingOffer(null);
    setStatusMessage("Accepted share request");
  }

  function declineIncomingOffer() {
    if (!incomingOffer) return;
    incomingOffer.conn.send({ type: "decline" });
    incomingOffer.conn.close();
    setIncomingOffer(null);
    setStatusMessage("Declined share request");
  }

  // Clear status message after 4 seconds
  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => {
      setStatusMessage("");
    }, 4000); // Clear after 4 seconds

    return () => clearTimeout(timer);
  }, [statusMessage]);

  return (
    <div className="app-root">


      <div className="app-overlay">
        <div className="oasis-panel">
          <header className="panel-header">
            <div className="panel-title">Oasis</div>

            <div className="add-wrapper">
              <button className="add-button" onClick={handleAddClick}>
                Add
                <span className="add-caret">▾</span>
              </button>

              {isMenuOpen && (
                <div className="add-menu">
                  <button onClick={handleAddText}>Share text</button>
                  <button onClick={triggerFilePicker}>Share file</button>
                </div>
              )}

              <input
                type="file"
                style={{ display: "none" }}
                multiple
                ref={fileInputRef}
                onChange={handleAddFileSelect}
              />
            </div>
          </header>

          <div className="file-list">
            {items.length === 0 && (
              <div className="file-list-empty">
                Nothing here yet. Add text or files to share.
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className={`file-item ${item.received ? "file-item-received" : ""
                  }`}
              >
                <div className="file-icon">
                  {item.type === "file" ? "📄" : "✏️"}
                </div>
                <div className="file-main">
                  <div className="file-name">{item.name}</div>
                  <div className="file-meta">
                    {item.type === "file"
                      ? `${(item.size / 1024).toFixed(1)} KB`
                      : `${item.size} chars`}
                    {item.received && <span> · received</span>}
                    {item.type === "text" && item.received && (
                      <>
                        {" "}
                        ·{" "}
                        <button
                          className="file-copy-link"
                          onClick={() => copyToClipboard(item.content)}
                          type="button"
                          title="Copy to clipboard"
                          aria-label="Copy text to clipboard"
                        >
                          copy
                        </button>
                      </>
                    )}
                    {item.dataUrl && (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={item.dataUrl}
                          download={item.name}
                          className="file-download-link"
                        >
                          download
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="file-remove"
                  onClick={() => removeItem(item.id)}
                  title="Delete"
                  aria-label="Delete item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <footer className="panel-footer">
            <div className="footer-left">
              <div className="status-line">
                <span className="status-dot"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-access-point"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12l0 .01" /><path d="M14.828 9.172a4 4 0 0 1 0 5.656" /><path d="M17.657 6.343a8 8 0 0 1 0 11.314" /><path d="M9.168 14.828a4 4 0 0 1 0 -5.656" /><path d="M6.337 17.657a8 8 0 0 1 0 -11.314" /></svg></span>
                <span className="status-text">{readyState}</span>
              </div>
              <div className="visible-line">
                User - {" "}
                <span className="nickname-label">{nickname}</span>
              </div>
              {peerId && (
                <div className="peerid-line">
                  Your Peer ID:{" "}
                  <span className="peerid-value">{peerId}</span>
                </div>
              )}
            </div>

            <div className="footer-right">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDark}
              >
                <img
                  src={isDark ? "src/assets/off.png" : "src/assets/on.png"}
                  alt={isDark ? "Dark mode on" : "Light mode on"}
                  width="36"
                  height="24"
                />
              </button>

              <input
                className="peerid-input"
                placeholder="Enter peer ID"
                value={targetPeerId}
                onChange={(e) => setTargetPeerId(e.target.value)}
              />
              <button
                className="send-button"
                onClick={sendShareRequest}
                title="Send"
                aria-label="Send"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-share-3"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7z" /></svg>
              </button>
            </div>
          </footer>

          {statusMessage && (
            <div className="status-banner">{statusMessage}</div>
          )}

          {incomingOffer && (
            <div className="incoming-offer">
              <div className="incoming-body">
                <div className="incoming-title">Incoming share</div>
                <div className="incoming-text">
                  <strong>{incomingOffer.fromNickname}</strong> (
                  {incomingOffer.fromPeerId}) wants to share{" "}
                  {incomingOffer.itemCount} item
                  {incomingOffer.itemCount !== 1 ? "s" : ""} with you.
                </div>
                <div className="incoming-actions">
                  <button
                    className="incoming-accept"
                    onClick={acceptIncomingOffer}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="incoming-decline"
                    onClick={declineIncomingOffer}
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTextDialog && (
            <div className="text-dialog-overlay">
              <div className="text-dialog">
                <div className="text-dialog-header">
                  <h2>Share Text</h2>
                  <button
                    className="text-dialog-close"
                    onClick={handleTextDialogCancel}
                  >
                    ×
                  </button>
                </div>
                <div className="text-dialog-body">
                  <textarea
                    className="text-dialog-input"
                    placeholder="Enter text to share…"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === "Enter") {
                        handleTextDialogSubmit();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="text-dialog-footer">
                  <button
                    className="text-dialog-cancel"
                    onClick={handleTextDialogCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-dialog-submit"
                    onClick={handleTextDialogSubmit}
                  >
                    Add to Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
