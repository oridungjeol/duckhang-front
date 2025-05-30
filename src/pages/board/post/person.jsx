import { useNavigate } from 'react-router-dom';
import './person.css';

export default function Person({ keyword = '', category }) {
  const navigate = useNavigate();

  // 임시 데이터
  const posts = [
    {
      post_id: 1,
      title: '던전 파티원 구합니다',
      price: 0,
      image: 'https://via.placeholder.com/120',
      author: '작성자1',
      author_uuid: 'qwer',
      date: '2024-03-15',
      type: 'recruit',
      description: '구인111111111'
    },
    {
      post_id: 2,
      title: '주말 레이드 동행 구합니다',
      price: 0,
      image: 'https://via.placeholder.com/120',
      author: '작성자2',
      author_uuid: 'asdf',
      date: '2024-03-14',
      type: 'companion',
      description: '구인222222222'
    },
    {
      post_id: 3,
      title: 'PVP 대회 용병 구합니다',
      price: 0,
      image: 'https://via.placeholder.com/120',
      author: '작성자3',
      author_uuid: 'zxcv',
      date: '2024-03-13',
      type: 'mercenary',
      description: '구인333333333'
    }
  ];

  const handleItemClick = (post) => {
    navigate(`/board/person/${post.post_id}`, { state: post });
  };

  // 🔍 카테고리 및 검색어로 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = !category || post.type === category;
    const matchesKeyword =
      !keyword ||
      keyword.trim() === '' ||
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.description.toLowerCase().includes(keyword.toLowerCase()) ||
      post.author.toLowerCase().includes(keyword.toLowerCase());

    return matchesCategory && matchesKeyword;
  });

  return (
    <div className="person-board">
      {filteredPosts.length === 0 ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>검색 결과가 없습니다.</p>
      ) : (
        filteredPosts.map((post) => (
          <div onClick={() => handleItemClick(post)} key={post.post_id}>
            <div className="person-item">
              <div className="person-item-image">
                <img src={post.image} alt={post.title} />
              </div>
              <div className="person-item-content">
                <div className="person-item-header">
                  <span className="person-type">{post.type}</span>
                  <h3 className="person-item-title">{post.title}</h3>
                </div>
                <div className="person-item-info">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
