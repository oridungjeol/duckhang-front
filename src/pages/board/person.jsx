import { useNavigate } from 'react-router-dom';
import './person.css';

export default function Person() {
  const navigate = useNavigate();

  // 임시 데이터
  const posts = [
    {
      id: 1,
      title: '던전 파티원 구합니다',
      price: 0,
      image: 'https://via.placeholder.com/120',
      author: '작성자1',
      author_uuid: 'qwer',
      date: '2024-03-15',
      type: '구인',
      description: '구인111111111'
    },
    {
      id: 2,
      title: '주말 레이드 동행 구합니다',
      price: 0,
      type: '동행',
      image: 'https://via.placeholder.com/120',
      author: '작성자2',
      author_uuid: 'asdf',
      date: '2024-03-14',
      type: '구인',
      description: '구인222222222'
    },
    {
      id: 3,
      title: 'PVP 대회 용병 구합니다',
      price: 0,
      type: '용병',
      image: 'https://via.placeholder.com/120',
      author: '작성자3',
      author_uuid: 'zxcv',
      date: '2024-03-13',
      type: '구인',
      description: '구인333333333'
    }
  ];

  return (
    <div className="person-board">
      {posts.map((post) => (
        <div onClick={() => {navigate(`/board/person/${post.id}`)}} key={post.id}>
          <div className="person-item">
            <div className="person-item-image">
              <img src={post.image} alt={post.title} />
            </div>
            <div className="person-item-content">
              <div className="person-item-header">
                <span className="person-type">{post.type}</span>
                <h3 className="person-item-title">{post.title}</h3>
              </div>
              <div className="person-item-details">
                <div className="person-detail-item">
                  <i className="fas fa-level-up-alt"></i>
                  <span>레벨 {post.details.level}</span>
                </div>
                <div className="person-detail-item">
                  <i className="fas fa-user"></i>
                  <span>{post.details.class}</span>
                </div>
                <div className="person-detail-item">
                  <i className="fas fa-clock"></i>
                  <span>{post.details.time}</span>
                </div>
              </div>
              <div className="person-item-info">
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
              <span className={`person-status ${post.status}`}>
                {post.status === 'recruiting' && '모집중'}
                {post.status === 'companion' && '동행중'}
                {post.status === 'mercenary' && '용병중'}
                {post.status === 'completed' && '완료'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
