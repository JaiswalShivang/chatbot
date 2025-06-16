import React from 'react';

const TypingIndicator = ({ avatar }) => {
  return (
    <div className="message-container bot-message">
      <div className="message-bubble typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;