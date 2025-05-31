import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const { room_id, room_name, board_id, type, refundInfo } = location.state || {};

  console.log("RefundSuccess state:", location.state);

  const handleReturnToChat = () => {
    if (!room_id || !room_name || !board_id || !type) {
      console.error("Missing required data:", { room_id, room_name, board_id, type });
      return;
    }

    navigate(`/chat/${room_id}`, {
      state: {
        room_id,
        name: room_name,
        board_id,
        type,
        isBuyer: true
      }
    });
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      backgroundColor: "#f9f8f7"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%"
      }}>
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" style={{ marginBottom: "1rem" }}>
          <circle cx="50" cy="50" r="45" fill="#5580e6" />
          <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 style={{ color: "#5580e6", marginBottom: "1rem" }}>환불이 완료되었습니다</h2>
        {refundInfo && (
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <span style={{ fontWeight: "bold" }}>환불번호:</span> {refundInfo.orderId}
            </p>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <span style={{ fontWeight: "bold" }}>환불금액:</span> {Number(refundInfo.cancelAmount).toLocaleString()}원
            </p>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <span style={{ fontWeight: "bold" }}>환불일시:</span> {formatDate(refundInfo.refundedAt)}
            </p>
          </div>
        )}
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          환불이 성공적으로 처리되었습니다.<br />
          채팅방으로 돌아가시겠습니까?
        </p>
        <button
          onClick={handleReturnToChat}
          style={{
            backgroundColor: "#5580e6",
            color: "white",
            border: "none",
            padding: "0.8rem 2rem",
            borderRadius: "25px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            width: "100%"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#4a6fc9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#5580e6"}
        >
          채팅방으로 돌아가기
        </button>
      </div>
    </div>
  );
} 