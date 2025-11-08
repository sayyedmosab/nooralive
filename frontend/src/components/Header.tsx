import React from 'react';
import './Header.css';

interface HeaderProps {
  onNewConversation?: () => void;
  onToggleDebug?: () => void;
  onToggleCanvas?: () => void;
  onToggleConversations?: () => void;
  isDebugOpen?: boolean;
  isCanvasOpen?: boolean;
  isConversationsOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onNewConversation,
  onToggleDebug,
  onToggleCanvas,
  onToggleConversations,
  isDebugOpen = false,
  isCanvasOpen = false,
  isConversationsOpen = false
}) => {
  return (
    <div className="header">
      <div className="header-left">
        <h1>JOSOOR - Transformation Analytics</h1>
        <p>Autonomous AI Agent for Enterprise Transformation Intelligence</p>
      </div>
      <div className="header-right">
        <button
          id="conversationsBtn"
          className={`canvas-toggle-btn ${isConversationsOpen ? 'active' : ''}`}
          onClick={onToggleConversations}
        >
          📋 History
        </button>
        <button
          id="newConversationBtn"
          className="canvas-toggle-btn"
          onClick={onNewConversation}
        >
          💬 New Chat
        </button>
        <button
          id="canvasToggle"
          className={`canvas-toggle-btn ${isCanvasOpen ? 'active' : ''}`}
          onClick={onToggleCanvas}
        >
          📊 Canvas
        </button>
        <button
          id="debugToggle"
          className={isDebugOpen ? 'active' : ''}
          onClick={onToggleDebug}
        >
          {isDebugOpen ? '🔍 Hide Debug' : '🔍 Show Debug'}
        </button>
      </div>
    </div>
  );
};

export default Header;
