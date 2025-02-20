# Oasis - P2P File & Text Sharing

**Oasis** is a peer-to-peer file and text sharing web application built with React and PeerJS. It enables direct, encrypted sharing between users without a central server.

## Core Features

- **Peer-to-Peer Sharing**: Connect directly with other users via Peer IDs
- **File Sharing**: Share files up to browser storage limits
- **Text Sharing**: Share text snippets with copy-to-clipboard functionality


## Quick Start

1. **Install dependencies**: `npm install`
2. **Run dev server**: `npm run dev`
3. **Build for production**: `npm run build`

## Project Structure

```
src/
├── App.jsx          # Main app component with PeerJS logic
├── App.css          # Theming + responsive styles
├── main.jsx         # Entry point
└── assets/          # Theme toggle images (on.png, off.png)
```

## Key Concepts

> [!NOTE]
> Each user gets a unique **Peer ID** (6 digits) and **Nickname** (e.g., Phoenix#1234). Share your Peer ID with others to receive files/text.

> [!TIP]
> To send items to another user: (1) Enter their Peer ID in the footer input, (2) Click the send button. Items are queued and sent upon connection.

