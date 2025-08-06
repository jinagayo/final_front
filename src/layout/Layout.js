import React, { createContext, useState, useContext, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [authChanged, setAuthChanged] = useState(false);
  
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    setAuthChanged(prev => !prev);
  }, [user]);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      console.log('로그아웃 시도...');
      const result = await logout();
      
      if (result && result.success) {
        console.log('로그아웃 성공');
        alert('로그아웃되었습니다.');
        window.location.replace("/")

      } else {
        console.log('로그아웃 실패:', result);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 로그인 페이지로 이동
  const handleLogin = () => {
    navigate('/auth/login');
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // 로그인 상태 확인 - user 객체로 직접 확인
  const loggedIn = user && user.user_id; // 원래 코드 복원


  return (
    <div id="page-top" style={{backgroundColor:'#4e73df'}}>
      {/* Topbar - 상단 전체 */}
      <Topbar
        onSidebarToggle={handleSidebarToggle}
        user={user}
        isLoggedIn={loggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

             
      {/* Page Wrapper - 탑바 아래 영역 */}
      <div id="wrapper" className="d-flex" style={{ marginTop: '0' }}>
        {/* Sidebar - 왼쪽 */}
        <div className={`bg-gradient-primary sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={handleSidebarToggle}
            isLoggedIn={loggedIn}
            user={user}
          />
        </div>
                 
        {/* Content Wrapper - 사이드바 오른쪽 */}
        <div id="content-wrapper" className="d-flex flex-column flex-fill">
          {/* Main Content */}
          <div id="content" className="flex-fill">
            {/* Begin Page Content */}
            <div className="container-fluid p-4">
               <Outlet />
            </div>
            {/* /.container-fluid */}
          </div>
          {/* End of Main Content */}
                     
          {/* Footer */}
          <Footer />
        </div>
        {/* End of Content Wrapper */}
      </div>
      {/* End of Page Wrapper */}
       
      {/* Scroll to Top Button */}
      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
       
      {/* Login/Logout Modal - 기존 구조 유지 */}
      <div className="modal fade" id="logoutModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {loggedIn ? 'Ready to Leave?' : 'Login Required'}
              </h5>
              <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            
            <div className="modal-body">
              {loggedIn 
                ? `안녕하세요, ${user?.user_id || user?.name}님! 로그아웃 하시겠습니까?`
                : 'Select "Login" below if you want to access your account.'
              }
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
              {loggedIn ? (
                <button 
                  className="btn btn-primary" 
                  type="button" 
                  onClick={handleLogout}
                  data-dismiss="modal"
                >
                  Logout
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={handleLogin}
                  data-dismiss="modal"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 사이드바 토글을 위한 CSS */}
      <style>{`
        .sidebar {
          width: 250px !important;
          transition: width 0.3s ease !important;
          overflow: visible !important;
          min-width: 250px !important;
        }
        
        .sidebar.collapsed {
          width: 60px !important;
          min-width: 60px !important;
          overflow: visible !important;
        }
        
        /* 프로필 섹션이 collapsed 상태일 때 */
        .sidebar.collapsed .nav-item:first-child {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          height: 60px !important;
          width: 60px !important;
          position: relative !important;
          overflow: visible !important;
          min-height: 60px !important;
        }
        
        /* 토글 버튼은 항상 보이도록 */
        .sidebar.collapsed .nav-item:first-child button[title="Toggle Sidebar"] {
          position: static !important;
          transform: none !important;
          margin: 0 auto !important;
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 40px !important;
          height: 40px !important;
          justify-content: center !important;
          align-items: center !important;
          background-color: white !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          z-index: 1000 !important;
        }
        
        /* 토글 버튼의 이미지 */
        .sidebar.collapsed .nav-item:first-child button[title="Toggle Sidebar"] img {
          width: 24px !important;
          height: 24px !important;
          display: block !important;
        }
        
        /* 프로필 내용은 숨기기 */
        .sidebar.collapsed .profile-image-container,
        .sidebar.collapsed .profile-info,
        .sidebar.collapsed .nav-link {
          display: none !important;
        }
        
        /* 다른 메뉴 항목들도 숨기기 */
        .sidebar.collapsed .sidebar-heading,
        .sidebar.collapsed .sidebar-divider,
        .sidebar.collapsed .nav-item:not(:first-child) {
          display: none !important;
        }
        
        .sidebar.collapsed .nav-item .nav-link {
          text-align: center !important;
          padding: 0.75rem 1rem !important;
          justify-content: center !important;
        }
        
        .sidebar.collapsed .nav-item .nav-link i {
          margin-right: 0 !important;
        }
        
        .sidebar.collapsed .sidebar-brand {
          justify-content: center !important;
        }
        
        .sidebar.collapsed .sidebar-brand-icon {
          margin-right: 0 !important;
        }
        
        .sidebar.collapsed .nav-item .collapse {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default Layout;