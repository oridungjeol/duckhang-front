import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentMessage = ({ msg, isMine, data, onPay }) => {
  const navigate = useNavigate();
  let paymentData;
  try {
    paymentData = msg.content ? JSON.parse(msg.content) : null;
  } catch (error) {
    paymentData = null;
  }

  return (
    <div className={`message-wrapper ${isMine ? "me" : "other"}`}>
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
            <div className="payment-info-item">
              <span className="label">결제 금액</span>
              <span className="value">{paymentData.actualPrice ? paymentData.actualPrice.toLocaleString() : (paymentData.price || 0).toLocaleString()}원</span>
            </div>
            {data.type === 'RENTAL' && (
              <>
                
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
};

export default PaymentMessage; 