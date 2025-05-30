import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import "./index.css";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "4rOfQsR548H62ySKBLWo5";

export function Checkout() {
  const { state } = useLocation();
  const [payData, setPayData] = useState(null);

  const [amount, setAmount] = useState({ currency: "KRW", value: 0 });
  const [price, setPrice] = useState(0);
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state) {
      setPayData(state);
      console.log(state);
    }
  }, [state]);
  console.log("state", state);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          `http://localhost/api/payment/price/${payData.type}/${payData.board_id}`,
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (res.status === 401) {
          throw new Error("로그인이 필요합니다.");
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "가격 조회 실패");
        }

        const data = await res.json();
        setPrice(data.price);
        setAmount({ currency: "KRW", value: data.price });
        setError(null);
      } catch (err) {
        console.error("가격 조회 중 오류 발생:", err);
        setError(err.message);
      }
    }
    console.log("payData", payData);

    if (payData?.board_id && payData?.type) {
      fetchPrice();
    }
  }, [payData]);


  useEffect(() => {
    async function loadWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        setWidgets(tossPayments.widgets({ customerKey }));
      } catch (err) {
        console.error("Toss Payments 로딩 실패:", err);
        setError("결제 위젯 로딩에 실패했습니다.");
      }
    }

    loadWidgets();
  }, []);

  useEffect(() => {
    async function renderWidgets() {
      if (!widgets || amount.value === 0) return;
      try {
        await widgets.setAmount(amount);
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        setReady(true);
        setError(null);
      } catch (err) {
        console.error("위젯 렌더링 실패:", err);
        setError("결제 위젯 렌더링에 실패했습니다.");
      }
    }

    renderWidgets();
  }, [widgets, amount]);

  return (
    <div className="wrapper">
      <div className="box_section">
        {error && <p className="error">{error}</p>}

        <div id="payment-method" />
        <div id="agreement" />

        <button
          className="button"
          disabled={!ready}
          onClick={async () => {
            if (!widgets) return;
            try {
              const res = await fetch("http://localhost/api/payment/create-order-id", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  boardId: payData.board_id,
                  type: payData.type,
                  price: price,
                }),
              });

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "주문 생성 실패");
              }

              const { orderId } = await res.json();

              await widgets.requestPayment({
                orderId,
                orderName: `${payData.type.toUpperCase()} 게시글 결제`,
                successUrl: `${window.location.origin}/success?orderId=${orderId}&amount=${price}&type=${payData.type}`,
                failUrl: `${window.location.origin}/fail`,
                customerEmail: "customer123@gmail.com",
                customerName: "김토스",
                customerMobilePhone: "01012341234",
              });
            } catch (error) {
              console.error("결제 실패:", error);
              setError("결제 처리 중 오류가 발생했습니다.");
              console.log(error);
            }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Checkout;
