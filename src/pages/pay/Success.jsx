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
        <div className="box_section">
          <h2>결제 확인 중...</h2>
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
    <div className="result wrapper">
      <div className="box_section">
        <h2>결제 성공</h2>
        <p>{`주문번호: ${paymentInfo.orderId}`}</p>
        <p>{`결제 금액: ${Number(paymentInfo.totalAmount).toLocaleString()}원`}</p>
        <p>{`결제 수단: ${paymentInfo.method}`}</p>
        <p>{`승인 일시: ${paymentInfo.approvedAt}`}</p>
        <a
          href={paymentInfo.receipt?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          영수증 보기
        </a>
      </div>
    </div>
  );
}

export default Success;
