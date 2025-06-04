import React from 'react';

const TextMessage = React.forwardRef(({ msg, isMine }, ref) => {
  return (
    <div className={`message-wrapper ${isMine ? "me" : "other"}`} ref={ref}>
      <div className={`message ${isMine ? "me" : "other"}`}>
        {msg.content}
      </div>
    </div>
  );
});

export default TextMessage; 