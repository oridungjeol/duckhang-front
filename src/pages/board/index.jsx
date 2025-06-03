import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Deal from "./post/deal";
import Person from "./post/person";
import "./index.css";
import BottomNav from "../../components/BottomNav";

export default function Board() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialFilter =
    searchParams.get("filter") || (type === "deal" ? "purchase" : "recruit");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchType, setSearchType] = useState(
    searchParams.get("fieldType") || "TITLE"
  );
  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.get("keyword") || ""
  );
  const [currentKeyword, setCurrentKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  useEffect(() => {
    if (type === "deal" && !searchParams.get("filter")) {
      navigate(`/board/deal?filter=purchase`, { replace: true });
    }
  }, [type, searchParams, navigate]);

  const handleWriteClick = () => {
    navigate(`/board/${type}/write`);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSearchKeyword("");
    setCurrentKeyword("");
    navigate(`/board/${type}?filter=${filter}`);
  };

  const handleSearchClick = () => {
    setCurrentKeyword(searchKeyword);
    navigate(
      `/board/${type}?filter=${activeFilter}&keyword=${searchKeyword}&fieldType=${searchType}`
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const renderFilterButtons = () => {
    if (type === "deal") {
      return (
        <>
          <button
            className={`filter-btn ${
              activeFilter === "purchase" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("purchase")}
          >
            구매
          </button>
          <button
            className={`filter-btn ${activeFilter === "sell" ? "active" : ""}`}
            onClick={() => handleFilterClick("sell")}
          >
            판매
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "rental" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("rental")}
          >
            대여
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "exchange" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("exchange")}
          >
            교환
          </button>
        </>
      );
    } else if (type === "person") {
      return (
        <>
          <button
            className={`filter-btn ${
              activeFilter === "recruit" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("recruit")}
          >
            구인
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "companion" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("companion")}
          >
            동행
          </button>
          <button
            className={`filter-btn ${
              activeFilter === "mercenary" ? "active" : ""
            }`}
            onClick={() => handleFilterClick("mercenary")}
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
            {type === "deal" ? "거래 게시판" : "인원 모집 게시판"}
          </span>
          <p className="board-description">
            {type === "deal"
              ? "팬심으로 연결되는 거래, 우리의 덕질은 계속된다"
              : "함께할 사람을 찾는 공간입니다. 다양한 활동에 참여해보세요."}
          </p>
        </div>
      </div>

      <div className="board-filter">
        <div className="filter-options">{renderFilterButtons()}
          <button className="write-btn" onClick={handleWriteClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19.0001 3.5L20.5001 5L19.0001 3.5ZM18.3541 4.146L19.8541 5.646L18.3541 4.146ZM11.0001 11.5L12.5001 13L11.0001 11.5ZM9.5001 13L11.0001 14.5L9.5001 13ZM3.0001 21H21.0001V19H3.0001V21ZM18.3541 4.146C18.5416 3.9585 18.7952 3.85352 19.0607 3.85352C19.3262 3.85352 19.5798 3.9585 19.7673 4.146L20.5001 5L19.0001 3.5L18.3541 4.146ZM8.5001 14L6.5001 12L16.3541 2.146L18.3541 4.146ZM8.5001 14L3.0001 19.5V19.5L8.5001 14ZM18.3541 4.146C18.5416 3.9585 18.7952 3.85352 19.0607 3.85352C19.3262 3.85352 19.5798 3.9585 19.7673 4.146L20.5001 5L19.0001 3.5L18.3541 4.146ZM8.5001 14L6.5001 12L8.5001 14ZM3.0001 19.5L8.5001 14L3.0001 19.5Z"></path>
            </svg>
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-btn" onClick={handleSearchClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M10 2a8 8 0 00-6.32 12.91l-3.44 3.45a1 1 0 001.41 1.41l3.45-3.44A8 8 0 1010 2zm0 14a6 6 0 116-6 6 6 0 01-6 6z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="board-content">
        {type === "deal" ? (
          <Deal
            keyword={currentKeyword}
            category={activeFilter}
            fieldType={searchType}
          />
        ) : (
          <Person
            keyword={currentKeyword}
            category={activeFilter}
            fieldType={searchType}
          />
        )}
      </div>
      <BottomNav />
    </div>
  );
}
