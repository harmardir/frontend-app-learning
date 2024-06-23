import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ totalUnits, completedUnits }) => {
  const progressPercentage = (completedUnits / totalUnits) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progressPercentage}%` }}>
        {completedUnits}/{totalUnits} Units Completed
      </div>
    </div>
  );
};

export default ProgressBar;
