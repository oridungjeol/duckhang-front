import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    console.log(requestData)

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
          // 결제 실패 처리
          setError(json.message || "결제 확인 실패");
          navigate(`/fail?message=${json.message}&code=${json.code}`);
          return;
        }

        // 결제 성공 처리
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
        <a href={paymentInfo.receipt?.url} target="_blank" rel="noopener noreferrer">
          영수증 보기
        </a>
      </div>
    </div>
  );
}

export default Success;
