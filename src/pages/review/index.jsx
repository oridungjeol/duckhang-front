import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addReview } from "./hook";
import "./index.css";

export default function Review() {
  const location = useLocation();
  const navigate = useNavigate();
  const { author_uuid, orderId } = location.state || {};


  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReviewContent(event.target.value);
  };

  const handleSubmitReview = async () => {
    if (!author_uuid) {
      setError("리뷰를 작성할 사용자 정보가 없습니다.");
      return;
    }

    if (!orderId) {
      setError("주문 정보가 없습니다.");
      return;
    }

    if (!rating) {
      setError("별점을 선택해주세요.");
      return;
    }

    if (!reviewContent.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addReview(author_uuid, {
        orderId,
        rating,
        content: reviewContent.trim()
      });
      alert("리뷰가 성공적으로 작성되었습니다.");

      // 성공 알림 후 채팅방으로 이동
      if (location.state?.room_id) {
        navigate(`/chat/${location.state.room_id}`);
      } else {
        // room_id가 없을 경우 이전 페이지로 이동하거나 기본 채팅 목록 페이지로 이동
        navigate(-1); // 또는 navigate('/chat');
      }

    } catch (error) {
      console.error("리뷰 작성 실패:", error);
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'object' 
          ? error.response.data.message || '리뷰 작성 중 오류가 발생했습니다.'
          : error.response.data;
        setError(errorMessage);
      } else {
        setError("리뷰 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="detail-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className="home-btn" onClick={() => navigate("/board/deal")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
      </div>
      <div className="review-container">
        <div className="review-form">
          <div className="rating-section">
            <label htmlFor="rating">별점:</label>
            {/* Star rating input will go here */}
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="review-content-section">
            <label htmlFor="reviewContent">리뷰 내용:</label>
            <textarea
              id="reviewContent"
              value={reviewContent}
              onChange={handleReviewChange}
              placeholder="리뷰 내용을 작성해주세요"
              rows="6"
            />
          </div>
          <button className="submit-review-btn" onClick={handleSubmitReview}>
            리뷰 제출
          </button>
        </div>
      </div>
    </>
  );
}
