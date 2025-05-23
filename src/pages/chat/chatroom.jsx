import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";

import "./chatroom.css";

export default function ChatRoom() {

  const location = useLocation();
  const data = location.state;

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const stompClientRef = useRef(null);
  const isConnected = useRef(false);

  const user_id = sessionStorage.getItem('user_id');

  const pageRef = useRef(0);

  useEffect(() => {
    //이전 메시지 로드
    loadMessageData();

    //stomp 연결
    if (isConnected.current) return;

    const socket = new SockJS("http://localhost:8080/ws");
    let stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    stompClient.connect({}, function(frame) {
      console.log('Connected: ' + frame);
      isConnected.current = true;

      stompClient.subscribe(`/topic/chat/${data.room_id}`, function(message) {
        const data = JSON.parse(message.body);
        setMessages((prev) => [...prev, data]);
      });
    });

    return () => {
      stompClient.disconnect(() => {
        console.log("Disconnected");
      });
    };
  }, [])

  const loadMessageData = async() => {
    try {
      const response = await axios.get(`http://localhost/api/chat/recent/${data.room_id}?page=${pageRef.current}&size=50&sort=createdAt,desc`, {
        withCredentials: true,
      })
      console.log("message data: ", response);
      setMessages(response.data.reverse());
    } catch(error) {
      console.error("최근 채팅 기록 불러오기 중 오류 발생:", error);
    }
  }

  const loadMoreMessageData = async() => {
    try {
      pageRef.current += 1;
      const response = await axios.get(`http://localhost/api/chat/recent/${data.room_id}?page=${pageRef.current}&size=50&sort=createdAt,desc`, {
        withCredentials: true,
      })
      const reversedData = response.data.reverse();
      setMessages((prev) => [...reversedData, ...prev]);
    } catch(error) {
      console.error("과거 채팅 기록 불러오기 중 오류 발생:", error);
    }
  }

  const handleSend = () => {
    const stompClient = stompClientRef.current
    if (stompClient?.connected) {
      if (input.trim() === "") return;

      const now = new Date();
      const kstOffset = now.getTime() + (9 * 60 * 60 * 1000); // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(`/app/chat/${data.room_id}`, {}, JSON.stringify({
        type: 'TEXT',
        author_uuid: user_id,
        content: input,
        created_at: created_at,
        room_id: data.room_id,
      }));

      setInput("");
    }
    else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  const handlePay = () => {
    const stompClient = stompClientRef.current
    if (stompClient?.connected) {

      const now = new Date();
      const kstOffset = now.getTime() + (9 * 60 * 60 * 1000); // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(`/app/chat/${data.room_id}`, {}, JSON.stringify({
        type: 'PAY',
        author_uuid: user_id,
        content: "",
        created_at: created_at,
        room_id: data.room_id,
      }));
    }
    else {
      console.log("연결이 되지 않았습니다.");
    }
  }

  const handleMap = () => {
    const stompClient = stompClientRef.current
    if (stompClient?.connected) {

      const now = new Date();
      const kstOffset = now.getTime() + (9 * 60 * 60 * 1000); // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(`/app/chat/${data.room_id}`, {}, JSON.stringify({
        type: 'MAP',
        author_uuid: user_id,
        content: "",
        created_at: created_at,
        room_id: data.room_id,
      }));
    }
    else {
      console.log("연결이 되지 않았습니다.");
    }
  }

  const renderMessage = (msg, index) => {
    const isMine = msg.author_uuid === user_id;
  
    switch (msg.type) {
      case 'SYSTEM':
        return (
          <div key={index} className="system-message">
            시스템 메시지
          </div>
        );
  
      case 'TEXT':
        return (
          <div key={index} className={`message-wrapper ${isMine ? 'me' : 'other'}`}>
            <div className={`message ${isMine ? 'me' : 'other'}`}>
              {msg.content}
            </div>
          </div>
        );

  
      case 'IMAGE':
        return (
          <div key={index} className={`message-wrapper ${isMine ? 'me' : 'other'}`}>
            <div className={`message ${isMine ? 'me' : 'other'}`}>
              <img src={msg.content} alt="이미지 메시지" style={{ maxWidth: '200px' }} />
            </div>
          </div>
        );
  
      case 'PAY':
        return (
          <div key={index} className={`message-wrapper ${isMine ? 'me' : 'other'}`}>
            <div className={`message ${isMine ? 'me' : 'other'}`}>
              {isMine ?
                <div>결제 요청을 보냈어요</div> 
              :
                <>
                  <div>결제 요청을 받았어요</div>
                  <button onClick={() => { navigate('/checkout', { state: { boardId: data.boardId, type: data.type } }) }}> 결제하기 </button>
                </>
              }
            </div>
          </div>
        );
  
      case 'MAP':
        return (
          <div key={index} className="map-wrapper">
            <div className="map">
              <div>지도로 상대방의 위치를 확인하세요</div>
              <button onClick={() => { navigate('/map') }}>지도 확인하기</button>
            </div>
          </div>
        );
  
      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <button onClick={() => {loadMoreMessageData()}}>채팅 더보기</button>
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      <button onClick={() => {handlePay()}}>결제 요청</button>
      <button onClick={() => {handleMap()}}>위치 확인</button>
      <div className="input-container">
        <input 
          type="text" 
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => {handleSend()}}>전송</button>
      </div>
    </div>
  )
}