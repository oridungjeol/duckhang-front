import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';
import Cookies from 'js-cookie';

export default function BottomNav() {
  const location = useLocation();
  const uuid = Cookies.get('uuid');

  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/chat" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        채팅
      </NavLink>
      <NavLink 
        to="/board" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        게시판
      </NavLink>
      <NavLink 
        to={`/user/${uuid}`}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        내정보
      </NavLink>
    </nav>
  );
}
