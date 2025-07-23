import React, { useState } from 'react';
import {useAuth} from '../contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user }  = useAuth();// 사용자 정보

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isStudent = () => user?.position === '1' || user?.userType === 'student';
  const isTeacher = () => user?.position === '2' || user?.userType === 'teacher';
  const isAdmin = () => user?.position === '3' || user?.userType === 'admin';


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
                {user?.name || 'Guest'}
              </div>
              <div className="profile-id text-black-50" style={{ fontSize: '12px',color:'black' }}>
                {user?.user_id || 'Guest'}
              </div>
              <div className="profile-role text-black-50" style={{ fontSize: '10px', color:'gray' }}>
                {isStudent() && '학생'}
                {isTeacher() && '강사'}
                {isAdmin() && '관리자'}
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
          <hr className="sidebar-divider" />

          {/* 강의 부분 - 학생/강사 */} 
          {(isStudent() || isTeacher()) && (
            <>
              <div className="sidebar-heading">
                강의
              </div>
              {/*수강 신청 - 학생*/}
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
              {/* 강의관리 - 강사 */}
              {isTeacher() && (
                <li className="nav-item">
                  <a className="nav-link" href="/course/manage">
                    <i className="fas fa-fw fa-cogs"></i>
                    <span>강의 관리</span>
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
                <a className='nav-link' href='/admin/users'>
                  <i className='fas fa-fw fa-users'></i>
                  <span>사용자 관리</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/courses">
                  <i className="fas fa-fw fa-graduation-cap"></i>
                  <span>강의 관리</span>
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
                <a className="nav-link" href="/admin/statistics">
                  <i className="fas fa-fw fa-chart-bar"></i>
                  <span>문제 업로드</span>
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/admin/statistics">
                  <i className="fas fa-fw fa-chart-bar"></i>
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
              
          {/* Nav Item - Charts */}
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
          <li className="nav-item">
              <a className="nav-link" href="charts.html">
                <i className="fas fa-fw fa-chart-area"></i>
                <span>QnA</span>
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