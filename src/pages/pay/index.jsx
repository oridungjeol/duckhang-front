import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import "./index.css";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "4rOfQsR548H62ySKBLWo5";

export function Checkout() {
  // 하드코딩된 테스트용 값
  const boardId = 5;
  const type = "rental";

  const [amount, setAmount] = useState({ currency: "KRW", value: 0 });
  const [price, setPrice] = useState(0);
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(`http://localhost:8080/api/price/${type}/${boardId}`);
        if (!res.ok) throw new Error("가격 조회 실패");
        const data = await res.json();
        setPrice(data.price);
        setAmount({ currency: "KRW", value: data.price });
      } catch (err) {
        console.error(err);
      }
    }
    fetchPrice();
  }, [boardId, type]);

  useEffect(() => {
    async function loadWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      setWidgets(tossPayments.widgets({ customerKey }));
    }
    loadWidgets();
  }, []);

  useEffect(() => {
    async function renderWidgets() {
      if (!widgets || amount.value === 0) return;
      await widgets.setAmount(amount);
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      setReady(true);
    }
    renderWidgets();
  }, [widgets, amount]);

  return (
    <div className="wrapper">
      <div className="box_section">
        <div id="payment-method" />
        <div id="agreement" />

        <button
          className="button"
          disabled={!ready}
          onClick={async () => {
            if (!widgets) return;
            try {
              const res = await fetch("http://localhost:8080/api/payment/create-order-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ boardId, type }),
              });
              if (!res.ok) throw new Error("주문 생성 실패");
              const { orderId } = await res.json();

              await widgets.requestPayment({
                orderId,
                orderName: `${type.toUpperCase()} 게시글 결제`,
                successUrl: `${window.location.origin}/success?orderId=${orderId}&amount=${price}&type=${type}`,
                failUrl: `${window.location.origin}/fail`,
                customerEmail: "customer123@gmail.com",
                customerName: "김토스",
                customerMobilePhone: "01012341234",
              });
            } catch (error) {
              console.error("결제 실패:", error);
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
