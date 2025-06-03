import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../../recoil/user";
import Payment from "./Payment";
import "./PaymentModal.css";

const PaymentModal = ({ isOpen, onClose, boardData, type, onPaymentComplete }) => {
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <div className="payment-modal-header">
          <h2>결제하기</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="payment-modal-body">
          <Payment
            boardData={boardData}
            type={type}
            onPaymentComplete={onPaymentComplete}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 