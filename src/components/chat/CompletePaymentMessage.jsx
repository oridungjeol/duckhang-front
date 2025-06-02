import React from 'react';

const CompletePaymentMessage = ({ msg, isMine, openPaymentDetail, togglePaymentDetail }) => {
  let completePaymentData;
  try {
    completePaymentData = msg.content ? JSON.parse(msg.content) : null;
  } catch (error) {
    completePaymentData = null;
  }

  const displayOnRight = !isMine;

  return (
    <div className={`message-wrapper ${displayOnRight ? "me" : "other"}`}> 
      <div className={`payment-complete-card ${displayOnRight ? "me" : "other"}`} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
        marginBottom: "20px",
        backgroundColor: "#ffffff",
        padding: "16px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: '60%',
        width: 'auto',
        margin: "20px auto",
        border: "1px solid #e0e0e0"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          backgroundColor: "#e3f2fd",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px"
        }}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none"> 
            <circle cx="50" cy="50" r="45" fill="#1e88e5" />
            <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ 
          marginTop: "8px", 
          color: "#1565c0", 
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px"
        }}>결제가 완료되었습니다</h3> 
        {completePaymentData && (
          <div className="payment-complete-content" style={{ 
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
            width: "100%",
          }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                padding: "12px 16px",
                background: openPaymentDetail ? "#e3f2fd" : "#fff",
                borderRadius: "10px",
                marginBottom: "10px",
                border: "2px solid #90caf9",
                boxShadow: openPaymentDetail ? "0 2px 8px rgba(30,136,229,0.08)" : "none",
                transition: "all 0.3s"
              }}
              onClick={togglePaymentDetail}
            >
              <span style={{
                fontWeight: "700",
                color: "#1976d2",
                fontSize: "15px"
              }}>결제 상세 정보</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                style={{
                  transform: openPaymentDetail ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s"
                }}
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div
              style={{
                maxHeight: openPaymentDetail ? 500 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                background: "#f5faff",
                borderRadius: "10px",
                border: openPaymentDetail ? "1.5px solid #90caf9" : "none",
                boxShadow: openPaymentDetail ? "0 2px 8px rgba(30,136,229,0.08)" : "none",
                marginBottom: openPaymentDetail ? "10px" : "0"
              }}
            >
              <div style={{ padding: openPaymentDetail ? "14px" : "0 14px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #e3f2fd"
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#1976d2',
                    fontSize: "14px"
                  }}>주문번호</span>
                  <span style={{
                    color: '#333',
                    fontSize: "14px"
                  }}>{completePaymentData.orderId}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #e3f2fd"
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#1976d2',
                    fontSize: "14px"
                  }}>결제금액</span>
                  <span style={{
                    color: '#333',
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>{Number(completePaymentData.totalAmount).toLocaleString()}원</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #e3f2fd"
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#1976d2',
                    fontSize: "14px"
                  }}>결제수단</span>
                  <span style={{
                    color: '#333',
                    fontSize: "14px"
                  }}>{completePaymentData.method || '카드'}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0"
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: '#1976d2',
                    fontSize: "14px"
                  }}>승인일시</span>
                  <span style={{
                    color: '#333',
                    fontSize: "14px"
                  }}>{completePaymentData.approvedAt ? new Date(completePaymentData.approvedAt).toLocaleString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletePaymentMessage; 