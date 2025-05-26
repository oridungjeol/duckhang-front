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
      image: 'https://via.placeholder.com/120',
      author: '윤채민',
      author_uuid: 'qwer',
      date: '2024-03-15',
      type: 'sell',
      description: '아이폰 13 팔아요 싱싱한 아이폰 1개에 120만원~'
    },
    {
      id: 2,
      title: '맥북 프로 16인치 대여',
      price: '50,000원/일',
      image: 'https://via.placeholder.com/120',
      author: '박유민',
      author_uuid: 'asdf',
      date: '2024-03-14',
      type: 'rental',
      description: '맥북 빌려드려요 이런 기회 두 번 다시 없어'
    },
    {
      id: 3,
      title: '게이밍 의자 교환',
      price: '교환 희망',
      image: 'https://via.placeholder.com/120',
      author: '박상연',
      author_uuid: 'zxcv',
      date: '2024-03-13',
      type: 'exchange',
      description: '게이밍 의자 교환할 사람? 물론 님이 손해십니다.'
    }
  ];

  const handleItemClick = (post) => {
    navigate(`/board/deal/${post.post_id}`, { state: post });
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
            <img src={post.image} alt={post.title} />
          </div>
          <div className="deal-item-content">
            <div className="deal-item-header">
              <span className="deal-type">{post.type}</span>
              <h3 className="deal-item-title">{post.title}</h3>
            </div>
            <p className="deal-item-price">{post.price}</p>
            <div className="deal-item-info">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
            <span className={`deal-status ${post.status}`}>
              {post.status === 'available' && '판매중'}
              {post.status === 'reserved' && '예약중'}
              {post.status === 'completed' && '거래완료'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
