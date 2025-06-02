import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RefundButton.css';

const RefundButton = ({ orderId, room_id, room_name, board_id, type, refundInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRefund = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost/api/payment/cancel/${orderId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id,
          room_name,
          board_id,
          type,
          amount: refundInfo?.deposit || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '환불 처리 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      alert('환불이 성공적으로 처리되었습니다.');
      
      // 부모 창에 환불 완료 메시지 전송
      if (window.parent) {
        const now = new Date();
        const kstOffset = now.getTime() + 9 * 60 * 60 * 1000;
        const kstDate = new Date(kstOffset);
        const created_at = kstDate.toISOString().slice(0, 19);

        const refundMessage = {
          message: "보증금 반환이 완료되었습니다.",
          orderId: orderId,
          totalAmount: refundInfo?.deposit || 0,
          method: "간편결제",
          approvedAt: created_at
        };

        console.log("Refund Message being sent:", refundMessage);

        window.parent.postMessage({
          type: 'closeRefundModal',
          refundInfo: refundMessage
        }, window.location.origin);

        // 채팅방으로 이동
        navigate(`/chat/${room_id}`, {
          state: {
            room_id,
            name: room_name,
            board_id,
            type,
            isBuyer: true,
            refundMessage: refundMessage
          }
        });
      }
    } catch (err) {
      setError(err.message);
      alert('환불 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>처리 중...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="refund-button-container">
      <div className="refund-info">
        <div className="info-section">
          <h3 className="section-title">환불 정보</h3>
          <div className="info-item">
            <span className="label">주문번호</span>
            <span className="value">{orderId}</span>
          </div>
          <div className="info-item">
            <span className="label">상품명</span>
            <span className="value">{room_name}</span>
          </div>
          <div className="info-item">
            <span className="label">환불 금액</span>
            <span className="value" style={{ fontWeight: 'bold', color: '#ff4d4d' }}>
              {refundInfo?.deposit ? `${Number(refundInfo.deposit).toLocaleString()}원` : '0원'}
            </span>
          </div>
        </div>
      </div>
      <button 
        className="refund-button" 
        onClick={handleRefund}
        disabled={isLoading}
      >
        구매확정
      </button>
    </div>
  );
};

export default RefundButton;
