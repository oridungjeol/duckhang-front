import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function RefundSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const refundInfo = location.state?.refundInfo;
  console.log(refundInfo);

  if (!refundInfo) {
    // 환불 정보가 없으면 실패 페이지로 이동
    navigate("/refund-fail", { state: { message: "환불 정보가 없습니다." } });
    return null;
  }

  return (
    <div className="result wrapper" style={{ flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "40px",
          marginBottom: "32px",
        }}
      >
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#5580e6" />
          <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="box_section">
          <h2>환불이 완료되었습니다.</h2>
          <p>{`환불번호: ${refundInfo?.orderId}`}</p>
          <p>{`환불금액: ${Number(refundInfo?.cancelAmount).toLocaleString()}원`}</p>
          <p>{`환불일시: ${formatDate(refundInfo?.refundedAt)}`}</p>
        </div>
      </div>
    </div>
  );
} 