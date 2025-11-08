import React, { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import './canvas.css';

import Header from './components/Header';
import ConversationsSidebar from './components/ConversationsSidebar';
import DebugPanel from './components/DebugPanel';
import { ChatRebuild } from './components/Chat/Chat';
import { CanvasRebuild } from './components/Canvas/CanvasManager';
import { Artifact } from './types/chat';

function App() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Initialize conversation from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get('conversation_id') || localStorage.getItem('last_conversation_id');
    
    if (convId) {
      const id = parseInt(convId);
      setActiveConversationId(id);
    }
  }, []);

  // Listen for canvas state changes from Canvas component
  useEffect(() => {
    const handleCanvasStateChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail && typeof detail.isOpen === 'boolean') {
        setIsCanvasOpen(detail.isOpen);
      }
    };

    window.addEventListener('canvasStateChanged', handleCanvasStateChanged);
    return () => {
      window.removeEventListener('canvasStateChanged', handleCanvasStateChanged);
    };
  }, []);

  const handleConversationSelected = (id: number) => {
    setActiveConversationId(id);
    // Update URL and localStorage
    window.history.pushState({}, '', `?conversation_id=${id}`);
    localStorage.setItem('last_conversation_id', id.toString());
    // Dispatch event to notify Chat component
    window.dispatchEvent(new CustomEvent('conversationSelected', { detail: { conversationId: id } }));
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setArtifacts([]);
    // Clear URL and localStorage
    window.history.pushState({}, '', window.location.pathname);
    localStorage.removeItem('last_conversation_id');
    // Notify Chat component to clear messages
    window.dispatchEvent(new Event('newChat'));
  };

  const handleToggleDebug = () => {
    setIsDebugPanelOpen(!isDebugPanelOpen);
  };

  const handleToggleCanvas = () => {
    const newState = !isCanvasOpen;
    setIsCanvasOpen(newState);
    // Dispatch event for Canvas component to listen
    window.dispatchEvent(new CustomEvent('toggleCanvas', { detail: { isOpen: newState } }));
  };

  const handleToggleConversations = () => {
    setIsConversationsOpen(!isConversationsOpen);
  };

  // Removed unused handleArtifactCreate function

  return (
    <div className="container">
      <Header
        onNewConversation={handleNewConversation}
        onToggleDebug={handleToggleDebug}
        onToggleCanvas={handleToggleCanvas}
        onToggleConversations={handleToggleConversations}
        isDebugOpen={isDebugPanelOpen}
        isCanvasOpen={isCanvasOpen}
        isConversationsOpen={isConversationsOpen}
      />
      
      <div className="main-content">
        <ConversationsSidebar
          activeConversationId={activeConversationId}
          onConversationSelected={handleConversationSelected}
          isOpen={isConversationsOpen}
          onClose={() => setIsConversationsOpen(false)}
        />

        <div className="chat-section">
          <div className="chat-container" id="chatContainer">
            <ChatRebuild conversationId={activeConversationId} />
          </div>
        </div>

        <DebugPanel
          conversationId={activeConversationId}
          isOpen={isDebugPanelOpen}
        />
      </div>

      <CanvasRebuild isOpen={isCanvasOpen} conversationId={activeConversationId} />
    </div>
  );
}

export default App;
