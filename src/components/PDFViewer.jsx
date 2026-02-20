// src/components/PDFViewer.js
import React, { useState, useEffect } from 'react';
import TestContainer from './test-ui/TestContainer';
import './PDFViewer.css';

export default function PDFViewer({ url, title, resourceId, onClose }) {
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="pdf-overlay" onClick={onClose}>
      <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-header">
          <span className="pdf-title">{title}</span>
          <div className="pdf-header-actions">
            <button
              type="button"
              className="pdf-generate-test-btn"
              onClick={() => setTestModalOpen(true)}
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
