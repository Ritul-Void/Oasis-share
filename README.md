# Oasis - P2P File Sharing
https://pearrtc.publicacc039.workers.dev


Oasis lets you share files directly with other people peer-to-peer. No server storage, no uploading to the cloud - just direct file transfer between your device and theirs.
## latest Update - 
docker env support added - Dec 2025 

chrome Extension - Adds a context menu for sharing selected text or images from any webpage.
Opens a popup for sending and receiving files or clipboard content.
Uses WebRTC for direct, encrypted peer-to-peer transfers (no server storage).
Works seamlessly with the Oasis web app and backend.

## Features

- **P2P File Transfer** - Share files directly peer-to-peer
- **Web App** - Use it in your browser
- **Chrome Extension** - Quick access from your browser extension
- **Custom SPDC Library** - Forked and customized version of simple-peer for optimized file sharing
- **Docker Support** - Easy deployment with Docker

## Project Structure

```
Oasis-98/
├── src/                    # React web app
│   ├── App.jsx
│   ├── main.jsx
│   └── modules/            # SPDC helper and worker
├── chrome-extension/       # Chrome extension
├── spdc-runtime-js/        # Docker backend runtime
├── public/
│   └── spdc.umd.min.js     # Custom SPDC library (forked simple-peer)
└── package.json
```

## Getting Started

### Requirements
- Node.js and npm
- Docker (for running the backend)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Run the web app locally**
```bash
npm run dev
```

The web app will start on `http://localhost:5173`

## Docker Setup

The backend is containerized in `spdc-runtime-js/` folder.

### Build Docker image
```bash
cd spdc-runtime-js
docker build -t oasis-spdc .
```

### Run Docker container
```bash
docker run -p 8787:8787 oasis-spdc
```

The service will be available at `http://localhost:8787`

### Using Docker Compose (optional)
```bash
docker-compose up
```

## Custom SPDC Library

The `spdc.umd.min.js` library in the `public/` folder is a forked and customized version of [simple-peer](https://github.com/feross/simple-peer). It has been modified for optimized P2P file sharing performance.

## Chrome Extension

The Chrome extension is located in `chrome-extension/` folder. It provides quick access to Oasis file sharing directly from your browser.

## License

Check LICENSE file for details.

