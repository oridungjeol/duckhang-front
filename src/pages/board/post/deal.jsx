import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './deal.css';

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 7) return `${diffInDays}일 전`;

  const year = postDate.getFullYear();
  const month = String(postDate.getMonth() + 1).padStart(2, '0');
  const day = String(postDate.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const formatPrice = (price) => {
  if (!price) return '가격 미정';
  return `${Number(price).toLocaleString()}원`;
};

export default function Deal({ keyword = '', category }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const dealItemsRef = useRef(null);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      size: pageSize.toString(),
    });

    let url = '';

    if (keyword) {
      // 제목 검색만 고정 (searchFieldType=TITLE)
      params.append('keyword', keyword);
      params.append('boardType', category.toUpperCase());
      params.append('searchFieldType', 'CONTENT');

      axios.get(`http://localhost/api/board/search?${params}`)
        .then((response) => {
          const data = response.data;
          setPosts(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        })
        .catch((err) => {
          console.error(err);
          setPosts([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      axios.get(`http://localhost/api/board/${category.toUpperCase()}?${params}`)
        .then((response) => {
          const data = response.data;
          setPosts(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        })
        .catch((err) => {
          console.error(err);
          setPosts([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다');
        return res.json();
      })
      .then((data) => {
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      })
      .catch((err) => {
        console.error(err);
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, currentPage, pageSize, keyword]);

  useEffect(() => {
    setCurrentPage(0);
  }, [category]);

  useEffect(() => {
    if (!loading && dealItemsRef.current) {
      dealItemsRef.current.scrollTop = 0;
    }
  }, [currentPage, loading]);

  const handleItemClick = (post) => {
    navigate(`/board/deal/${post.id}`, {
      state: {
        boardType: category.toUpperCase(),
        board: post,
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (dealItemsRef.current) {
      dealItemsRef.current.scrollTop = 0;
    }
  };

  const filteredPosts = posts;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
        이전
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i + 1}
        </button>
      );
    }

    pages.push(
      <button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
        다음
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination">{pages}</div>
        <div className="pagination-info">
          총 {totalElements}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
        </div>
      </div>
    );
  };

  return (
    <div className="deal-board">
      {loading ? (
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
      ) : filteredPosts.length === 0 ? (
        <div className="no-result-container">
          <div className="no-result-duck">
            <div className="duck-body"></div>
            <div className="duck-head"></div>
            <div className="duck-beak"></div>
            <div className="duck-leg left"></div>
            <div className="duck-leg right"></div>
          </div>
          <div className="no-result-text">검색 결과가 없습니다.</div>
        </div>
      ) : (
        <>
          <div className="deal-items" ref={dealItemsRef}>
            {filteredPosts.map((post) => (
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
                    <span className="deal-time">{formatRelativeTime(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
