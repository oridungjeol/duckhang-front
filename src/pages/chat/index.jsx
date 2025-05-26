import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { getChatRoomList } from './hook';

import "./index.css"

export default function Chat() {

  const navigate = useNavigate();
  const [datas, setDatas] = useState([])

  /**
   * 유저가 속한 채팅방 리스트 load
   */
  useEffect(() => {
    const fetchChatRoomList = async() => {
      const chatRoomList = await getChatRoomList();
      setDatas(chatRoomList);
    }

    fetchChatRoomList();
  }, [])

  /**
   * 채팅방 클릭 시 해당 채팅방으로 이동
   * @param {*} data 
   */
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