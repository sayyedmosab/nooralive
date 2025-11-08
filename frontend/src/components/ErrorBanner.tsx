import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#ffebee',
      borderLeft: '4px solid #c62828',
      borderRadius: '4px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ color: '#c62828', fontWeight: 'bold', marginBottom: '8px' }}>
          ⚠️ Error
        </div>
        <div style={{ color: '#666' }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#999',
          padding: '0 8px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ErrorBanner;
