import React from 'react';

const TextMessage = ({ msg, isMine }) => {
  return (
    <div className={`message-wrapper ${isMine ? "me" : "other"}`}>
      <div className={`message ${isMine ? "me" : "other"}`}>
        {msg.content}
      </div>
    </div>
  );
};

export default TextMessage; 