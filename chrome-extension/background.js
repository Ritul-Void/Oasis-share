


const SIGNALING_BASE_URL = "https://pearrtc.publicacc039.workers.dev";
const NICKNAMES = [
  "Nova", "Starlight", "Orbit", "Zen", "Comet",
  "Luna", "Ember", "Void", "Pulse", "Echo",
  "Photon", "Quasar", "Nebula", "Blaze", "Frost",
  "Vortex", "Pixel", "Nimbus", "Spark", "Glitch"
];



chrome.runtime.onInstalled.addListener(() => {
  
  chrome.contextMenus.create({
    id: "oasis-share-parent",
    title: "Oasis Share",
    contexts: ["selection", "image"]
  });

  
  chrome.contextMenus.create({
    id: "oasis-share-text",
    parentId: "oasis-share-parent",
    title: "Share Selected Text",
    contexts: ["selection"]
  });

  
  chrome.contextMenus.create({
    id: "oasis-share-image",
    parentId: "oasis-share-parent",
    title: "Share This Image",
    contexts: ["image"]
  });
});



chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "oasis-share-text") {
    const text = info.selectionText;
    if (!text) return;

    
    await chrome.storage.local.set({
      quickShareData: {
        type: "text",
        content: text,
        timestamp: Date.now()
      }
    });

    
    
    chrome.action.openPopup().catch(() => {
      
      chrome.windows.create({
        url: "popup.html?quickshare=text",
        type: "popup",
        width: 420,
        height: 620,
        focused: true
      });
    });
  }

  if (info.menuItemId === "oasis-share-image") {
    const imageUrl = info.srcUrl;
    if (!imageUrl) return;

    try {
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Data = reader.result;
        
        let filename = "shared-image.png";
        try {
          const urlObj = new URL(imageUrl);
          const pathParts = urlObj.pathname.split("/");
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart.includes(".")) {
            filename = decodeURIComponent(lastPart);
          }
        } catch (e) {  }

        await chrome.storage.local.set({
          quickShareData: {
            type: "image",
            content: base64Data,
            filename: filename,
            mimeType: blob.type || "image/png",
            size: blob.size,
            timestamp: Date.now()
          }
        });

        chrome.action.openPopup().catch(() => {
          chrome.windows.create({
            url: "popup.html?quickshare=image",
            type: "popup",
            width: 420,
            height: 620,
            focused: true
          });
        });
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to fetch image:", err);
      
      await chrome.storage.local.set({
        quickShareData: {
          type: "image-url",
          content: imageUrl,
          filename: "shared-image.png",
          timestamp: Date.now()
        }
      });

      chrome.action.openPopup().catch(() => {
        chrome.windows.create({
          url: "popup.html?quickshare=image",
          type: "popup",
          width: 420,
          height: 620,
          focused: true
        });
      });
    }
  }
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getQuickShareData") {
    chrome.storage.local.get("quickShareData", (result) => {
      sendResponse(result.quickShareData || null);
      
      chrome.storage.local.remove("quickShareData");
    });
    return true; 
  }

  if (message.action === "clearQuickShareData") {
    chrome.storage.local.remove("quickShareData");
    sendResponse({ ok: true });
    return true;
  }
});
