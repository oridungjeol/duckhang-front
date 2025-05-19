import "./chatitem.css"

export default function ChatItem() {

  return (
    <div className="chatting">
      <div>
        <img src="/images/duckhang.jpg" alt="duckhang" className="chat-thumbnail" />
      </div>
      <div className="chat-texts">
        <div className="chat-nickname">닉네임</div>
        <div className="chat-last-message">최근 대화</div>
      </div>
    </div>
  );
}