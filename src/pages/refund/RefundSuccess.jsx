import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

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

export default function RefundSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const refundInfo = location.state?.refundInfo;
  console.log(refundInfo);

  if (!refundInfo) {
    // 환불 정보가 없으면 실패 페이지로 이동
    navigate("/refund-fail", { state: { message: "환불 정보가 없습니다." } });
    return null;
  }

  const handleReturnToChat = async () => {
    try {
      // WebSocket 연결 및 메시지 전송
      const socket = new SockJS("http://localhost:8080/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          const now = new Date();
          const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
          const kstDate = new Date(kstOffset);
          const created_at = kstDate.toISOString().slice(0, 19);

          const messageContent = {
            message: "환불이 완료되었습니다.",
            orderId: refundInfo.orderId,
            totalAmount: refundInfo.cancelAmount,
            method: refundInfo.method || '카드',
            approvedAt: refundInfo.refundedAt || now.toISOString()
          };

          console.log('Sending refund message:', messageContent);

          client.publish({
            destination: `/app/chat/${refundInfo.room_id}`,
            body: JSON.stringify({
              type: "COMPLETE_REFUND",
              author_uuid: localStorage.getItem("uuid"),
              content: JSON.stringify(messageContent),
              created_at: created_at,
              room_id: refundInfo.room_id,
            })
          });

          // 메시지 전송 후 채팅방으로 이동
          navigate(`/chat/${refundInfo.room_id}`, {
            state: {
              room_id: refundInfo.room_id,
              name: refundInfo.room_name,
              board_id: refundInfo.board_id,
              type: refundInfo.type,
              orderId: refundInfo.orderId
            }
          });

          // 연결 종료
          client.deactivate();
        }
      });

      client.activate();
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      // 에러가 발생해도 채팅방으로 이동
      navigate(`/chat/${refundInfo.room_id}`, {
        state: {
          room_id: refundInfo.room_id,
          name: refundInfo.room_name,
          board_id: refundInfo.board_id,
          type: refundInfo.type,
          orderId: refundInfo.orderId
        }
      });
    }
  };

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
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#5580e6" />
          <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="box_section">
          <h2>환불이 완료되었습니다.</h2>
          <p>{`환불번호: ${refundInfo?.orderId}`}</p>
          <p>{`환불금액: ${Number(refundInfo?.cancelAmount).toLocaleString()}원`}</p>
          <p>{`환불일시: ${formatDate(refundInfo?.refundedAt)}`}</p>
        </div>
      </div>
      <button
        onClick={handleReturnToChat}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#ffca1a",
          color: "#4a4a3c",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        }}
      >
        채팅방으로 돌아가기
      </button>
    </div>
  );
} 