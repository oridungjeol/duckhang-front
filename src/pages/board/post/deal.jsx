import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './deal.css';

// 시간 포맷팅 유틸리티 함수
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else {
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
};

// 가격 포맷팅 유틸리티 함수
const formatPrice = (price) => {
  if (!price) return '가격 미정';
  return `${Number(price).toLocaleString()}원`;
};

export default function Deal({ keyword = '', category }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 게시글 로드
  useEffect(() => {
    if (!category) return;

    setLoading(true);
    fetch(`/board/${category}`) // 예: /board/sell, /board/rental 등
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다');
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

  const handleItemClick = (post) => {
    navigate(`/board/deal/${post.id}`, { state: post });
  };

  const filteredPosts = posts.filter((post) => {
    const keywordLower = keyword.toLowerCase().trim();
    const matchesKeyword =
      keywordLower === '' ||
      (post.title?.toLowerCase().includes(keywordLower)) ||
      (post.content?.toLowerCase().includes(keywordLower)) ||
      (post.nickname?.toLowerCase().includes(keywordLower));

    return matchesKeyword;
  });

  if (loading) {
    return (
      <div className="deal-board">
        <div className="loading-container">
          <div className="duck-loading">
            <div className="duck-body"></div>
            <div className="duck-head"></div>
            <div className="duck-beak"></div>
            <div className="duck-leg left"></div>
            <div className="duck-leg right"></div>
          </div>
          <div className="loading-text">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="deal-board">
      {filteredPosts.length === 0 ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>검색 결과가 없습니다.</p>
      ) : (
        filteredPosts.map((post) => (
          <div
            key={post.id}
            className="deal-item"
            onClick={() => handleItemClick(post)}
            style={{ cursor: 'pointer' }}
          >
            <div className="deal-item-image">
              <img src={post.imageUrl || 'https://via.placeholder.com/120'} alt={post.title} />
            </div>
            <div className="deal-item-content">
              <div className="deal-item-header">
                <span className="deal-type">{category}</span>
                <h3 className="deal-item-title">{post.title}</h3>
              </div>
              {category !== 'exchange' && (
                <p className="deal-item-price">{formatPrice(post.price)}</p>
              )}
              <div className="deal-item-info">
                <span className="deal-nickname">{post.nickname}</span>
                <span className="deal-time">{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
