import React, { useState } from 'react';
import './index.css';

export default function Review() {
  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReviewContent(event.target.value);
  };

  const handleSubmitReview = () => {
    // TODO: Implement review submission logic
    console.log('Submitted Review:', { rating, reviewContent });
    alert('리뷰 제출 (기능 미구현)');
  };

  return (
    <div className="review-container">
      <div className="review-header">
        <h2>리뷰 작성</h2>
      </div>
      <div className="review-form">
        <div className="rating-section">
          <label htmlFor="rating">별점:</label>
          {/* Star rating input will go here */}
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'filled' : ''}`}
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
  );
} 