import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { getChattingData, uploadImage } from "./hook";
import "./chatroom.css";

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const uuid = localStorage.getItem("uuid");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);

  const stompClientRef = useRef(null);
  const isConnected = useRef(false);
  const scrollRef = useRef();
  const pageRef = useRef(0);

  useEffect(() => {
    if (!location.state || !location.state.room_id) {
      console.error("채팅방 정보가 없습니다.");
      navigate("/chat");  // 채팅 목록으로 리다이렉트
      return;
    }
  }, [location.state, navigate]);

  const data = location.state || {};

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
      console.log("isAuthor 상태:", isAuthorCheck);
      console.log("게시글 타입:", data.type);
  
      setIsAuthor(isAuthorCheck);
      
      if (data.type === 'RENTAL') {
        try {
          const paymentResponse = await fetch(`http://localhost/api/payment/${data.board_id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (paymentResponse.status === 404) {
            console.log("결제 정보가 없습니다.");
            setIsBuyer(false);
            return;
          }

          if (!paymentResponse.ok) {
            console.error("결제 정보 API 오류:", paymentResponse.status);
            setIsBuyer(false);
            return;
          }

          const paymentData = await paymentResponse.json();
          console.log("결제 정보:", paymentData);
          
          if (paymentData && paymentData.orderId) {
            setIsBuyer(true);
            console.log("isBuyer 상태: true");
          } else {
            setIsBuyer(false);
            console.log("isBuyer 상태: false");
          }
        } catch (error) {
          console.error("결제 정보 가져오기 실패:", error);
          setIsBuyer(false);
        }
      } else {
        setIsBuyer(false);
      }

    } catch (error) {
      console.error("글 작성자 정보 가져오기 실패:", error);
    }
  };

  /**
   * 이전 메시지 데이터 로드
   * stomp 연결
   */
  useEffect(() => {
    if (isConnected.current || !data.room_id) return;

    fetchAuthorInfo();

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        uuid: uuid,
      },
      onConnect: () => {
        console.log("Connected!");
        isConnected.current = true;

        client.subscribe(`/topic/chat/${data.room_id}`, (message) => {
          const newMessage = JSON.parse(message.body);
          
          if (newMessage.type === "PAY") {
            try {
              const paymentData = JSON.parse(newMessage.content);
            } catch (error) {
              console.error("Payment data parsing error:", error);
            }
          }

          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) => 
                msg.type === newMessage.type && 
                msg.author_uuid === newMessage.author_uuid && 
                msg.created_at === newMessage.created_at
            );

            if (isDuplicate) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
      },
      onDisconnect: () => {
        console.log("Disconnected");
        isConnected.current = false;
      }
    });

    stompClientRef.current = client;
    client.activate();

    loadMessageData();

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [data.room_id, uuid]);

  /**
   * 맨 처음, 메시지를 보낼 때 스크롤 맨 밑으로 고정
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
    const client = stompClientRef.current;
    if (client?.connected) {
      if (input.trim() === "") return;

      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "TEXT",
          author_uuid: uuid,
          content: input,
          created_at: created_at,
          room_id: data.room_id,
        })
      });

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

    const client = stompClientRef.current;
    if (client?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "IMAGE",
          author_uuid: uuid,
          content: image_url,
          created_at: created_at,
          room_id: data.room_id,
        })
      });
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 결제 메시지 핸들러
   */
  const handlePay = async () => {
    try {
      const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      const boardData = await response.json();  

      const deposit = data.type === 'RENTAL' ? (boardData.deposit || 0) : 0;
   

      const paymentInfo = {
        price: boardData.price,
        deposit: deposit,
        totalAmount: data.type === 'RENTAL' ? boardData.price + deposit : boardData.price,
        actualPrice: boardData.price,  // 실제 결제금액 (보증금 제외)
        boardId: data.board_id,
        type: data.type
      };
      

      const client = stompClientRef.current;
      if (client?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const message = {
          type: "PAY",
          author_uuid: uuid,
          content: JSON.stringify(paymentInfo),
          created_at: created_at,
          room_id: data.room_id,
        };
        

        client.publish({
          destination: `/app/chat/${data.room_id}`,
          body: JSON.stringify(message)
        });
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
    const client = stompClientRef.current;
    if (client?.connected) {
      const now = new Date();
      const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstOffset);
      const created_at = kstDate.toISOString().slice(0, 19);

      client.publish({
        destination: `/app/chat/${data.room_id}`,
        body: JSON.stringify({
          type: "MAP",
          author_uuid: uuid,
          content: "",
          created_at: created_at,
          room_id: data.room_id,
        })
      });
    } else {
      console.log("연결이 되지 않았습니다.");
    }
  };

  /**
   * 환불 메시지 핸들러
   */
  const handleRefund = async () => {
    try {
      const paymentResponse = await fetch(`http://localhost/api/payment/${data.board_id}`, {
        credentials: 'include'
      });
      const paymentData = await paymentResponse.json();

      if (!paymentData.orderId) {
        alert("결제 정보를 찾을 수 없습니다.");
        return;
      }

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

      const client = stompClientRef.current;
      if (client?.connected) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const message = {
          type: "REFUND",
          author_uuid: uuid,
          content: JSON.stringify(refundInfo),
          created_at: created_at,
          room_id: data.room_id,
        };

        client.publish({
          destination: `/app/chat/${data.room_id}`,
          body: JSON.stringify(message)
        });
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

  // Check if a COMPLETE_PAYMENT message with approval info exists in the chat
  const isPaymentApprovedInChat = (() => {
    if (!Array.isArray(messages)) return false;
    return messages.some(msg => {
      if (!msg || !msg.type) return false;
      if (msg.type === "COMPLETE_PAYMENT") {
        try {
          const paymentData = JSON.parse(msg.content);
          return !!paymentData && !!paymentData.approvedAt;
        } catch (error) {
          console.error("Error parsing payment data for refund button check:", error);
          return false;
        }
      }
      return false;
    });
  })();

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
            <div className={`payment-request-card ${isMine ? "me" : "other"}`}>
              <div className="payment-request-header">
                <h3>{isMine ? '결제 요청을 보냈어요' : '결제 요청을 받았어요'}</h3>
              </div>
              {paymentData && (
                <div className="payment-request-content">
                  <div className="payment-info-item">
                    <span className="label">상품명</span>
                    <span className="value">{data.name}</span>
                  </div>
                  {data.type === 'RENTAL' ? (
                    <>
                      <div className="payment-info-item">
                        <span className="label">결제 금액</span>
                        <span className="value">{paymentData.actualPrice ? paymentData.actualPrice.toLocaleString() : (paymentData.price || 0).toLocaleString()}원</span>
                      </div>
                      {paymentData.deposit > 0 && (
                        <div className="payment-info-item">
                          <span className="label">보증금</span>
                          <span className="value">{paymentData.deposit.toLocaleString()}원</span>
                        </div>
                      )}
                      <div className="payment-info-item">
                        <span className="label">총 결제 금액</span>
                        <span className="value">{paymentData.totalAmount ? paymentData.totalAmount.toLocaleString() : 0}원</span>
                      </div>
                    </>
                  ) : (
                    <div className="payment-info-item">
                      <span className="label">결제 금액</span>
                      <span className="value">{paymentData.price ? paymentData.price.toLocaleString() : 0}원</span>
                    </div>
                  )}
                  {!isMine && (
                    <div className="payment-request-buttons">
                      <button
                        onClick={() => {
                          navigate(`/board/deal/${data.board_id}`, {
                            state: { from: 'chat' }
                          });
                        }}
                        className="detail-btn"
                      >
                        상품 상세 보기
                      </button>
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
                        className="pay-btn"
                      >
                        결제하기
                      </button>
                    </div>
                  )}
                </div>
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

      case "COMPLETE_PAYMENT":
        let completePaymentData;
        try {
          completePaymentData = msg.content ? JSON.parse(msg.content) : null;
        } catch (error) {
          completePaymentData = null;
        }
        // Determine position based on whether the current user is the author of the board
        const displayOnRight = !isAuthor; // If current user is NOT the author (i.e., the buyer), display on the right
        return (
          <div key={index} className={`message-wrapper ${displayOnRight ? "me" : "other"}`}> {/* Apply me/other class based on displayOnRight */}
            <div className={`payment-complete-card ${displayOnRight ? "me" : "other"}`}> {/* Apply me/other class to the card too */}
              <div className="payment-complete-header">
                <h3>결제가 완료되었습니다</h3>
              </div>
              {completePaymentData && (
                <div className="payment-complete-content">
                  <div className="payment-info-item">
                    <span className="label">주문번호</span>
                    <span className="value">{completePaymentData.orderId}</span>
                  </div>
                  <div className="payment-info-item">
                    <span className="label">결제금액</span>
                    <span className="value">{Number(completePaymentData.totalAmount).toLocaleString()}원</span>
                  </div>
                  <div className="payment-info-item">
                    <span className="label">결제수단</span>
                    <span className="value">{completePaymentData.method || '카드'}</span>
                  </div>
                  <div className="payment-info-item">
                    <span className="label">승인일시</span>
                    <span className="value">{completePaymentData.approvedAt ? new Date(completePaymentData.approvedAt).toLocaleString() : '-'}</span>
                  </div>
                </div>
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

      case "COMPLETE_REFUND":
        let completeRefundData;
        try {
          console.log('Received refund message content:', msg.content);
          if (typeof msg.content === 'string' && msg.content.startsWith('{')) {
            completeRefundData = JSON.parse(msg.content);
          } else {
            completeRefundData = {
              message: msg.content
            };
          }
          console.log('Parsed refund data:', completeRefundData);
        } catch (error) {
          console.error('Error parsing refund data:', error);
          completeRefundData = {
            message: msg.content
          };
        }
        return (
          <div key={index} className="system-message">
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
              marginBottom: "20px",
            }}>
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="#5580e6" />
                <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 style={{ marginTop: "15px", color: "#5580e6" }}>{completeRefundData.message}</h2>
              {completeRefundData.orderId && (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "15px",
                  marginTop: "15px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "80%",
                  maxWidth: "300px"
                }}>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>{`환불번호: ${completeRefundData.orderId || '-'}`}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>{`환불금액: ${Number(completeRefundData.totalAmount || 0).toLocaleString()}원`}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>{`환불수단: ${completeRefundData.method || '-'}`}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>{`환불일시: ${completeRefundData.approvedAt ? new Date(completeRefundData.approvedAt).toLocaleString() : '-'}`}</p>
                </div>
              )}
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

          {isAuthor && (
            <button onClick={handlePay} className="pay-btn">
              결제 요청
            </button>
          )}

          {data.type === 'RENTAL' && !isAuthor && isBuyer && (
            <>
              <button
                onClick={handleRefund}
                className="pay-btn"
                disabled={!isPaymentApprovedInChat}
              >
                환불 요청
              </button>
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
