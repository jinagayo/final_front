import React, { useState } from 'react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <ul className={`navbar-nav  sidebar sidebar-dark accordion ${isCollapsed ? 'toggled' : ''}`} id="accordionSidebar">
      
      {/* 프로필 섹션 */}
      <li className="nav-item" style={{backgroundColor:"white", position: 'relative'}}>
        {/* 토글 버튼 - 항상 오른쪽 위에 위치 */}
        <button 
          type="button"
          onClick={onToggle}
          title="Toggle Sidebar"
          style={{
            position: 'absolute',
            top: isCollapsed ? '50%' : '10px',
            right: '10px',
            transform: isCollapsed ? 'translateY(-50%)' : 'none',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
        >
          <img 
            src="/img/menuIcon.png" 
            alt="Menu" 
            style={{
              width: '30px',
              height: '30px'
            }} 
          />
        </button>

        {/* 프로필 내용 - 사이드바가 열린 상태에서만 보임 */}
        {!isCollapsed && (
          <a 
            className="nav-link d-flex align-items-center justify-content-center py-3" 
            href="/profile"
            style={{ 
              flexDirection: 'row',
              textAlign: 'left',
              padding: '1rem',
              Color:'black'
            }}
          >
            <div className="profile-image-container">
              <img 
                src="/img/undraw_profile.svg" 
                alt="Profile" 
                className="rounded-circle"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.2)'
                }}
              />
            </div>
            
            <div className="profile-info ml-3">
              <div className="profile-name text-black font-weight-bold" style={{ fontSize: '16px' ,color:'black'}}>
                jina
              </div>
              <div className="profile-id text-black-50" style={{ fontSize: '12px',color:'black' }}>
                @jae200341
              </div>
            </div>
          </a>
        )}
      </li>

      {/* 사이드바가 열린 상태에서만 보이는 메뉴들 */}
      {!isCollapsed && (
        <>
          {/* Divider */}
          <hr className="sidebar-divider my-0" />

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            강의
          </div>

          {/* Nav Item - Pages Collapse Menu */}
          <li className="nav-item">
            <a className="nav-link" href="charts.html">
              <i className="fas fa-fw fa-chart-area"></i>
              <span>수강신청</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="charts.html">
              <i className="fas fa-fw fa-chart-area"></i>
              <span>내강의실</span>
            </a>
          </li>

          {/* Divider */}
          <hr className="sidebar-divider" />

          {/* Heading */}
          <div className="sidebar-heading">
            마이페이지
          </div>

          {/* Nav Item - Charts */}
          <li className="nav-item">
            <a className="nav-link" href="charts.html">
              <i className="fas fa-fw fa-chart-area"></i>
              <span>마이페이지</span>
            </a>
          </li>

          {/* Nav Item - Tables */}
          <li className="nav-item active">
            <a className="nav-link" href="tables.html">
              <i className="fas fa-fw fa-table"></i>
              <span>취업지원</span>
            </a>
          </li>
          {/* Divider */}
          <hr className="sidebar-divider" />
          {/* Heading */}
          <div className="sidebar-heading">
            커뮤니티
          </div>

          {/* Nav Item - Charts */}
          <li className="nav-item">
            <a className="nav-link" href="charts.html">
              <i className="fas fa-fw fa-chart-area"></i>
              <span>공지사항</span>
            </a>
          </li>

          {/* Nav Item - Tables */}
          <li className="nav-item">
            <a className="nav-link" href="tables.html">
              <i className="fas fa-fw fa-table"></i>
              <span>자유게시판</span>
            </a>
          </li>
          {/* Divider */}
          <hr className="sidebar-divider d-none d-md-block" />
        </>
      )}
    </ul>
  );
};

export default Sidebar;