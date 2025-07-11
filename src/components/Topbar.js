import React, { useState } from 'react';
import Logo from './Logo';

const Topbar = ({ onSidebarToggle }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      {/* Sidebar Toggle (Topbar) - 모바일용 */}
      <form className="form-inline">
        <button 
          type="button"
          className="btn btn-link d-md-none rounded-circle mr-3"
          onClick={onSidebarToggle}
        >
          <i className="fa fa-bars"></i>
        </button>
      </form>

      {/* Logo */}
      <Logo />

      {/* 중앙 네비게이션 메뉴 영역 */}
      <div className="d-flex align-items-center justify-content-center flex-grow-1">
        <ul className="navbar-nav d-flex flex-row">{/* 사이드바 토글 버튼 - 메뉴 오른쪽에 위치 */}

          <li className="nav-item mx-3">
            <a className="nav-link" href="#">
              <i className="fas fa-users mr-1"></i>
              강의
            </a>
          </li>
          
          <li className="nav-item mx-3">
            <a className="nav-link" href="#">
              <i className="fas fa-users mr-1"></i>
              커뮤니티
            </a>
          </li>
          
          <li className="nav-item mx-3">
            <a className="nav-link" href="#">
              <i className="fas fa-users mr-1"></i>
              코딩문제
            </a>
          </li>
        </ul>

        
      </div>

      {/* 오른쪽 컨텐츠 영역 */}
      <div className="d-flex align-items-center">
        {/* Topbar Search */}
        <form className="d-none d-sm-inline-block form-inline mr-3 navbar-search">
          <div className="input-group">
            <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..."
              aria-label="Search" aria-describedby="basic-addon2" />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm">

                <img 
                  src="/img/searchIcon.png" 
                  alt="Menu" 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    filter: 'brightness(0) invert(1)'
                  }} 
                />
                  
                </i>
              </button>
            </div>
          </div>
        </form>

        <ul className="navbar-nav">
          {/* Nav Item - Alerts */}
          <li className="nav-item dropdown no-arrow mx-1">
            <a className="nav-link dropdown-toggle" href="#" 
               onClick={(e) => { e.preventDefault(); toggleDropdown('alerts'); }}
               aria-expanded={activeDropdown === 'alerts'}>
              <i className="fas fa-bell fa-fw">
                <img 
                  src="/img/alertIcon.png" 
                  alt="Menu" 
                  style={{ 
                    width: '20px', 
                    height: '20px'
                  }} 
                />
            </i>
              {/* Counter - Alerts */}
              <span className="badge badge-danger badge-counter">3+</span>
            </a>
            {/* Dropdown - Alerts */}
            <div className={`dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in ${activeDropdown === 'alerts' ? 'show' : ''}`}>
              <h6 className="dropdown-header">
                Alerts Center
              </h6>
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
              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-success">
                    <i className="fas fa-donate text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 7, 2019</div>
                  $290.29 has been deposited into your account!
                </div>
              </a>
              <a className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-warning">
                    <i className="fas fa-exclamation-triangle text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 2, 2019</div>
                  Spending Alert: We've noticed unusually high spending for your account.
                </div>
              </a>
              <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
            </div>
          </li>

          <div className="topbar-divider d-none d-sm-block"></div>

          {/* Nav Item - User Information */}
           <li className="nav-item">
      <button
        type="button"
        className="nav-link btn"
        style={{
          backgroundColor:'#4e73df',
          color:'white',
          borderRadius: '25px',
          fontSize: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          height:'33px',
          marginTop:'20px'
        }}
        onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#334886';
        }}
        onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4e73df';
        }}
      > LOGOUT
      </button>
    </li>
        </ul>
      </div>
    </nav>
  );
};

export default Topbar;