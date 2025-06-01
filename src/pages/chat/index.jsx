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
  const enterChatRoom = async (data) => {
    try {
      // 게시글 정보를 가져와서 보증금 정보를 포함

      const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {

        credentials: 'include'
      });
      const boardData = await response.json();
      
      // Determine if the current user is the buyer
      const currentUserUuid = localStorage.getItem("uuid");
      const isBuyer = boardData.author_uuid !== currentUserUuid; // User is buyer if not the author
      
      // 결제 정보 가져오기 (optional - only needed if paymentData is used in chatroom for initial state)
      let paymentData = {};
      try {
          const paymentResponse = await fetch(`http://localhost/api/payment/order/${data.board_id}`, {
              credentials: 'include'
          });
          if (paymentResponse.ok) {
              paymentData = await paymentResponse.json();
          }
      } catch (paymentError) {
          console.error("결제 정보 가져오기 실패:", paymentError);
      }


      navigate(`/chat/${data.room_id}`, { 
        state: { 
          ...data,
          orderId: paymentData.orderId,

          deposit: boardData.deposit,
          isBuyer: isBuyer

        } 
      });
    } catch (error) {
      console.error("게시글 정보 가져오기 실패:", error);
      // 에러가 발생해도 기본 정보만이라도 전달
      navigate(`/chat/${data.room_id}`, { state: data });
    }
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