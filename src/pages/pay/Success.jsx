import { useEffect, useState, useRef } from "react"; // ✅ useRef는 react에서 가져오기
import { useNavigate, useSearchParams } from "react-router-dom";

export function Success() {
  const hasFetched = useRef(false); // ✅ 중복 호출 방지용 ref
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasFetched.current) return; // ✅ 이미 요청했다면 실행하지 않음
    hasFetched.current = true; // ✅ 처음 호출 시 true로 설정하여 이후 막기

    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    console.log("💬 요청 데이터:", requestData);

    async function confirm() {
      try {
        const response = await fetch("http://localhost:8080/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          setError(json.message || "결제 확인 실패");
          navigate(`/fail?message=${json.message}&code=${json.code}`);
          return;
        }

        setPaymentInfo(json);
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    confirm();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="result wrapper">
        <div className="box_section loading-container">
          <div className="loading-spinner"></div>
          <h2>결제 확인 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2>결제 실패</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result wrapper" style={{ flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', marginBottom: '32px' }}>
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#3282f6" />
          <path d="M30 52L45 67L70 42" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="box_section">
        <h2>결제가 완료되었습니다.</h2>
        <p>{`주문번호: ${paymentInfo.orderId}`}</p>
        <p>{`결제금액: ${Number(paymentInfo.totalAmount).toLocaleString()}원`}</p>
        <p>{`결제수단: ${paymentInfo.method}`}</p>
        <p>{`결제일시: ${formatDate(paymentInfo.approvedAt)}`}</p>
       
      </div>
      <button
          className="button">확인</button>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default Success;
