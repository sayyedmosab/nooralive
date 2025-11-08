import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../../components/Canvas/Canvas.module.css';
import ArtifactRenderer from '../../components/ArtifactRenderer';
import { Artifact } from '../../types/chat';

export function CanvasRebuild() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [mode, setMode] = useState<'hidden' | 'collapsed' | 'expanded' | 'fullscreen'>('hidden');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Mode Management (Matching Legacy Logic) ---
  const setCanvasMode = useCallback((newMode: 'hidden' | 'collapsed' | 'expanded' | 'fullscreen') => {
    setMode(newMode);
  }, []);

  const toggleCanvas = useCallback(() => {
    setMode('hidden');
  }, []);

  const cycleMode = useCallback(() => {
    const modes: ('collapsed' | 'expanded' | 'fullscreen')[] = ['collapsed', 'expanded', 'fullscreen'];
    const currentIndex = modes.indexOf(mode as any);
    const nextIndex = (currentIndex + 1) % modes.length;
    setCanvasMode(modes[nextIndex]);
  }, [mode, setCanvasMode]);

  const loadArtifact = useCallback((artifact: Artifact) => {
    setCurrentArtifact(artifact);
    // Auto-expand when loading an artifact from the list
    setCanvasMode('expanded');
  }, [setCanvasMode]);

  const closeArtifact = useCallback(() => {
    setCurrentArtifact(null);
    // Return to collapsed mode (list view)
    setCanvasMode('collapsed');
  }, [setCanvasMode]);

  // --- Event Listeners (Matching Legacy Logic) ---
  useEffect(() => {
    // Listen for artifacts from Chat
    const onArtifacts = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail && Array.isArray(detail.artifacts)) {
        // Add each artifact to the canvas
        detail.artifacts.forEach((artifact: any) => {
          const newArtifact: Artifact = {
            id: artifact.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            artifact_type: artifact.artifact_type as 'CHART' | 'TABLE' | 'REPORT' | 'DOCUMENT',
            title: artifact.title,
            content: artifact.content,
            created_at: artifact.created_at || new Date().toISOString()
          };
          setArtifacts(prev => [newArtifact, ...prev]);
        });
        // Show canvas in collapsed mode if hidden
        setMode(prevMode => prevMode === 'hidden' ? 'collapsed' : prevMode);
      }
    };
    window.addEventListener('chat:artifacts', onArtifacts as EventListener);

    // Listen for explicit toggleCanvas event (top-level header button)
    const onToggle = () => {
      setMode(prevMode => prevMode === 'hidden' ? 'collapsed' : 'hidden');
    };
    window.addEventListener('toggleCanvas', onToggle as EventListener);

    // Listen for newChat event to clear artifacts
    const onNewChat = () => {
      setArtifacts([]);
      setCurrentArtifact(null);
      setMode('hidden');
    };
    window.addEventListener('newChat', onNewChat);

    return () => {
      window.removeEventListener('chat:artifacts', onArtifacts as EventListener);
      window.removeEventListener('toggleCanvas', onToggle as EventListener);
      window.removeEventListener('newChat', onNewChat);
    };
  }, []); // Empty deps - event listeners set up once

  // --- Render Logic ---

  if (mode === 'hidden') return null;

  const isListMode = mode === 'collapsed' || !currentArtifact;

  // Safe date formatter
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className={`
      ${styles.wrapper} 
      ${mode === 'collapsed' ? styles.collapsed : ''} 
      ${mode === 'expanded' ? styles.expanded : ''} 
      ${mode === 'fullscreen' ? styles.fullscreen : ''}
    `.trim()}>
      <div className={styles.toolbar}>
        <div className={styles.modeLabel} onClick={cycleMode}>
          {mode === 'collapsed' ? 'List View' : mode === 'expanded' ? 'Expanded View' : 'Fullscreen View'}
        </div>
        <div style={{ flex: 1 }} />
        {currentArtifact && (
          <button onClick={cycleMode} title="Cycle Mode">
            {mode === 'expanded' ? 'Fullscreen' : 'Restore'}
          </button>
        )}
        <button onClick={toggleCanvas} title="Close Canvas">✕</button>
      </div>

      <div className={styles.contentArea} ref={containerRef}>
        {isListMode ? (
          // Artifact List View (Collapsed Mode)
          <div className={styles.artifactList}>
            {artifacts.length === 0 ? (
              <div className={styles.emptyState}>No artifacts yet.</div>
            ) : (
              artifacts.map(artifact => (
                <div
                  key={artifact.id}
                  className={styles.artifactCard}
                  onClick={() => loadArtifact(artifact)}
                >
                  <div className={styles.artifactTitle}>{artifact.title}</div>
                  <div className={styles.artifactMeta}>{artifact.artifact_type} - {formatDate(artifact.created_at)}</div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Single Artifact View (Expanded/Fullscreen Mode)
          <ArtifactRenderer artifact={currentArtifact} onClose={closeArtifact} onCloseCanvas={toggleCanvas} />
        )}
      </div>
    </div>
  );
}
