import React from "react";
import "./SummaryModal.css";

const SummaryModal = ({ summary, onClose }) => {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Full Summary</h2>
        <pre>{summary}</pre>
      </div>
    </div>
  );
};

export default SummaryModal;