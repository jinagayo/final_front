import React, { useState } from 'react';
import Logo from './Logo';

const Topbar = ({ onSidebarToggle, user, isLoggedIn, onLogin, onLogout }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const actualLoginState = !!(isLoggedIn || (user && (user.user_id || user.userId)));

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

      {/* Logo */}
      <Logo />

      {/* 중앙 네비게이션 메뉴 영역 */}
      <div className="d-flex align-items-center justify-content-center flex-grow-1">
        <ul className="navbar-nav d-flex flex-row">
          <li className="nav-item mx-4"> {/* Increased mx from 3 to 4 for more space */}
            <a className="nav-link" href="/course/List">
              <i className="fas fa-users mr-1"></i>
              강의
            </a>
          </li>
          <li className="nav-item mx-4"> {/* Increased mx from 3 to 4 for more space */}
            <a className="nav-link" href="/board/list?boardnum=BOD003">
              <i className="fas fa-users mr-1"></i>
              커뮤니티
            </a>
          </li>
          <li className="nav-item mx-4"> {/* Increased mx from 3 to 4 for more space */}
            <a className="nav-link" href="#">
              <i className="fas fa-users mr-1"></i>
              코딩문제
            </a>
          </li>
        </ul>
      </div>

      {/* 오른쪽 컨텐츠 영역 */}
      <div className="d-flex align-items-center">
        <form className="d-none d-sm-inline-block form-inline mr-3 navbar-search">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Search for..."
              aria-label="Search"
              aria-describedby="basic-addon2"
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm">
                  <img
                    src="/img/searchIcon.png"
                    alt="Search"
                    style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }}
                  />
                </i>
              </button>
            </div>
          </div>
        </form>

        <ul className="navbar-nav">
          {/* 알림 */}
          <li className="nav-item dropdown no-arrow mx-1">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown('alerts');
              }}
              aria-expanded={activeDropdown === 'alerts'}
            >
              <i className="fas fa-bell fa-fw">
                <img
                  src="/img/alertIcon.png"
                  alt="Menu"
                  style={{ width: '20px', height: '20px' }}
                />
              </i>
              <span className="badge badge-danger badge-counter">3+</span>
            </a>
            <div
              className={`dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in ${
                activeDropdown === 'alerts' ? 'show' : ''
              }`}
            >
              <h6 className="dropdown-header">Alerts Center</h6>
              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-primary">
                    <i className="fas fa-file-alt text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 12, 2019</div>
                  <span className="font-weight-bold">A new monthly report is ready to download!</span>
                </div>
              </a>
              <a className="dropdown-item text-center small text-gray-500" href="#">
                Show All Alerts
              </a>
            </div>
          </li>

          <div className="topbar-divider d-none d-sm-block"></div>

          {/* 로그인/로그아웃 버튼*/}
          <li className="nav-item">
            <button
              type="button"
              className="nav-link btn"
              style={{
                backgroundColor: actualLoginState ? '#dc3545' : '#4e73df', // 로그인시 빨간색, 비로그인시 파란색
                color: 'white',
                borderRadius: '25px',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                height: '33px',
                marginTop: '20px',
                minWidth: '60px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = actualLoginState ? '#c82333' : '#334886';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = actualLoginState ? '#dc3545' : '#4e73df';
              }}
              onClick={actualLoginState ? onLogout : onLogin}
            >
              {actualLoginState ? 'LOGOUT' : 'LOGIN'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Topbar;