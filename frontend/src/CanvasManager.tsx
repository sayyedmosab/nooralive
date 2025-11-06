
import React from 'react';
import CanvasRebuild from './rebuild/Canvas/CanvasManager';

// Wrapper to keep existing import path while delegating to rebuild component
const CanvasManager: React.FC = () => {
  return <CanvasRebuild />;
};

export default CanvasManager;
