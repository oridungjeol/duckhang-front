import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import "./index.css";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "4rOfQsR548H62ySKBLWo5";

export function Checkout() {
  // 테스트용 하드코딩 boardId
  const boardId = 5;

  const [amount, setAmount] = useState({ currency: "KRW", value: 0 });
  const [rentalPrice, setRentalPrice] = useState(0);
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchRentalPrice() {
      try {
        const res = await fetch(`http://localhost:8080/api/rental/${boardId}`);
        if (!res.ok) throw new Error("렌탈 가격을 불러올 수 없습니다.");
        const rental = await res.json();
        setRentalPrice(rental.price);
        setAmount({ currency: "KRW", value: rental.price });
      } catch (err) {
        console.error(err);
      }
    }
    fetchRentalPrice();
  }, [boardId]);

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
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
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
              const res = await fetch("http://localhost:8080/api/order/create-order-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ boardId }),
              });
              if (!res.ok) throw new Error("주문 생성 실패");
              const data = await res.json();
              const orderId = data.orderId;

              await widgets.requestPayment({
                orderId,
                orderName: "렌탈 결제 테스트",
                successUrl: `${window.location.origin}/success?orderId=${orderId}&amount=${rentalPrice}`,
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
