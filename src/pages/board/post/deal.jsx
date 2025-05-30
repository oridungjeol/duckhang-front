import { useNavigate } from 'react-router-dom';
import './deal.css';

export default function Deal({ keyword = '', category }) {
  const navigate = useNavigate();

  const posts = [
    {
      id: 7,
      title: '아이폰 13 Pro Max 판매합니다',
      price: '1,200,000원',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '전유영',
      author_uuid: '1795857b-9daf-44fb-8035-efdc423ba31e',
      createdAt: '2024-03-15',
      type: 'rental',
      content: '아이폰 13 팔아요 싱싱한 아이폰 1개에 120만원~'
    },
    {
      id: 2,
      title: '맥북 프로 16인치 대여',
      price: '50,000원/일',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '박유민',
      author_uuid: '1c971948-4ed9-4e2f-bd4a-7e0ed474a65b',
      createdAt: '2024-03-14',
      type: 'rental',
      content: '맥북 빌려드려요 이런 기회 두 번 다시 없어'
    },
    {
      id: 3,
      title: '게이밍 의자 교환',
      price: '교환 희망',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '박상연',
      author_uuid: 'b96c21fd-7876-40b5-a5c5-620bdd95cbd5',
      createdAt: '2024-03-13',
      type: 'exchange',
      content: '게이밍 의자 교환할 사람? 물론 님이 손해십니다.'
    },
    {
      id: 4,
      title: '아이폰 13 Pro Max 판매합니다',
      price: '1,200,000원',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '전유영',
      author_uuid: '0d957ba6-5abd-40d8-82f1-cc9761813ebb',
      createdAt: '2024-03-15',
      type: 'sell',
      content: '아이폰 13 팔아요 싱싱한 아이폰 1개에 120만원~'
    },
    {
      id: 5,
      title: '맥북 프로 16인치 판매합니다다',
      price: '50,000원/일',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '박유민',
      author_uuid: 'f44d0da3-8784-4c42-82da-a564bdda4c95',
      createdAt: '2024-03-14',
      type: 'sell',
      content: '맥북 빌려드려요 이런 기회 두 번 다시 없어'
    },
    {
      id: 6,
      title: '게이밍 의자 판매합니다',
      price: '교환 희망',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '박상연',
      author_uuid: 'b96c21fd-7876-40b5-a5c5-620bdd95cbd5',
      createdAt: '2024-03-13',
      type: 'sell',
      content: '게이밍 의자 교환할 사람? 물론 님이 손해십니다.'
    }
  ];

  const handleItemClick = (post) => {
    navigate(`/board/deal/${post.id}`, { state: post });
  };

  // 🔍 카테고리 및 검색어로 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = post.type === category;
    const matchesKeyword =
      keyword.trim() === '' ||
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.content.toLowerCase().includes(keyword.toLowerCase()) ||
      post.nickname.toLowerCase().includes(keyword.toLowerCase());

    return matchesCategory && matchesKeyword;
  });

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
              <img src={post.imageUrl} alt={post.title} />
            </div>
            <div className="deal-item-content">
              <div className="deal-item-header">
                <span className="deal-type">{post.type}</span>
                <h3 className="deal-item-title">{post.title}</h3>
              </div>
              <p className="deal-item-price">{post.price}</p>
              <div className="deal-item-info">
                <span>{post.nickname}</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
