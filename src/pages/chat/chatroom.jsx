import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

import { getChattingData } from "./hook";
import "./chatroom.css";

export default function ChatRoom() {

  const location = useLocation();
  const data = location.state;

  const uuid = localStorage.getItem('uuid')

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const stompClientRef = useRef(null);
  const isConnected = useRef(false);
  const scrollRef = useRef();
  const pageRef = useRef(0);

  /**
   * 이전 메시지 데이터 로드
   * stomp 연결
   */
  useEffect(() => {
    if (isConnected.current) return;

    console.log(data);

    const socket = new SockJS("http://localhost:8080/ws");
    let stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    const headers = {
      uuid: uuid
    };

    stompClient.connect(headers, function(frame) {
      console.log('Connected: ' + frame);
      isConnected.current = true;

      stompClient.subscribe(`/topic/chat/${data.room_id}`, function(message) {
        const data = JSON.parse(message.body);
        setMessages((prev) => [...prev, data]);
      });
    });

    loadMessageData();

    return () => {
      stompClient.disconnect(() => {
        console.log("Disconnected");
      });
    };
  }, [])

  /**
   * 맨 처음, 메시지를 보낼 때 스크롤 맨 밑으로 고정
   */
  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages])

  /**
   * 이전 채팅 기록 50개를 호출
   */
  const loadMessageData = async() => {
    const message_list = await getChattingData(data, pageRef);
    setMessages(message_list);
  }

  /**
   * 더 과거의 채팅 기록 50개를 추가 호출
   */
  const loadMoreMessageData = async() => {
    try {
      pageRef.current += 1;
      const message_list = await getChattingData(data, pageRef);
      setMessages((prev) => [...message_list, ...prev]);
    } catch(error) {
      console.error("과거 채팅 기록 불러오기 중 오류 발생:", error);
    }
  }

  /**
   * 엔터로 메시지 전송
   * @param {*} e 
   */
  const activeEnter = (e) => {
    if(e.key === "Enter") {
      handleSend();
    }
  }

  /**
   * 텍스트 메시지 핸들러
   * @returns 
   */
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
        author_uuid: data.uuid,
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

  /**
   * 결제 메시지 핸들러
   */
  const handlePay = () => {
    const stompClient = stompClientRef.current
    if (stompClient?.connected) {

      const now = new Date();
      const kstOffset = now.getTime() + (9 * 60 * 60 * 1000); // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(`/app/chat/${data.room_id}`, {}, JSON.stringify({
        type: 'PAY',
        author_uuid: uuid,
        content: "",
        created_at: created_at,
        room_id: data.room_id,
      }));
    }
    else {
      console.log("연결이 되지 않았습니다.");
    }
  }

  /**
   * 지도 메시지 핸들러
   */
  const handleMap = () => {
    const stompClient = stompClientRef.current
    if (stompClient?.connected) {

      const now = new Date();
      const kstOffset = now.getTime() + (9 * 60 * 60 * 1000); // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(`/app/chat/${data.room_id}`, {}, JSON.stringify({
        type: 'MAP',
        author_uuid: uuid,
        content: "",
        created_at: created_at,
        room_id: data.room_id,
      }));
    }
    else {
      console.log("연결이 되지 않았습니다.");
    }
  }

  /**
   * 타입별 메시지 UI 렌더링
   * @param {*} msg 
   * @param {*} index 
   * @returns 
   */
  const renderMessage = (msg, index) => {
    const isMine = msg.author_uuid === uuid;
  
    switch (msg.type) {
      case 'SYSTEM':
        return (
          <div key={index} className="system-message">
            {msg.content}
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
                  <button onClick={() => { navigate('/checkout', { state: { board_id: data.board_id, type: data.type } }) }}> 결제하기 </button>
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
              <button onClick={() => { navigate('/map', { state: { uuid: uuid, room_id: data.room_id } }) }}>지도 확인하기</button>
            </div>
          </div>
        );
  
      default:
        return null;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>{data.name}</span>
        <span>
          <button onClick={() => {handleMap()}} className="pay-btn">위치 공유</button>
          <button onClick={() => {handlePay()}} className="pay-btn">결제 요청</button>
        </span>
      </div>
      <div className="chat-box" ref={scrollRef}>
        <button className="load-more-btn" onClick={() => {loadMoreMessageData()}}>
          이전 대화 더보기
        </button>
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={activeEnter}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  )
}