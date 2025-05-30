import React from "react";
import "./chatroom.css";

const messages = [
  {
    name: "윤채민",
    text: "혹시 메타몽 인형 팔렸을까요?",
    avatar: "/avatars/avatar1.png",
  },
  {
    name: "박상연",
    text: "일본 포카 아직 남았나요ㅠㅠ",
    avatar: "/avatars/avatar2.png",
  },
  {
    name: "전유영",
    text: "야옹 인형 제가 살게요!",
    avatar: "/avatars/avatar3.png",
  },
  {
    name: "박유민",
    text: "망곰이 인형 구매하고 싶습니다!",
    avatar: "/avatars/avatar4.png",
  },
];

export default function ChatRoom() {
  return (
    <div className="chatroom-bg">
      <div className="chatroom-header">Message</div>
      <div className="chatroom-list">
        {messages.map((msg, idx) => (
          <div className="chatroom-card" key={idx}>
            <img className="chatroom-avatar" src={msg.avatar} alt={msg.name} />
            <div>
              <div className="chatroom-name">{msg.name}</div>
              <div className="chatroom-text">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
