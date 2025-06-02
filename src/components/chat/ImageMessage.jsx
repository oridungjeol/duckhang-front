import React from 'react';

const ImageMessage = ({ msg, isMine }) => {
  return (
    <div className={`message-wrapper ${isMine ? "me" : "other"}`}>
      <div className={`message ${isMine ? "me" : "other"}`}>
        <img
          src={msg.content}
          alt="이미지 메시지"
          style={{ maxWidth: "200px" }}
        />
      </div>
    </div>
  );
};

export default ImageMessage; 