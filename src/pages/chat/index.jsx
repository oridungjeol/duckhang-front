import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { getChatRoomList } from './hook';

import "./index.css"

export default function Chat() {

  const navigate = useNavigate();
  const [datas, setDatas] = useState({})

  useEffect(() => {
    const fetchChatRoomList = async() => {
      const chatRoomList = await getChatRoomList();
      console.log(chatRoomList);
      setDatas(chatRoomList);
    }

    fetchChatRoomList();
  }, [])

  // const datas = [
  //   {
  //     "room_id": 555,
  //     "name": "채팅방1",  //참여자 이름
  //     "recent": "최근 대화1",
  //     "boardId": 102,
  //     "type": "rental"
  //   },
  //   {
  //     "room_id": 666,
  //     "name": "채팅방2",
  //     "recent": "최근 대화2",
  //     "boardId": 102,
  //     "type": "rental"
  //   },
  //   {
  //     "room_id": 777,
  //     "name": "채팅방3",
  //     "recent": "최근 대화3",
  //     "boardId": 102,
  //     "type": "rental"
  //   },
  // ]

  const enterChatRoom = (data) => {
    navigate(`/chat/${data.room_id}`, { state: data });
  }

  return (
    <div className="container">
      <h1>채팅</h1>
      <div className="chatting-list">
        {datas.map((data, index) => (
          <div key={index} className="chatting" onClick={() => { enterChatRoom(data) }}>
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