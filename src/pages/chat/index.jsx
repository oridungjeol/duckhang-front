import ChatItem from "./chatitem"
import "./index.css"

export default function Chat() {

  return (
    <div className="container">
      <h1>채팅</h1>
      <div className="chatting-list">
        <ChatItem />
      </div>
    </div>
  )
}