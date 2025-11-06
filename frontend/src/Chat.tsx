import React from 'react';
import ChatRebuild from './rebuild/Chat/Chat';

// Wrapper that keeps the same default export for the app while delegating to rebuild
const Chat: React.FC = () => {
  return <ChatRebuild />;
};

export default Chat;
