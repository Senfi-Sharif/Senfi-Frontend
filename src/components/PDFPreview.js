// src/components/PDFPreview.js
import React from "react";

export default function PDFPreview({ fileId }) {
  return (
    <div style={{
      width: '100%',
      height: '60vh',
      maxHeight: '600px',
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    }}>
      <iframe
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        width="100%"
        height="100%"
        allow="autoplay"
        title="PDF Preview"
        style={{ 
          border: "none",
          borderRadius: '0.5rem',
        }}
      />
    </div>
  );
}
