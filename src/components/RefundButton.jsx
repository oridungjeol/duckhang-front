import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RefundButton({ orderId }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRefund = async () => {
    if (!orderId) {
      navigate("/refund-fail", { state: { message: "유효한 주문번호가 없습니다." } });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/payment/cancel/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
  

      if (!res.ok) throw new Error(data.error || "보증금 환불 실패");

      navigate("/refund-success", {
        state: {
          refundInfo: {
            orderId: data.orderId || orderId,
            cancelAmount: data.cancelAmount, // amount가 없으면 cancelAmount 사용
            refundedAt: data.refundedAt ?? data.canceledAt ?? new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      navigate("/refund-fail", { state: { message: error.message || "보증금 환불 실패" } });
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
