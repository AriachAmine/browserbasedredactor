# Secure Browser-Based Redactor

A strictly client-side image tool that allows users to obscure sensitive data (credit cards, faces, emails) in screenshots before sharing, ensuring zero data transfer to servers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-4.0-purple)

## 🔒 Privacy First

This tool processes images entirely within your browser using the HTML5 Canvas API. **No image data is ever uploaded to a server.**

## ✨ Features

- **Drag-and-Drop Interface**: Immediate image loading with a smooth, premium UI.
- **Dual Redaction Modes**:
  - **💧 Blur**: Apply a Gaussian blur to obscure details while maintaining context.
  - **⬛ Solid**: Completely mask areas with a solid black rectangle.
- **Smart History**: Undo your last action or reset the entire session.
- **High-Quality Export**: Download your sanitized images as PNGs in their original resolution.
- **Dark Mode**: Sleek, glassmorphism-inspired design.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd browserbasedredactor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (or the URL shown in your terminal).

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Variables & Layouts)
- **Core Logic**: HTML5 Canvas API

## 📝 Usage

1. **Drop**: Drag an image file onto the dashed zone.
2. **Select Tool**: Choose between **Blur** or **Solid** mode from the floating toolbar.
3.  **Redact**: Click and drag over the sensitive information.
4.  **Export**: Click **Download** to save the redacted image.

## License

MIT
