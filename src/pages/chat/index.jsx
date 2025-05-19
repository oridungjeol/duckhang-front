import { useNavigate } from 'react-router';

import "./index.css"

export default function Chat() {

  const navigate = useNavigate();

  const datas = [
    {
      "room_id": 555,
      "user_id":"asdf",
      "name": "채팅방1",
      "recent": "최근 대화1"
    },
    {
      "room_id": 666,
      "user_id":"asdf",
      "name": "채팅방2",
      "recent": "최근 대화2"
    },
    {
      "room_id": 777,
      "user_id":"asdf",
      "name": "채팅방3",
      "recent": "최근 대화3"
    },
  ]

  const enterChatRoom = (data) => {
    //data를 넘겨야 함
    navigate(`/chat/${data.room_id}`, { state: data });
  }

  return (
    <div className="container">
      <h1>채팅</h1>
      <div className="chatting-list">
        {datas.map((data, index) => (
          <div className="chatting" onClick={() => { enterChatRoom(data) }}>
            <div>
              <img src="/images/duckhang.jpg" alt="duckhang" className="chat-thumbnail" />
            </div>
            <div className="chat-texts">
              <div className="chat-nickname">{data.name}</div>
              <div className="chat-last-message">{data.recent}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}