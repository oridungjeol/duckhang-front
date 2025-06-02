import { useState } from "react";

import "./chatInput.css";

const ChatInput = ({ input, setInput, handleSend, handleImage, addImage }) => {
  const [isImage, setIsImage] = useState(false);

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
        onChange={(e) => {
          addImage(e);
          setIsImage(true);
        }}
      />
      <label htmlFor="image-upload" className="send-btn send-image-btn">
        +
      </label>
      <input
        type="text"
        className="input-text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyPress={activeEnter}
        placeholder="메시지를 입력하세요..."
      />
      <button
        className="send-btn"
        onClick={() => {
          if (isImage) {
            handleImage();
            setIsImage(false);
          } else {
            handleSend();
          }
        }}
      >
        전송
      </button>
    </div>
  );
};

export default ChatInput;
