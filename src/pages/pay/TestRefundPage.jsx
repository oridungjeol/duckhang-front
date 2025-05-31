import { useLocation } from "react-router-dom";
import RefundButton from "../../components/RefundButton";

export default function TestRefundPage() {
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div style={{ padding: "2rem" }}>
      {orderId ? (
        <RefundButton orderId={orderId} />
      ) : (
        <div>주문 정보를 찾을 수 없습니다.</div>
      )}
    </div>
  );
}