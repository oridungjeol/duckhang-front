import { useNavigate } from 'react-router-dom';
import './deal.css';

export default function Deal() {
  const navigate = useNavigate();

  //dummy data
  const posts = [
    {
      id: 1,
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
      id: 2,
      title: '맥북 프로 16인치 대여',
      price: '50,000원/일',
      imageUrl: 'https://via.placeholder.com/120',
      nickname: '박유민',
      author_uuid: 'f44d0da3-8784-4c42-82da-a564bdda4c95',
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
    }
  ];

  const handleItemClick = (post) => {
    navigate(`/board/deal/${post.id}`, { state: post });
  };

  return (
    <div className="deal-board">
      {posts.map((post) => (
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
            {/* <span className={`deal-status ${post.status}`}>
              {post.status === 'available' && '판매중'}
              {post.status === 'reserved' && '예약중'}
              {post.status === 'completed' && '거래완료'}
            </span> */}
          </div>
        </div>
      ))}
    </div>
  );
}
