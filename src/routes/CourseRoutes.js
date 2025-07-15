import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import CourseList from '../pages/course/List';
import CourseDetail from '../pages/course/Detail';

// 일반 페이지용 래퍼 컴포넌트
const PageWrapper = ({ children }) => (
  <Layout>
    <div className="row">
      <div className="col-lg-12">
        <div className="card shadow mb-4">
          {children}
        </div>
      </div>
    </div>
  </Layout>
);

function CourseRoutes() {
  return (
    <Routes>
      <Route path="list" element={<PageWrapper><CourseList /></PageWrapper>} />
      <Route path="detail/:id" element={<PageWrapper><CourseDetail /></PageWrapper>} />
    </Routes>
  );
}

export default CourseRoutes;