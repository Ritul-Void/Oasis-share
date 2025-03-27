// fileReceiver.worker.js
// Worker: receives chunks, buffers them, and then creates final Blob

let chunks = [];
let receivedBytes = 0;
let meta = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === "meta") {
    meta = payload;
    chunks = [];
    receivedBytes = payload.startOffset || 0;
    console.log("[fileReceiver.worker] Meta received:", meta.name, meta.size);
  }

  if (type === "chunk") {
    chunks.push(payload); 
    receivedBytes += payload.byteLength;


    self.postMessage({
      type: "progress",
      receivedBytes,
      size: meta.size,
      fileId: meta.fileId
    });
  }

  if (type === "end") {
    console.log("[fileReceiver.worker] Creating Blob from", chunks.length, "chunks");
    const blob = new Blob(chunks, { type: "application/octet-stream" });

    self.postMessage({
      type: "done",
      blob,
      name: meta.name,
      size: meta.size,
      fileId: meta.fileId,
      receivedBytes
    });

    chunks = [];
    meta = null;
  }

  if (type === "abort") {
    console.log("[fileReceiver.worker] Aborting transfer");
    chunks = [];
    meta = null;
  }
};