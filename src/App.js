import React from 'react';
import LayoutMain from './layout/LayoutMain';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseRoutes from './routes/CourseRoutes'; // 코스 관련 라우팅 분리

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈페이지는 LayoutMain 적용 */}
        <Route 
          path="/" 
          element={
            <LayoutMain>
              <Home />
            </LayoutMain>
          } 
        />
        
        {/* 다른 페이지는 별도 라우팅 파일에서 처리 */}
        <Route path="/course/*" element={<CourseRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;