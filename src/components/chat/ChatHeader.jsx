import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ data, isAuthor, isPaymentApprovedInChat, handleMap, handlePay, handleRefundRequest, onSearchClick }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <span className="chat-title" onClick={() => navigate(-1)}>
        {data.name}
      </span>
      <span className="header-buttons">
        <button className="search-icon-btn" onClick={onSearchClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
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