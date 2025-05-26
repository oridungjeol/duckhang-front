import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SearchResults from './searchResults';

const BoardSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [boardType, setBoardType] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    const params = new URLSearchParams({ keyword });
    if (boardType) params.append('boardType', boardType);

    try {
      const response = await fetch(`http://localhost/api/board/search?${params.toString()}`);
      const data = await response.json();
      setResults(data.content || []);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keyword.trim()) {
      handleSearch();
    }
  }, [boardType]);

  return (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <SearchBar
          keyword={keyword}
          setKeyword={setKeyword}
          boardType={boardType}
          setBoardType={setBoardType}
          onSearch={handleSearch}
        />
      </div>
      <SearchResults results={results} loading={loading} />
    </>
  );
};

export default BoardSearch;
