import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatRebuild from './Chat/Chat';
import CanvasRebuild from './Canvas/CanvasManager';
import './rebuild.css';

function App() {
  return (
    <div style={{ display: 'flex', gap: 12, height: '100vh', padding: 12, boxSizing: 'border-box' }}>
      <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column' }}>
        <ChatRebuild />
      </div>
      <div style={{ flex: 1 }}>
        <CanvasRebuild />
      </div>
    </div>
  );
}

// If this file is imported by the main app during manual testing it will mount into #root
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}

export default App;
