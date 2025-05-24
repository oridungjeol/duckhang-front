import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { getChatRoomList } from './hook';

import "./index.css"

export default function Chat() {

  const navigate = useNavigate();
  const [datas, setDatas] = useState([])

  useEffect(() => {
    const fetchChatRoomList = async() => {
      const chatRoomList = await getChatRoomList();
      setDatas(chatRoomList);
    }

    fetchChatRoomList();
  }, [])

  const enterChatRoom = (data) => {
    navigate(`/chat/${data.room_id}`, { state: data });
  }

  return (
    <div className="container">
      <h1>채팅</h1>
      <div className="chatting-list">
        {datas.map((data) => (
          <div key={data.room_id} className="chatting" onClick={() => { enterChatRoom(data) }}>
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