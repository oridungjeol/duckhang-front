import React from 'react';

const CompleteRefundMessage = ({ msg, openRefundDetail, toggleRefundDetail }) => {
  let completeRefundData;
  try {
    completeRefundData = JSON.parse(msg.content);
    
    // content가 한 번 더 JSON으로 감싸져 있으면 파싱
    if (completeRefundData && typeof completeRefundData.content === 'string') {
      completeRefundData = JSON.parse(completeRefundData.content);
    }
    
    // 혹시라도 orderId/totalAmount가 없으면 msg에서 fallback
    if (!completeRefundData.orderId && msg.orderId) {
      completeRefundData.orderId = msg.orderId;
    }
    if (!completeRefundData.totalAmount && msg.totalAmount) {
      completeRefundData.totalAmount = msg.totalAmount;
    }
  } catch (error) {
    console.error("Error parsing refund data:", error);
    completeRefundData = null;
  }

  return (
    <div className="message-wrapper me"> 
      <div style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
        marginBottom: "20px",
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: '70%',
        width: 'auto',
        margin: "20px auto",
        border: "1px solid #e0e0e0"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          backgroundColor: "#e8f5e9",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px"
        }}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none"> 
            <circle cx="50" cy="50" r="45" fill="#4caf50" /> 
            <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ 
          marginTop: "8px", 
          color: "#388e3c", 
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px"
        }}>{completeRefundData?.message || "보증금 반환 완료"}</h3> 
        <div style={{ 
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "8px",
          boxShadow: "0 2px 8px rgba(76,175,80,0.04)", 
          width: "100%",
        }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              padding: "14px 20px",
              background: openRefundDetail ? "#e8f5e9" : "#fff",
              borderRadius: "10px",
              marginBottom: "12px",
              border: "2px solid #81c784",
              boxShadow: openRefundDetail ? "0 2px 8px rgba(76,175,80,0.08)" : "none",
              transition: "all 0.3s"
            }}
            onClick={toggleRefundDetail}
          >
            <span style={{
              fontWeight: "700",
              color: "#2e7d32",
              fontSize: "16px"
            }}>환불 상세 정보</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{
                transform: openRefundDetail ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s"
              }}
              fill="none"
              stroke="#2e7d32"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div
            style={{
              maxHeight: openRefundDetail ? 500 : 0,
              overflow: "hidden",
              transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
              background: "#f8f9fa",
              borderRadius: "10px",
              border: openRefundDetail ? "1.5px solid #81c784" : "none",
              boxShadow: openRefundDetail ? "0 2px 8px rgba(76,175,80,0.08)" : "none",
              marginBottom: openRefundDetail ? "10px" : "0"
            }}
          >
            <div style={{ padding: openRefundDetail ? "18px" : "0 18px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #e9ecef"
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#2e7d32',
                  fontSize: "15px"
                }}>주문번호</span>
                <span style={{
                  color: '#333',
                  fontSize: "15px"
                }}>{completeRefundData?.orderId || '-'}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #e9ecef"
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#2e7d32',
                  fontSize: "15px"
                }}>보증금</span>
                <span style={{
                  color: '#333',
                  fontSize: "15px",
                  fontWeight: "600"
                }}>{completeRefundData?.totalAmount ? Number(completeRefundData.totalAmount).toLocaleString() : '-'}원</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #e9ecef"
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#2e7d32',
                  fontSize: "15px"
                }}>환불수단</span>
                <span style={{
                  color: '#333',
                  fontSize: "15px"
                }}>{completeRefundData?.method || '간편결제'}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0"
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#2e7d32',
                  fontSize: "15px"
                }}>환불일시</span>
                <span style={{
                  color: '#333',
                  fontSize: "15px"
                }}>{completeRefundData?.approvedAt ? new Date(completeRefundData.approvedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteRefundMessage; 