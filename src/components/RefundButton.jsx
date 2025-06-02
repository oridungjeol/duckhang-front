import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RefundButton({ orderId, room_id, room_name, board_id, type }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRefund = async () => {
    if (!orderId) {
      navigate("/refund-fail", { state: { message: "유효한 주문번호가 없습니다." } });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost/api/payment/cancel/${orderId}`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "보증금 환불 실패";
        throw new Error(errorMessage);
      }

      navigate("/refund-success", {
        state: {
          room_id,
          room_name,
          board_id,
          type,
          refundInfo: {
            orderId: data.orderId || orderId,
            cancelAmount: data.cancelAmount,
            refundedAt: data.refundedAt ?? data.canceledAt ?? new Date().toISOString()
          }
        }
      });
    } catch (error) {
      const errorMessage = error.message || "보증금 환불 실패";
      navigate("/refund-fail", { 
        state: { 
          message: errorMessage 
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="result wrapper">
        <div className="box_section loading-container">
          <div className="loading-spinner"></div>
          <h2>환불 요청 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <button className="button" onClick={handleRefund} disabled={loading}>
      구매확정
    </button>
  );
}
