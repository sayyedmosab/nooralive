import React, { useState } from 'react';
import { chatService } from '../services/chatService';
import { ChatRequest, ChatResponse } from '../types/chat';
import './ChatInput.css';

interface ChatInputProps {
  onMessageSent: (response: ChatResponse) => void;
  onError: (error: string) => void;
  onUserMessage: (content: string) => void;
  conversationId?: number | null;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onMessageSent,
  onError,
  onUserMessage,
  conversationId,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setIsLoading(true);

    onUserMessage(question);

    try {
      const request: ChatRequest = {
        query: question,
        persona: 'transformation_analyst'
      };

      if (conversationId) {
        request.conversation_id = conversationId;
      }

      const response = await chatService.sendMessage(request);
      onMessageSent(response);
    } catch (error) {
      const errorMessage = chatService.formatErrorMessage(error as Error);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="questionInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your transformation..."
          disabled={disabled || isLoading}
          className="chat-input"
        />
        <button
          id="askButton"
          type="submit"
          disabled={disabled || isLoading || !input.trim()}
          className="ask-button"
        >
          {isLoading ? 'Sending...' : 'Ask'}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
