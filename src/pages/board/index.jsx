import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Deal from './post/deal';
import Person from './post/person';
import './index.css';

export default function Board() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(type === 'deal' ? 'purchase' : 'recruit');

  const handleWriteClick = () => {
    navigate(`/board/${type}/write`);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const renderFilterButtons = () => {
    if (type === 'deal') {
      return (
        <>
          <button 
            className={`filter-btn ${activeFilter === 'purchase' ? 'active' : ''}`}
            onClick={() => handleFilterClick('purchase')}
          >
            구매
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'sell' ? 'active' : ''}`}
            onClick={() => handleFilterClick('sell')}
          >
            판매
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'rental' ? 'active' : ''}`}
            onClick={() => handleFilterClick('rental')}
          >
            대여
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'exchange' ? 'active' : ''}`}
            onClick={() => handleFilterClick('exchange')}
          >
            교환
          </button>
        </>
      );
    } else if (type === 'person') {
      return (
        <>
          <button 
            className={`filter-btn ${activeFilter === 'recruit' ? 'active' : ''}`}
            onClick={() => handleFilterClick('recruit')}
          >
            구인
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'companion' ? 'active' : ''}`}
            onClick={() => handleFilterClick('companion')}
          >
            동행
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'mercenary' ? 'active' : ''}`}
            onClick={() => handleFilterClick('mercenary')}
          >
            용병
          </button>
        </>
      );
    }
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <div className="board-title-section">
          <span className="board-title">
            {type === 'deal' ? '거래 게시판' : '인원 모집 게시판'}
          </span>
          <p className="board-description">
            {type === 'deal' 
              ? '안전한 거래를 위한 공간입니다. 다양한 물건을 거래해보세요.'
              : '함께할 사람을 찾는 공간입니다. 다양한 활동에 참여해보세요.'}
          </p>
        </div>
        <button className="write-btn" onClick={handleWriteClick}>
          글쓰기
        </button>
      </div>

      <div className="board-filter">
        <div className="filter-options">
          {renderFilterButtons()}
        </div>
        <div className="search-box">
          <input type="text" placeholder="검색어를 입력하세요" />
          <button className="search-btn">검색</button>
        </div>
      </div>

      <div className="board-content">
        {type === 'deal' ? <Deal /> : <Person />}
      </div>
    </div>
  );
}