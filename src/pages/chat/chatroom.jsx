import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

import { getChattingData, uploadImage } from "./hook";
import "./chatroom.css";

export default function ChatRoom() {
  const location = useLocation();
  const data = location.state;
  const uuid = localStorage.getItem("uuid");
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  const stompClientRef = useRef(null);
  const isConnected = useRef(false);
  const scrollRef = useRef();
  const pageRef = useRef(0);

  /**
   * 글 작성자 정보 가져오기
   */
  const fetchAuthorInfo = async () => {
    try {
      console.log("게시글 정보 요청 시작:", data.board_id);
      const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      console.log("API 응답 상태:", response.status);
      const boardData = await response.json();
    
      const isAuthorCheck = boardData.author_uuid === uuid;
  
      setIsAuthor(isAuthorCheck);

    } catch (error) {
      console.error("글 작성자 정보 가져오기 실패:", error);
    }
  };

  /**
   * 이전 메시지 데이터 로드
   * stomp 연결
   */
  useEffect(() => {
    if (isConnected.current) return;

    fetchAuthorInfo();

    const socket = new SockJS("http://localhost:8080/ws");
    let stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    const headers = {
      uuid: uuid,
    };

    stompClient.connect(headers, function (frame) {
      console.log("Connected: " + frame);
      isConnected.current = true;

      stompClient.subscribe(`/topic/chat/${data.room_id}`, function (message) {
        const data = JSON.parse(message.body);
      
        if (data.type === "PAY") {
          try {
            const paymentData = JSON.parse(data.content);
           
          } catch (error) {
            console.error("Payment data parsing error:", error);
          }
        }
        setMessages((prev) => [...prev, data]);
      });
    });

    loadMessageData();

    return () => {
      stompClient.disconnect(() => {
        console.log("Disconnected");
      });
    };
  }, []);

  /**
   * 맨 처음, 메시지를 보낼 때 스크롤 맨 밑으로 고정
   */
  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /**
   * 이전 채팅 기록 50개를 호출
   */
  const loadMessageData = async () => {
    const message_list = await getChattingData(data, pageRef);
    setMessages(message_list);
  };

  /**
   * 더 과거의 채팅 기록 50개를 추가 호출
   */
  const loadMoreMessageData = async () => {
    try {
      pageRef.current += 1;
      const message_list = await getChattingData(data, pageRef);
      setMessages((prev) => [...message_list, ...prev]);
    } catch (error) {
      console.error("과거 채팅 기록 불러오기 중 오류 발생:", error);
    }
  };

  /**
   * 엔터로 메시지 전송
   * @param {*} e
   */
  const activeEnter = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  /**
   * TODO 텍스트 / 이미지 분기점, 텍스트 메시지 핸들러는 새로 하나 만들 것
   * 텍스트 메시지 핸들러
   * @returns
   */
  const handleSend = () => {
    const stompClient = stompClientRef.current;
    if (stompClient?.connected) {
      if (input.trim() === "") return;

      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000; // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(
        `/app/chat/${data.room_id}`,
        {},
        JSON.stringify({
          type: "TEXT",
          author_uuid: uuid,
          content: input,
          created_at: created_at,
          room_id: data.room_id,
        })
      );

      setInput("");
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 이미지 메시지 핸들러
   */
  const handleImage = async () => {
    const formData = new FormData();
    formData.append("image", image);

    console.log(image);

    const image_url = await uploadImage(formData);
    console.log(image_url);

    const stompClient = stompClientRef.current;
    if (stompClient?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000; // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(
        `/app/chat/${data.room_id}`,
        {},
        JSON.stringify({
          type: "IMAGE",
          author_uuid: uuid,
          content: image_url,
          created_at: created_at,
          room_id: data.room_id,
        })
      );
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 결제 메시지 핸들러
   */
  const handlePay = async () => {
    try {
      // 게시글 정보 가져오기
      const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      const boardData = await response.json();  

      // 렌탈 게시글인 경우 deposit 값 확인
      const deposit = data.type === 'RENTAL' ? (boardData.deposit || 0) : 0;
   

      const paymentInfo = {
        price: boardData.price,
        deposit: deposit,
        totalAmount: data.type === 'RENTAL' ? boardData.price + deposit : boardData.price,
        actualPrice: boardData.price,  // 실제 결제금액 (보증금 제외)
        boardId: data.board_id,
        type: data.type
      };
      

      const stompClient = stompClientRef.current;
      if (stompClient?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000; // +9시간
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const message = {
          type: "PAY",
          author_uuid: uuid,
          content: JSON.stringify(paymentInfo),
          created_at: created_at,
          room_id: data.room_id,
        };
        

        stompClient.send(
          `/app/chat/${data.room_id}`,
          {},
          JSON.stringify(message)
        );
      } else {
        console.log("연결이 되지 않았습니다.");
      }
    } catch (error) {
      console.error("결제 정보 가져오기 실패:", error);
    }
  };

  /**
   * 지도 메시지 핸들러
   */
  const handleMap = () => {
    const stompClient = stompClientRef.current;
    if (stompClient?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000; // +9시간
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      stompClient.send(
        `/app/chat/${data.room_id}`,
        {},
        JSON.stringify({
          type: "MAP",
          author_uuid: uuid,
          content: "",
          created_at: created_at,
          room_id: data.room_id,
        })
      );
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 환불 메시지 핸들러
   */
  const handleRefund = async () => {
    try {
      // 결제 정보 가져오기
      const paymentResponse = await fetch(`http://localhost/api/payment/${data.board_id}`, {
        credentials: 'include'
      });
      const paymentData = await paymentResponse.json();

      if (!paymentData.orderId) {
        alert("결제 정보를 찾을 수 없습니다.");
        return;
      }

      // 게시글 정보 가져오기
      const boardResponse = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      const boardData = await boardResponse.json();  

      const refundInfo = {
        price: boardData.price,
        deposit: data.type === 'RENTAL' ? (boardData.deposit || 0) : 0,
        totalAmount: data.type === 'RENTAL' ? boardData.price + (boardData.deposit || 0) : boardData.price,
        boardId: data.board_id,
        type: data.type,
        orderId: paymentData.orderId
      };

      const stompClient = stompClientRef.current;
      if (stompClient?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000; // +9시간
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const message = {
          type: "REFUND",
          author_uuid: uuid,
          content: JSON.stringify(refundInfo),
          created_at: created_at,
          room_id: data.room_id,
        };

        stompClient.send(
          `/app/chat/${data.room_id}`,
          {},
          JSON.stringify(message)
        );
      } else {
        console.log("연결이 되지 않았습니다.");
      }
    } catch (error) {
      console.error("환불 요청 실패:", error);
      alert("환불 요청 중 오류가 발생했습니다.");
    }
  };

  /**
   * 구매확정 핸들러
   */
  const handlePurchaseConfirm = () => {
    navigate("/test-refund", {
      state: {
        board_id: data.board_id,
        room_id: data.room_id,
        room_name: data.name,
        orderId: data.orderId
      }
    });
  };

  const addImage = (e) => {
    setImage(e.target.files[0]);
  };

  /**
   * 타입별 메시지 UI 렌더링
   * @param {*} msg
   * @param {*} index
   * @returns
   */
  const renderMessage = (msg, index) => {
    const isMine = msg.author_uuid === uuid; //메세지 글쓴이가 나라면

    switch (msg.type) {
      case "SYSTEM":
        return (
          <div key={index} className="system-message">
            {msg.content}
          </div>
        );

      case "TEXT":
        return (
          <div
            key={index}
            className={`message-wrapper ${isMine ? "me" : "other"}`}
          >
            <div className={`message ${isMine ? "me" : "other"}`}>
              {msg.content}
            </div>
          </div>
        );

      case "IMAGE":
        return (
          <div
            key={index}
            className={`message-wrapper ${isMine ? "me" : "other"}`}
          >
            <div className={`message ${isMine ? "me" : "other"}`}>
              <img
                src={msg.content}
                alt="이미지 메시지"
                style={{ maxWidth: "200px" }}
              />
            </div>
          </div>
        );

      case "PAY":
        let paymentData;
        try {
          paymentData = msg.content ? JSON.parse(msg.content) : null;
        } catch (error) {
          paymentData = null;
        }
        return (
          <div key={index} className={`message-wrapper ${isMine ? "me" : "other"}`}>
            <div className={`message ${isMine ? "me" : "other"}`}>
              {isMine ? (
                <div>결제 요청을 보냈어요</div>
              ) : (
                <>
                  <div>결제 요청을 받았어요</div>
                  {paymentData && (
                    <div className="payment-request-info">
                      {data.type === 'RENTAL' ? (
                        <>
                          <p>결제 금액: {paymentData.actualPrice ? paymentData.actualPrice.toLocaleString() : (paymentData.price || 0).toLocaleString()}원</p>
                          {paymentData.deposit > 0 && (
                            <p>보증금: {paymentData.deposit.toLocaleString()}원</p>
                          )}
                          <p>총 결제 금액: {paymentData.totalAmount ? paymentData.totalAmount.toLocaleString() : 0}원</p>
                        </>
                      ) : (
                        <p>결제 금액: {paymentData.price ? paymentData.price.toLocaleString() : 0}원</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      navigate("/checkout", {
                        state: {
                          board_id: data.board_id,
                          type: data.type,
                          room_id: data.room_id,
                          room_name: data.name,
                          successUrl: `${window.location.origin}/success?orderId=${paymentData?.orderId}&amount=${paymentData?.totalAmount}&type=${data.type}&room_id=${data.room_id}&board_id=${data.board_id}&room_name=${encodeURIComponent(data.name)}`,
                          failUrl: "/fail",
                          return_to: null
                        },
                      });
                    }}
                  >
                    결제하기
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "REFUND":
        let refundData;
        try {
          refundData = msg.content ? JSON.parse(msg.content) : null;
        } catch (error) {
          refundData = null;
        }
        return (
          <div key={index} className={`message-wrapper ${isMine ? "me" : "other"}`}>
            <div className={`message ${isMine ? "me" : "other"}`}>
              {isMine ? (
                <div>환불 요청을 보냈어요</div>
              ) : (
                <>
                  <div>환불 요청을 받았어요</div>
                  <button
                    onClick={() => {
                      navigate("/test-refund", {
                        state: {
                          board_id: data.board_id,
                          room_id: data.room_id,
                          room_name: data.name,
                          orderId: refundData?.orderId,
                          type: data.type
                        }
                      });
                    }}
                  >
                    환불하기
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "MAP":
        return (
          <div key={index} className="map-wrapper">
            <div className="map">
              <div>지도로 상대방의 위치를 확인하세요</div>
              <button
                onClick={() => {
                  navigate("/map", {
                    state: { uuid: uuid, room_id: data.room_id },
                  });
                }}
              >
                지도 확인하기
              </button>
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
          <button onClick={handleMap} className="pay-btn">
            위치 공유
          </button>
          {!isAuthor && (
            <button onClick={handlePurchaseConfirm} className="pay-btn">
              구매확정
            </button>
          )}
          {isAuthor && (
            <>
              <button onClick={handlePay} className="pay-btn">
                결제 요청
              </button>
              {data.type === 'RENTAL' && (
                <button onClick={handleRefund} className="pay-btn">
                  환불 요청
                </button>
              )}
            </>
          )}
        </span>
      </div>
      <div className="chat-box" ref={scrollRef}>
        <button className="load-more-btn" onClick={loadMoreMessageData}>
          이전 대화 더보기
        </button>
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      <div className="input-container">
        <input
          type="file"
          className="image-btn"
          id="image-upload"
          style={{ display: "none" }}
          onChange={addImage}
        />
        <label htmlFor="image-upload" className="send-btn">
          +
        </label>
        <button className="send-btn" onClick={handleImage}>
          임시 이미지 전송
        </button>
        <input
          type="text"
          className="input-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={activeEnter}
          placeholder="메시지를 입력하세요..."
        />
        <button className="send-btn" onClick={handleSend}>
          전송
        </button>
      </div>
    </div>
  );
}
