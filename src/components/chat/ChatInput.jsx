import React from 'react';

const ChatInput = ({ input, setInput, handleSend, handleImage, addImage }) => {
  const activeEnter = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="input-container">
      <input
        type="file"
        className="image-btn"
        id="image-upload"
        style={{ display: "none" }}
        onChange={addImage}
      />
      <label htmlFor="image-upload" className="send-btn">
        +
      </label>
      <button className="send-btn" onClick={handleImage}>
        임시 이미지 전송
      </button>
      <input
        type="text"
        className="input-text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={activeEnter}
        placeholder="메시지를 입력하세요..."
      />
      <button className="send-btn" onClick={handleSend}>
        전송
      </button>
    </div>
  );
};

export default ChatInput; 