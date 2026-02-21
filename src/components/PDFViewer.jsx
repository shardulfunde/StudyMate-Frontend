// src/components/PDFViewer.js
import React, { useEffect, useRef, useState } from 'react';
import TestContainer from './test-ui/TestContainer';
import './PDFViewer.css';

export default function PDFViewer({
  url,
  title,
  resourceId,
  onClose,
  embeddingStatus = 'pending'
}) {
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const isEmbeddingCompleted = embeddingStatus === 'completed';

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (modalRef.current?.requestFullscreen) {
      await modalRef.current.requestFullscreen();
    }
  };

  return (
    <div className="pdf-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`pdf-modal${isFullscreen ? ' pdf-modal-fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdf-header">
          <span className="pdf-title">{title}</span>
          <div className="pdf-header-actions">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-open-tab-btn"
              title="Open PDF directly in a new browser tab"
            >
              Open in New Tab
            </a>
            <button
              type="button"
              className="pdf-fullscreen-btn"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button
              type="button"
              className="pdf-generate-test-btn"
              onClick={() => isEmbeddingCompleted && setTestModalOpen(true)}
              disabled={!isEmbeddingCompleted}
              title={
                isEmbeddingCompleted
                  ? 'Generate a test for this document'
                  : 'Generate embeddings first to enable test generation'
              }
            >
              Generate Test
            </button>
            <button className="pdf-close-btn" onClick={onClose}>
              &times; Close
            </button>
          </div>
        </div>
        <div className="pdf-content">
          {/* Using iframe is the simplest way to render a browser-native PDF viewer */}
          <iframe
            src={url}
            title={title}
            className="pdf-frame"
            frameBorder="0"
          />
        </div>
      </div>

      <TestContainer
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        scopeId={resourceId}
        scopeTarget="resource"
        title={`Test: ${title}`}
      />
    </div>
  );
}
