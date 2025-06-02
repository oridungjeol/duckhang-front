import { NavLink } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        메뉴
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        검색
      </NavLink>
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        홈
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        채팅
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        내정보
      </NavLink>
    </nav>
  );
}
