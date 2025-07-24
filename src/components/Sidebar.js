import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, isLoading } = useAuth();

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('=== Sidebar 렌더링 ===');
    console.log('isLoading:', isLoading);
    console.log('user:', user);
    console.log('user?.position:', user?.position);
    console.log('user?.position type:', typeof user?.position);
  }, [user, isLoading]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // 권한 확인 함수들
  const isStudent = () => {
    const result = user?.position === '1';
    console.log('isStudent():', result);
    return result;
  };
  
  const isTeacher = () => {
    const result = user?.position === '2';
    console.log('isTeacher():', result);
    return result;
  };
  
  const isAdmin = () => {
    const result = user?.position === '3';
    console.log('isAdmin():', result);
    return result;
  };

  // 로딩 중일 때
  if (isLoading) {
    console.log('Sidebar 로딩 중...');
    return (
      <ul className={`navbar-nav sidebar sidebar-dark accordion ${isCollapsed ? 'toggled' : ''}`}>
        <li className="nav-item">
          <div className="nav-link text-center">
            <i className="fas fa-spinner fa-spin"></i>
            <span className="ml-2">로딩 중...</span>
          </div>
        </li>
      </ul>
    );
  }
  return (
    <ul className={`navbar-nav sidebar sidebar-dark accordion ${isCollapsed ? 'toggled' : ''}`} id="accordionSidebar">
      
      {/* 프로필 섹션 */}
      <li className="nav-item" style={{backgroundColor:"white", position: 'relative'}}>
        {/* 토글 버튼 */}
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

        {/* 프로필 내용 */}
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
                {user?.name || 'Guest'}
              </div>
              <div className="profile-id text-black-50" style={{ fontSize: '12px',color:'black' }}>
                {user?.user_id || 'Guest'}
              </div>
              <div className="profile-role text-black-50" style={{ fontSize: '10px', color:'gray' }}>
                {isStudent() && '학생'}
                {isTeacher() && '강사'}
                {isAdmin() && '관리자'}
                {!user && 'Guest'}
              </div>
            </div>
          </a>
        )}
      </li>

      {/* 사이드바가 열린 상태에서만 보이는 메뉴들 */}
      {!isCollapsed && (
        <>
          <hr className="sidebar-divider my-0" />
          <hr className="sidebar-divider" />

          {/* 강의 부분 - 학생/강사 */} 
          {(isStudent() || isTeacher()) && (
            <>
              <div className="sidebar-heading">
                강의
              </div>
              
              {/* 수강 신청 - 학생 */}
              {isStudent() && (
                <li className="nav-item">
                  <a className="nav-link" href="charts.html">
                    <i className="fas fa-fw fa-chart-area"></i>
                    <span>수강신청</span>
                  </a>
                </li>
              )}

              {/* 내 강의실 - 학생/강사 */}
              <li className="nav-item">
                <a className="nav-link" href="charts.html">
                  <i className="fas fa-fw fa-chart-area"></i>
                  <span>내강의실</span>
                </a>
              </li>
              
              {/* 강의개설 - 강사 */}
              {isTeacher() && (
                <li className="nav-item">
                  <a className="nav-link" href="/course/teacher/List">
                    <i className="fas fa-fw fa-cogs"></i>
                    <span>강의 개설</span>
                  </a>
                </li>
              )}
              <hr className="sidebar-divider" />
            </>
          )}
          
          {/* 관리자 전용 */}
          {isAdmin() && (
            <>
              <div className="sidebar-heading">
                관리자 메뉴
              </div>
              <li className='nav-item'>
                <a className='nav-link' href='/admin/students'>
                  <i className='fas fa-fw fa-user-graduate'></i>
                  <span>학생 관리</span>
                </a>
              </li>

              <li className='nav-item'>
                <a className='nav-link' href='/admin/teachers'>
                  <i className='fas fa-fw fa-chalkboard-teacher'></i>
                  <span>강사 관리</span>
                </a>
              </li>
              <li className='nav-item'>
                <a className='nav-link' href='/admin/teacher-approval'>
                  <i className='fas fa-fw fa-users'></i>
                  <span>강사 승인 관리</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/statistics">
                  <i className="fas fa-fw fa-chart-bar"></i>
                  <span>통계 관리</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/problem-upload">
                  <i className="fas fa-fw fa-upload"></i>
                  <span>문제 업로드</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/banner-upload">
                  <i className="fas fa-fw fa-image"></i>
                  <span>배너 이미지 등록</span>
                </a>
              </li>
              <hr className="sidebar-divider" />
            </>
          )}
          
          {/* 마이 페이지 - 모든 사용자 */}
          <div className="sidebar-heading">
            마이페이지
          </div>
          
          <li className="nav-item">
            <a className="nav-link" href="charts.html">
                <i className="fas fa-fw fa-chart-area"></i>
                <span>마이페이지</span>
            </a>
          </li>
          
          {/* 취업 지원 - 학생 */}
          {isStudent() && (
            <li className="nav-item active">
              <a className="nav-link" href="tables.html">
                <i className="fas fa-fw fa-table"></i>
                <span>취업지원</span>
              </a>
            </li>
          )}

          <hr className="sidebar-divider" />
          
          <div className="sidebar-heading">
            커뮤니티
          </div>

          <li className="nav-item">
            <a className="nav-link" href="charts.html">
              <i className="fas fa-fw fa-chart-area"></i>
              <span>공지사항</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="tables.html">
              <i className="fas fa-fw fa-table"></i>
              <span>자유게시판</span>
            </a>
          </li>
          
          <li className="nav-item">
              <a className="nav-link" href="charts.html">
                <i className="fas fa-fw fa-chart-area"></i>
                <span>QnA</span>
              </a>
          </li>
          
          <hr className="sidebar-divider d-none d-md-block" />
        </>
      )}
    </ul>
  );
};

export default Sidebar;