import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios'
import Posts from './Posts';
import Reviews from './Reviews';
import './profile.css';
import BottomNav from '../../components/BottomNav';
import ProfileEdit from './ProfileEdit';

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost/api/user/${userId}`, { withCredentials: true })
      .then(res => {
        console.log('프로필 이미지 URL:', res.data.profileImageUrl);
        setProfile(res.data);
      });

    axios.get(`http://localhost/api/board/user/${userId}`, { withCredentials: true })
      .then(res => setPosts(res.data));

    axios.get(`http://localhost/api/review/${userId}?pageNumber=0&pageSize=10`, { withCredentials: true })
      .then(res => setReviews(res.data));
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="user-profile" style={{ position: 'relative' }}>
      {editMode ? (
        <ProfileEdit
          profile={profile}
          onClose={() => setEditMode(false)}
          onSave={() => {
            setEditMode(false);
            // 프로필 재조회 등 추가
          }}
        />
      ) : (
        <>
          <button
            onClick={() => setEditMode(true)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              padding: '8px 20px',
              borderRadius: 8,
              background: '#FF9A42',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              zIndex: 10
            }}
          >
            프로필 수정
          </button>
          <div className="header-background" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-80px' }}>
            <div style={{
              width: 180, height: 180, borderRadius: '50%', background: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt="profile" 
                  style={{ 
                    width: 140, 
                    height: 140, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    background: '#ffcc00', 
                    border: '4px solid white' 
                  }} 
                />
              ) : (
                <img 
                  src="/duckhaeng_logo.png" 
                  alt="duckhaeng" 
                  style={{ width: 90, height: 90 }} 
                />
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 36, marginBottom: 4 }}>{profile.nickname}</div>
            <div className="rating" style={{ fontSize: 20, fontWeight: 500 }}>⭐ {profile.scope?.toFixed(2) ?? '0.00'}</div>
          </div>
          <div className="tab-bar">
            <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>게시글</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>리뷰</button>
          </div>
          <div style={{ marginTop: 16 }}>
            {activeTab === 'posts' ? (
              Array.isArray(posts) && posts.filter(Boolean).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 8 }}>
                  {posts.map((url, idx) => (
                    url ? (
                      <img key={idx} src={url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8 }} />
                    ) : null
                  ))}
                </div>
              ) : null
            ) : (
              <Reviews reviews={reviews} />
            )}
          </div>
          <BottomNav />
        </>
      )}
    </div>
  );
}
