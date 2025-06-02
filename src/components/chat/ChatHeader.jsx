import React from 'react';

const ChatHeader = ({ data, isAuthor, isPaymentApprovedInChat, handleMap, handlePay, handleRefundRequest }) => {
  return (
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
            onClick={handleRefundRequest}
            className="pay-btn"
            disabled={!isPaymentApprovedInChat}
          >
            보증금 반환 요청
          </button>
        )}
      </span>
    </div>
  );
};

export default ChatHeader; 