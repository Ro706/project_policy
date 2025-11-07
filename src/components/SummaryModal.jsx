import React from "react";
import { motion } from "framer-motion";
import "./SummaryModal.css";

const SummaryModal = ({ summary, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Full Summary</h2>
        <pre>{summary}</pre>
      </motion.div>
    </motion.div>
  );
};

export default SummaryModal;