import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { getChattingData, uploadImage } from "./hook";
import "./chatroom.css";

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};
  const uuid = localStorage.getItem("uuid");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [openPaymentDetail, setOpenPaymentDetail] = useState({});
  const [openRefundDetail, setOpenRefundDetail] = useState({});

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

  /**
   * 글 작성자 정보 가져오기
   */
  const fetchAuthorInfo = async () => {
    try {
      const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      const boardData = await response.json();
    
      const isAuthorCheck = boardData.author_uuid === uuid;
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
            setIsBuyer(false);
            return;
          }

          if (!paymentResponse.ok) {
            setIsBuyer(false);
            return;
          }

          const paymentData = await paymentResponse.json();
          
          if (paymentData && paymentData.orderId) {
            setIsBuyer(true);
          } else {
            setIsBuyer(false);
          }
        } catch (error) {
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
                msg.created_at === newMessage.created_at &&
                msg.content === newMessage.content
            );

            if (isDuplicate) {
              console.log("Duplicate message detected, skipping:", newMessage);
              return prev;
            }

            console.log("New message received:", newMessage);
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
   * 보증금 반환 요청 메시지 핸들러
   */
  const handleRefund = async (refundMessage) => {
    try {
      if (!refundMessage || !refundMessage.content) {
        alert("보증금 반환 요청 정보를 찾을 수 없습니다.");
        return;
      }

      let refundMessageData;
      try {
        refundMessageData = JSON.parse(refundMessage.content);
        console.log("Refund Message Data:", refundMessageData);
        if (!refundMessageData || typeof refundMessageData !== 'object') {
          throw new Error("보증금 반환 요청 데이터 형식이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("Refund message parsing error:", error);
        alert("보증금 반환 요청 정보를 처리하는데 실패했습니다. 다시 시도해주세요.");
        return;
      }

      // 게시글 정보 가져오기
      const boardResponse = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
        credentials: 'include'
      });
      
      if (!boardResponse.ok) {
        throw new Error('게시글 정보를 가져오는데 실패했습니다.');
      }
      
      const boardData = await boardResponse.json();
      console.log("Board Data:", boardData);

      const paymentResponse = await fetch(`http://localhost/api/payment/${data.board_id}`, {
        credentials: 'include'
      });
      
      if (!paymentResponse.ok) {
        throw new Error('결제 정보를 가져오는데 실패했습니다.');
      }
      
      const paymentData = await paymentResponse.json();
      console.log("Payment Data:", paymentData);

      if (!paymentData || !paymentData.orderId) {
        alert("결제 정보를 찾을 수 없습니다.");
        return;
      }

      const refundInfo = {
        orderId: paymentData.orderId,
        room_id: data.room_id,
        room_name: data.name,
        board_id: data.board_id,
        type: data.type,
        deposit: boardData.deposit || 0
      };

      console.log("Refund Info:", refundInfo);

      // 필수 정보 확인
      const requiredFields = ['orderId', 'room_id', 'room_name', 'board_id', 'type'];
      const missingFields = requiredFields.filter(field => !refundInfo[field]);
      
      if (missingFields.length > 0) {
        alert(`보증금 반환 요청에 필요한 정보가 누락되었습니다: ${missingFields.join(', ')}`);
        return;
      }

      setRefundData(refundInfo);
      setShowRefundModal(true);
    } catch (error) {
      console.error("Refund handling error:", error);
      alert(error.message || "보증금 반환 요청 정보를 가져오는데 실패했습니다.");
    }
  };


  const addImage = (e) => {
    setImage(e.target.files[0]);
  };

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

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundData(null);
  };

  // closeRefundModal 함수를 전역으로 노출
  useEffect(() => {
    window.closeRefundModal = closeRefundModal;


    const handleMessage = (event) => {

      if (event.origin === window.location.origin) {
        if (typeof event.data === 'object' && event.data !== null && event.data.type === 'closeRefundModal') {
          closeRefundModal();

          // 보증금 반환 완료 STOMP 메시지 전송
          const refundCompleteInfo = event.data.refundInfo;
          console.log(refundCompleteInfo);
          if (refundCompleteInfo) {
             const client = stompClientRef.current;
              if (client?.connected) {
                const now = new Date();
                const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
                const kstDate = new Date(kstOffset);
                const created_at = kstDate.toISOString().slice(0, 19);

                const refundMessage = {
                  message: "보증금 반환이 완료되었습니다.",
                  orderId: refundCompleteInfo.orderId,
                  totalAmount: refundCompleteInfo.deposit || 0,
                  method: "간편결제",
                  approvedAt: refundCompleteInfo.approvedAt || created_at
                };

                client.publish({
                  destination: `/app/chat/${data.room_id}`,
                  body: JSON.stringify({
                    type: "COMPLETE_REFUNDED",
                    author_uuid: uuid,
                    content: JSON.stringify(refundMessage),
                    created_at: created_at,
                    room_id: data.room_id,
                  })
                });
              } else {
                 console.error('STOMP client not connected, cannot send COMPLETE_REFUNDED message.');
              }
          } else {
             console.error('Refund info not found in message data, cannot send COMPLETE_REFUNDED.');
          }

        } else if (typeof event.data === 'string' && event.data === 'closeRefundModal') { // 레거시 메시지 처리 로직 제거
           console.log('Legacy close refund modal message received with matching origin, closing modal.');
           closeRefundModal();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      delete window.closeRefundModal;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const togglePaymentDetail = (idx) => {
    setOpenPaymentDetail((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleRefundDetail = (idx) => {
    setOpenRefundDetail((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  /**
   * 타입별 메시지 UI 렌더링
   * @param {*} msg
   * @param {*} index
   * @returns
   */
  const renderMessage = (msg, index) => {
    const isMine = msg.author_uuid === uuid; // isMine를 함수 스코프 시작 부분에 한 번만 선언합니다. // 주석 정리

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
                  {data.type === 'RENTAL' && (
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
                      <div className="payment-divider"></div>
                      <div className="payment-info-item total-amount">
                        <span className="label">총 결제 금액</span>
                        <span className="value">{paymentData.totalAmount ? paymentData.totalAmount.toLocaleString() : 0}원</span>
                      </div>
                    </>
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
            <div className={`refund-request-card ${isMine ? "me" : "other"}`}> 
              <div className="refund-request-header">
                <h3>{isMine ? '보증금 반환 요청을 보냈어요' : '보증금 반환 요청을 받았어요'}</h3> 
              </div>
              {refundData && (
                <div className="refund-request-content">
                  <div className="payment-info-item">
                    <span className="label">상품명</span>
                    <span className="value">{data.name}</span>
                  </div>
                  {data.type === 'RENTAL' && (
                    <>
                      <div className="payment-info-item">
                        <span className="label">상품 금액</span>
                        <span className="value">{refundData.actualPrice ? refundData.actualPrice.toLocaleString() : (refundData.price || 0).toLocaleString()}원</span>
                      </div>
                      {refundData.deposit > 0 && (
                        <div className="payment-info-item">
                          <span className="label">보증금</span>
                          <span className="value">{refundData.deposit.toLocaleString()}원</span>
                        </div>
                      )}
                      <div className="payment-info-item">
                        <span className="label">보증금 반환 금액</span>
                        <span className="value refund-amount">-{refundData.deposit ? refundData.deposit.toLocaleString() : 0}원</span>
                      </div>
                    </>
                  )}
                  {!isMine && (
                    <div className="refund-request-buttons">
                      <button
                        onClick={() => handleRefund(msg)}
                        className="pay-btn"
                      >
                        요청 수락
                      </button>
                    </div>
                  )}
                </div>
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
    
        const displayOnRight = !isAuthor; 

        return (
          <div key={index} className={`message-wrapper ${displayOnRight ? "me" : "other"}`}> 
            <div className={`payment-complete-card ${displayOnRight ? "me" : "other"}`} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
              marginBottom: "20px",
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              maxWidth: '70%',
              width: 'auto',
              margin: "20px auto",
              border: "1px solid #e0e0e0"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none"> 
                  <circle cx="50" cy="50" r="45" fill="#1e88e5" />
                  <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ 
                marginTop: "8px", 
                color: "#1565c0", 
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px"
              }}>결제가 완료되었습니다</h3> 
              {completePaymentData && (
                <div className="payment-complete-content" style={{ 
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  padding: "16px",
                  marginTop: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
                  width: "100%",
                }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "14px 20px",
                      background: openPaymentDetail[index] ? "#e3f2fd" : "#fff",
                      borderRadius: "10px",
                      marginBottom: "12px",
                      border: "2px solid #90caf9",
                      boxShadow: openPaymentDetail[index] ? "0 2px 8px rgba(30,136,229,0.08)" : "none",
                      transition: "all 0.3s"
                    }}
                    onClick={() => togglePaymentDetail(index)}
                  >
                    <span style={{
                      fontWeight: "700",
                      color: "#1976d2",
                      fontSize: "16px"
                    }}>결제 상세 정보</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      style={{
                        transform: openPaymentDetail[index] ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s"
                      }}
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                  <div
                    style={{
                      maxHeight: openPaymentDetail[index] ? 500 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                      background: "#f5faff",
                      borderRadius: "10px",
                      border: openPaymentDetail[index] ? "1.5px solid #90caf9" : "none",
                      boxShadow: openPaymentDetail[index] ? "0 2px 8px rgba(30,136,229,0.08)" : "none",
                      marginBottom: openPaymentDetail[index] ? "10px" : "0"
                    }}
                  >
                    <div style={{ padding: openPaymentDetail[index] ? "18px" : "0 18px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #e3f2fd"
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: "15px"
                        }}>주문번호</span>
                        <span style={{
                          color: '#333',
                          fontSize: "15px"
                        }}>{completePaymentData.orderId}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #e3f2fd"
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: "15px"
                        }}>결제금액</span>
                        <span style={{
                          color: '#333',
                          fontSize: "15px",
                          fontWeight: "600"
                        }}>{Number(completePaymentData.totalAmount).toLocaleString()}원</span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #e3f2fd"
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: "15px"
                        }}>결제수단</span>
                        <span style={{
                          color: '#333',
                          fontSize: "15px"
                        }}>{completePaymentData.method || '카드'}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0"
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#1976d2',
                          fontSize: "15px"
                        }}>승인일시</span>
                        <span style={{
                          color: '#333',
                          fontSize: "15px"
                        }}>{completePaymentData.approvedAt ? new Date(completePaymentData.approvedAt).toLocaleString() : '-'}</span>
                      </div>
                    </div>
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

      case "COMPLETE_REFUNDED":
        let completeRefundData;
        try {
          completeRefundData = JSON.parse(msg.content);
          
          // content가 한 번 더 JSON으로 감싸져 있으면 파싱
          if (completeRefundData && typeof completeRefundData.content === 'string') {
            completeRefundData = JSON.parse(completeRefundData.content);
          }
          
          // 혹시라도 orderId/totalAmount가 없으면 msg에서 fallback
          if (!completeRefundData.orderId && msg.orderId) {
            completeRefundData.orderId = msg.orderId;
          }
          if (!completeRefundData.totalAmount && msg.totalAmount) {
            completeRefundData.totalAmount = msg.totalAmount;
          }
        } catch (error) {
          console.error("Error parsing refund data:", error);
          completeRefundData = null;
        }

        return (
           <div key={index} className="message-wrapper me"> 
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
              marginBottom: "20px",
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              maxWidth: '70%',
              width: 'auto',
              margin: "20px auto",
              border: "1px solid #e0e0e0"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#e8f5e9",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none"> 
                  <circle cx="50" cy="50" r="45" fill="#4caf50" /> 
                  <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ 
                marginTop: "8px", 
                color: "#388e3c", 
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px"
              }}>{completeRefundData?.message || "보증금 반환 완료"}</h3> 
              <div style={{ 
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "8px",
                boxShadow: "0 2px 8px rgba(76,175,80,0.04)", 
                width: "100%",
              }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "14px 20px",
                    background: openRefundDetail[index] ? "#e8f5e9" : "#fff",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    border: "2px solid #81c784",
                    boxShadow: openRefundDetail[index] ? "0 2px 8px rgba(76,175,80,0.08)" : "none",
                    transition: "all 0.3s"
                  }}
                  onClick={() => toggleRefundDetail(index)}
                >
                  <span style={{
                    fontWeight: "700",
                    color: "#2e7d32",
                    fontSize: "16px"
                  }}>환불 상세 정보</span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    style={{
                      transform: openRefundDetail[index] ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s"
                    }}
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <div
                  style={{
                    maxHeight: openRefundDetail[index] ? 500 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    border: openRefundDetail[index] ? "1.5px solid #81c784" : "none",
                    boxShadow: openRefundDetail[index] ? "0 2px 8px rgba(76,175,80,0.08)" : "none",
                    marginBottom: openRefundDetail[index] ? "10px" : "0"
                  }}
                >
                  <div style={{ padding: openRefundDetail[index] ? "18px" : "0 18px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e9ecef"
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#2e7d32',
                        fontSize: "15px"
                      }}>주문번호</span>
                      <span style={{
                        color: '#333',
                        fontSize: "15px"
                      }}>{completeRefundData?.orderId || '-'}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e9ecef"
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#2e7d32',
                        fontSize: "15px"
                      }}>보증금</span>
                      <span style={{
                        color: '#333',
                        fontSize: "15px",
                        fontWeight: "600"
                      }}>{completeRefundData?.totalAmount ? Number(completeRefundData.totalAmount).toLocaleString() : '-'}원</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e9ecef"
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#2e7d32',
                        fontSize: "15px"
                      }}>환불수단</span>
                      <span style={{
                        color: '#333',
                        fontSize: "15px"
                      }}>{completeRefundData?.method || '간편결제'}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0"
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#2e7d32',
                        fontSize: "15px"
                      }}>환불일시</span>
                      <span style={{
                        color: '#333',
                        fontSize: "15px"
                      }}>{completeRefundData?.approvedAt ? new Date(completeRefundData.approvedAt).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
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

          {data.type === 'SELL' && isAuthor && (
            <button onClick={handlePay} className="pay-btn">
              결제 요청
            </button>
          )}

          {data.type === 'PURCHASE' && !isAuthor && (
            <button onClick={handlePay} className="pay-btn">
              결제 요청
            </button>
          )}

          {data.type === 'RENTAL' && isAuthor && (
            <button onClick={handlePay} className="pay-btn">
              결제 요청
            </button>
          )}

          {data.type === 'RENTAL' && !isAuthor && (
            <button
              onClick={async () => {
                try {
                  // 게시글 정보 가져오기
                  const response = await fetch(`http://localhost/api/board/${data.type}/${data.board_id}`, {
                    credentials: 'include'
                  });
                  
                  if (!response.ok) {
                    throw new Error('게시글 정보를 가져오는데 실패했습니다.');
                  }
                  
                  const boardData = await response.json();

                  // 환불 요청 메시지 전송
                  const client = stompClientRef.current;
                  if (client?.connected) {
                    const now = new Date();
                    const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
                    const kstDate = new Date(kstOffset);
                    const created_at = kstDate.toISOString().slice(0, 19);

                    const refundMessage = {
                      type: "REFUND",
                      author_uuid: uuid,
                      content: JSON.stringify({
                        price: boardData.price,
                        deposit: boardData.deposit,
                        totalAmount: boardData.price + boardData.deposit,
                        actualPrice: boardData.price,
                        boardId: data.board_id,
                        type: data.type
                      }),
                      created_at: created_at,
                      room_id: data.room_id,
                    };

                    client.publish({
                      destination: `/app/chat/${data.room_id}`,
                      body: JSON.stringify(refundMessage)
                    });
                  }
                } catch (error) {
                  alert(error.message || "보증금 반환 요청을 처리하는데 실패했습니다.");
                }
              }}
              className="pay-btn"
              disabled={!isPaymentApprovedInChat}
            >
              보증금 반환 요청
            </button>
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
      
      {showRefundModal && refundData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>환불 처리</h2>
              <button className="modal-close" onClick={closeRefundModal}>×</button>
            </div>
            <div className="modal-body">
              <iframe
                src={`/test-refund?data=${encodeURIComponent(JSON.stringify(refundData))}`}
                title="환불 처리"
                className="refund-iframe"
                onLoad={(e) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
