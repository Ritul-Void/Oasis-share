



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    const selection = window.getSelection();
    sendResponse({ text: selection ? selection.toString() : "" });
    return true;
  }

  if (message.action === "getImageData") {
    
    sendResponse({ ok: true });
    return true;
  }
});
