import React from 'react';

const SummaryCard = ({ summary, onOpenModal, onDelete }) => {
  return (
    <div className="summary-card">
      <div onClick={() => onOpenModal(summary.summaryText)}>
        <p className="truncate">{summary.summaryText}</p>
        <small>
          Created: {new Date(summary.date).toLocaleString()}
          <br /> 
          Words: {summary.wordLimit}
        </small>
      </div>
      <button onClick={() => onDelete(summary._id)}>Delete</button>
    </div>
  );
};

export default SummaryCard;
