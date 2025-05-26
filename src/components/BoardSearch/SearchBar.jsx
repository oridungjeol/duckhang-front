import React from 'react';

const SearchBar = ({ keyword, setKeyword, boardType, setBoardType, onSearch }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="flex-1 border rounded-md p-2"
        />
        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          검색
        </button>
      </div>

      <div className="flex gap-2">
        {['전체', '판매', '구매'].map((label, index) => {
          const type = index === 0 ? null : label === '판매' ? 'SELL' : 'PURCHASE';
          const isSelected = boardType === type;

          return (
            <button
              key={label}
              onClick={() => setBoardType(type)}
              className={`px-3 py-1 rounded ${isSelected ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
