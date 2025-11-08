import React, { useState, useEffect, useCallback } from 'react';
import { DebugLogs, DebugLog } from '../types/chat';
import { chatService } from '../services/chatService';
import './DebugPanel.css';

interface DebugPanelProps {
  conversationId?: number | null;
  isOpen?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  conversationId = null, 
  isOpen = false 
}) => {
  const [debugLogs, setDebugLogs] = useState<DebugLogs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  const loadDebugLogs = useCallback(async () => {
    if (!conversationId) {
      setDebugLogs(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const logs = await chatService.getDebugLogs(conversationId);
      if (logs && typeof logs === 'object') {
        setDebugLogs(logs);
      } else {
        setError('Invalid debug logs format');
      }
    } catch (err: any) {
      console.error('Debug logs error:', err);
      setError(err.message || 'Failed to load debug logs');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadDebugLogs();
    }
  }, [isOpen, conversationId, loadDebugLogs]);

  const toggleLayer = (layerKey: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerKey)) {
      newExpanded.delete(layerKey);
    } else {
      newExpanded.add(layerKey);
    }
    setExpandedLayers(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp || 'Invalid date';
    }
  };

  const filterImportantEvents = (events: DebugLog[]) => {
    if (!Array.isArray(events)) return [];
    const importantEventTypes = ['raw_llm_request', 'raw_llm_response', 'llm_request', 'llm_response'];
    return events.filter(event => importantEventTypes.includes(event.event_type));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="debug-section active">
      <div className="debug-header">
        🔍 RAW Debug Logs - Zero-Shot Orchestrator
      </div>
      
      <div className="debug-container">
        {isLoading && (
          <div className="loading">Loading debug logs...</div>
        )}
        
        {error && (
          <div style={{ padding: '20px', color: '#e74c3c' }}>
            {error}
          </div>
        )}
        
        {!isLoading && !error && !debugLogs && (
          <div className="debug-empty">
            Send a message to see raw API communication logs
          </div>
        )}
        
        {!isLoading && !error && debugLogs && (
          <div className="debug-content">
            {debugLogs.layers && typeof debugLogs.layers === 'object' && Object.entries(debugLogs.layers).map(([layerKey, layerData]) => {
              const filteredEvents = filterImportantEvents(layerData?.events || []);
              const isExpanded = expandedLayers.has(layerKey);
              
              if (filteredEvents.length === 0) return null;
              
              return (
                <div key={layerKey} className="layer-section">
                  <div 
                    className="layer-header"
                    onClick={() => toggleLayer(layerKey)}
                  >
                    <span>
                      Layer {layerKey.replace('layer', '')}: RAW LLM Communication (Request & Response Only)
                    </span>
                    <span 
                      className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}
                    >
                      ▶
                    </span>
                  </div>
                  
                  <div className={`layer-content ${isExpanded ? 'expanded' : ''}`}>
                    {filteredEvents.map((event, index) => (
                      <div key={index} className="event-item">
                        <div className="event-type">
                          {event.event_type ? event.event_type.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          marginBottom: '6px' 
                        }}>
                          {event.timestamp ? formatTimestamp(event.timestamp) : 'No timestamp'}
                        </div>
                        <div className="event-data">
                          <pre>
                            {JSON.stringify(event.data || event, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {(!debugLogs.layers || Object.keys(debugLogs.layers).length === 0) && (
              <div className="debug-empty">
                No RAW LLM communication logs yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
