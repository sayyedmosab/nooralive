import React, { useState, useEffect } from 'react';
import { Conversation } from '../types/chat';
import { chatService } from '../services/chatService';
import './ConversationsSidebar.css';

interface ConversationsSidebarProps {
  activeConversationId?: number | null;
  onConversationSelected: (id: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  activeConversationId = null,
  onConversationSelected,
  isOpen = false,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await chatService.getConversations(1, 50);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conversationId: number) => {
    onConversationSelected(conversationId);
    onClose?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="conversations-sidebar active">
      <div className="conversations-header">
        <h3>💬 Conversations</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div className="conversations-list">
        {isLoading && (
          <div className="loading">Loading conversations...</div>
        )}
        
        {error && (
          <div style={{ padding: '20px', color: '#e74c3c' }}>
            {error}
          </div>
        )}
        
        {!isLoading && !error && conversations.length === 0 && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#95a5a6' 
          }}>
            No conversations yet
          </div>
        )}
        
        {!isLoading && !error && conversations.map(conversation => (
          <div
            key={conversation.id}
            className={`conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}
            onClick={() => handleConversationClick(conversation.id)}
            style={{
              padding: '12px 15px',
              marginBottom: '8px',
              background: conversation.id === activeConversationId ? '#667eea' : '#34495e',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              if (conversation.id !== activeConversationId) {
                e.currentTarget.style.background = '#3d566e';
              }
            }}
            onMouseLeave={(e) => {
              if (conversation.id !== activeConversationId) {
                e.currentTarget.style.background = '#34495e';
              }
            }}
          >
            <div className="conversation-title">
              {conversation.title || 'Untitled'}
            </div>
            <div className="conversation-meta">
              <span>{conversation.message_count || 0} messages</span>
              <span>{formatDate(conversation.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsSidebar;
