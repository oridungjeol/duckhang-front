import React from 'react';

const RefundMessage = ({ msg, isMine, data, onRefund }) => {
  let refundData;
  try {
    refundData = msg.content ? JSON.parse(msg.content) : null;
  } catch (error) {
    refundData = null;
  }

  return (
    <div className={`message-wrapper ${isMine ? "me" : "other"}`}> 
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
                  onClick={() => onRefund(msg)}
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
};

export default RefundMessage; 