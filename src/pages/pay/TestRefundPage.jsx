import RefundButton from "../../components/RefundButton";

export default function TestRefundPage() {
  // 테스트용 orderId 직접 하드코딩 (실제 값으로 교체하세요)
  const testOrderId = "202505211105057112750";

  return (
    <div style={{ padding: "2rem" }}>
   
      <RefundButton orderId={testOrderId} />
    </div>
  );
}