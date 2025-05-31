import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function Success() {
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleReturnToChat = async () => {
    try {
      // URL 파라미터 확인
      const room_id = searchParams.get("room_id");
      const room_name = searchParams.get("room_name");
      const board_id = searchParams.get("board_id");
      const type = searchParams.get("type");

      console.log("URL 파라미터:", { room_id, room_name, board_id, type });

      // 필수 데이터 확인
      if (!room_id || !room_name || !board_id || !type) {
        console.error("필수 데이터가 누락되었습니다:", { room_id, room_name, board_id, type });
        return;
      }

      const socket = new SockJS("http://localhost:8080/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          const now = new Date();
          const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
          const kstDate = new Date(kstOffset);
          const created_at = kstDate.toISOString().slice(0, 19);

          const messageContent = {
            message: "결제가 완료되었습니다.",
            orderId: paymentInfo.orderId,
            totalAmount: paymentInfo.totalAmount,
            method: paymentInfo.method,
            approvedAt: paymentInfo.approvedAt
          };

          console.log('Sending payment message:', messageContent);

          client.publish({
            destination: `/app/chat/${room_id}`,
            body: JSON.stringify({
              type: "COMPLETE_PAYMENT",
              author_uuid: "SYSTEM",
              content: JSON.stringify(messageContent),
              created_at: created_at,
              room_id: room_id,
            })
          });

          // 메시지 전송 후 채팅방으로 이동
          const chatState = {
            room_id,
            name: room_name,
            board_id,
            type,
            orderId: paymentInfo.orderId,
            fromPayment: true,
            paymentCompleted: true,
            isBuyer: true
          };

          console.log("채팅방으로 이동:", chatState);
          navigate(`/chat/${room_id}`, { state: chatState });

          // 연결 종료
          client.deactivate();
        }
      });

      client.activate();
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      // 에러가 발생해도 채팅방으로 이동
      const room_id = searchParams.get("room_id");
      const room_name = searchParams.get("room_name");
      const board_id = searchParams.get("board_id");
      const type = searchParams.get("type");

      // 필수 데이터 확인
      if (!room_id || !room_name || !board_id || !type) {
        console.error("필수 데이터가 누락되었습니다:", { room_id, room_name, board_id, type });
        return;
      }

      const chatState = {
        room_id,
        name: room_name,
        board_id,
        type,
        orderId: paymentInfo.orderId,
        fromPayment: true,
        isBuyer: true
      };

      console.log("에러 발생 후 채팅방으로 이동:", chatState);
      navigate(`/chat/${room_id}`, { state: chatState });
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    async function confirm() {
      try {
        const response = await fetch("http://localhost/api/payment/confirm", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          const errorMessage = json.message || "결제 확인 실패";
          setError(errorMessage);
          navigate(`/fail?message=${encodeURIComponent(errorMessage)}&code=${json.code || 'UNKNOWN'}`);
          return;
        }

        setPaymentInfo(json);
      } catch (err) {
        const errorMessage = "네트워크 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("결제 확인 중 오류 발생:", err);
        navigate(`/fail?message=${encodeURIComponent(errorMessage)}&code=NETWORK_ERROR`);
      } finally {
        setIsLoading(false);
      }
    }

    confirm();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="result wrapper">
        <div className="box_section loading-container">
          <div className="loading-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <h2>결제 확인 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2>결제 실패</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result wrapper" style={{ flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "40px",
          marginBottom: "32px",
        }}
      >
        
        <svg width="85" height="85" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#5580e6" />
          <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        

        <div className="box_section">
          <h1>결제를 완료했어요</h1>
        </div>
        
        <button
        onClick={handleReturnToChat}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "#5580e6",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "buttonSlideUp 0.5s ease-out",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
          e.target.style.backgroundColor = "#6b8fe6";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          e.target.style.backgroundColor = "#5580e6";
        }}
      >
        채팅방으로 가기
      </button>
      </div>
      
      <style>
        {`
          @keyframes buttonSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default Success;