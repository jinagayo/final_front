import React from 'react';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import Home from './pages/Home';

function App() {
  return (
    <Layout>
      {/* 여기에 페이지 컨텐츠를 추가하세요 */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow mb-4">
              <Home></Home>
          </div>
        </div>
      </div>
    </Layout>
  );
}


export default App; 