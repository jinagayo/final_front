
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    console.log('Sidebar toggled:', !sidebarCollapsed); // 디버깅용
  };

  return (
    <div id="page-top" style={{backgroundColor:'#4e73df'}}>
      {/* Topbar - 상단 전체 */}
      <Topbar onSidebarToggle={handleSidebarToggle} />
             
      {/* Page Wrapper - 탑바 아래 영역 */}
      <div id="wrapper" className="d-flex" style={{ marginTop: '0' }}>
                 
        {/* Content Wrapper - 사이드바 오른쪽 */}
        <div id="content-wrapper" className="d-flex flex-column flex-fill">
          {/* Main Content */}
          <div id="content" className="flex-fill">
            {/* Begin Page Content */}
            <div className="container-fluid p-4">
              {children}
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
       
      {/* Logout Modal */}
      <div className="modal fade" id="logoutModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
              <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
              <a className="btn btn-primary" href="login.html">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
