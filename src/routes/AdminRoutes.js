import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import PendingTeachers from '../pages/admin/PendingTeachers';
import BannerUpload from '../pages/admin/BannerUpload';
// import UserManagement from '../pages/admin/UserManagement';
// import CourseManagement from '../pages/admin/CourseManagement';
// import Statistics from '../pages/admin/Statistics';
// import ProblemUpload from '../pages/admin/ProblemUpload';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* 강사 승인 관리 */}
        <Route path="/teacher-approval" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <PendingTeachers />
              </div>
            </div>
          </div>
        } />
        
        {/* 배너 이미지 등록 */}
        <Route path="/banner-upload" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <BannerUpload />
              </div>
            </div>
          </div>
        } />
        
        {/* 사용자 관리 - 나중에 추가
        <Route path="/users" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <UserManagement />
              </div>
            </div>
          </div>
        } />
        */}
        
        {/* 강의 관리 - 나중에 추가
        <Route path="/courses" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CourseManagement />
              </div>
            </div>
          </div>
        } />
        */}
        
        {/* 통계 관리 - 나중에 추가
        <Route path="/statistics" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <Statistics />
              </div>
            </div>
          </div>
        } />
        */}
        
        {/* 문제 업로드 - 나중에 추가
        <Route path="/problem-upload" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ProblemUpload />
              </div>
            </div>
          </div>
        } />
        */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;