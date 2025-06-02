import './Posts.css';

export default function posts({ posts }) {
  return (
    <div className="posts">
      {posts.map((url, idx) => (
        <img key={idx} src={url} alt={`post-${idx}`} />
      ))}
    </div>
  );
}
