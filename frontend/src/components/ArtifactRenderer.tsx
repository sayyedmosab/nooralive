import React from 'react';
import { Artifact } from '../types/chat';
import ChartRenderer from '../ChartRenderer';

interface ArtifactRendererProps {
  artifact: Artifact;
  onClose: () => void;
  onCloseCanvas: () => void;
}

const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ 
  artifact, 
  onClose, 
  onCloseCanvas 
}) => {
  const renderPlaceholder = (message: string) => {
    return (
      <div className="artifact-body">
        <p>{message}</p>
      </div>
    );
  };

  const renderTable = () => {
  const { columns = [], rows = [] } = artifact.content;
    
    return (
      <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '14px' 
        }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              {columns.map((col: string, index: number) => (
                <th 
                  key={index}
                  style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    borderBottom: '2px solid #2c3e50',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#34495e'
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any[], rowIndex: number) => (
              <tr 
                key={rowIndex}
                style={{ 
                  backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa' 
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #dee2e6', 
                      color: '#2c3e50' 
                    }}
                  >
                    {cell !== null && cell !== undefined ? cell : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!artifact) {
    return renderPlaceholder('No artifact selected');
  }

  const renderArtifactByType = () => {
    try {
      switch (artifact.artifact_type.toUpperCase()) {
        case 'CHART':
          return <ChartRenderer artifact={artifact} />;
        
        case 'TABLE':
          return renderTable();
        
        case 'REPORT':
          return renderPlaceholder('Report rendering coming soon');
        
        case 'DOCUMENT':
          return renderPlaceholder('Document rendering coming soon');
        
        default:
          return renderPlaceholder(`Renderer for ${artifact.artifact_type} not implemented`);
      }
    } catch (error) {
      console.error('Error rendering artifact:', error);
      return renderPlaceholder('Error rendering artifact');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="artifact-container">
      <div className="artifact-header">
        <div className="artifact-title-main">{artifact.title}</div>
        <div className="artifact-meta-row">
          <div className="artifact-meta-item">
            <span>📦</span>
            <span>Type: {artifact.artifact_type}</span>
          </div>
          <div className="artifact-meta-item">
            <span>📅</span>
            <span>Created: {formatDate(artifact.created_at)}</span>
          </div>
        </div>
        <div className="artifact-actions">
          <button className="export-btn secondary" onClick={onClose}>
            ← Back to List
          </button>
          <button className="export-btn secondary" onClick={onCloseCanvas}>
            ✕ Close Canvas
          </button>
        </div>
      </div>
      
      {renderArtifactByType()}
    </div>
  );
};

export default ArtifactRenderer;