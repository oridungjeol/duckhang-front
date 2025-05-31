import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add any necessary cleanup or side effects here
  }, [navigate]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-details">
        <p>주문번호: {orderId}</p>
        <p>결제금액: {Number(amount).toLocaleString()}원</p>
        <p>결제수단: {method || '카드'}</p>
        <p>승인일시: {new Date(approvedAt).toLocaleString()}</p>
      </div>
      <button
        onClick={() => navigate(`/chat/${room_id}`, {
          state: {
            room_id: room_id,
            name: room_name,
            board_id: board_id,
            type: type,
            orderId: orderId
          }
        })}
        className="payment-success-close"
        style={{
          animation: 'buttonSlideUp 0.5s ease-out',
          transition: 'all 0.3s ease'
        }}
      >
        채팅방으로 돌아가기
      </button>
    </div>
  );
};

export default SuccessPage; 