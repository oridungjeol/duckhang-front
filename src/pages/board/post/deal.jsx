import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      size: pageSize.toString()
    });

    // 검색어가 있는 경우 검색 API 사용
    if (keyword) {
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
  }, [category, currentPage, pageSize, keyword]);

  useEffect(() => {
    // 카테고리가 변경될 때 페이지를 0으로 초기화
    setCurrentPage(0);
  }, [category]);

  // 페이지 변경 시 스크롤 처리
  useEffect(() => {
    if (!loading && dealItemsRef.current) {
      dealItemsRef.current.scrollTop = 0;
    }
  }, [currentPage, loading]);

  const handleItemClick = (post) => {
    // boardType을 state로 전달 (category를 대문자로 변환)
    navigate(`/board/deal/${post.id}`, { 
      state: { 
        boardType: category.toUpperCase(),
        board: post 
      } 
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 페이지 변경 시 즉시 스크롤 처리
    if (dealItemsRef.current) {
      dealItemsRef.current.scrollTop = 0;
    }
  };

  // 클라이언트 사이드 필터링 제거
  const filteredPosts = posts;

  // 페이지네이션 버튼 생성
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        이전
      </button>
    );

    // 페이지 번호 버튼들
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

    // 다음 페이지 버튼
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        다음
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination">
          {pages}
        </div>
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
                    <span className="deal-nickname">{post.nickname}</span>
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