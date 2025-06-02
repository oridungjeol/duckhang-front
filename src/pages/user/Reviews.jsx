import './Reviews.css';

export default function reviews({ reviews }) {
  return (
    <div className="reviews">
      {reviews.map((review, idx) => (
        <div key={idx} className="reviews">
          <p>{review.content}</p>
          <span>⭐ {review.rating}</span>
        </div>
      ))}
    </div>
  );
}
