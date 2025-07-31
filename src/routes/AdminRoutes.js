import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import PendingTeachers from '../pages/admin/PendingTeachers';
import BannerUpload from '../pages/admin/BannerUpload';
import StudentManagement from '../pages/admin/StudentManagement';
import TeacherManagement from '../pages/admin/TeacherManagement';
import ClassList from '../pages/admin/class/ClassList';
import ClassDetail from '../pages/admin/class/Detail';
// import Statistics from '../pages/admin/Statistics';
import ProblemUpload from '../pages/admin/ProblemUpload';
import ProblemList from "../pages/admin/coding/Codelist"
import ProblemDetail from "../pages/admin/coding/Detail"

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
        
        {/* 학생 관리*/}
        <Route path="/students" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <StudentManagement />
              </div>
            </div>
          </div>
        } />
        {/* 강사 관리*/}
        <Route path="/teachers" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <TeacherManagement />
              </div>
            </div>
          </div>
        } />
        
        <Route path="/class/ClassList" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ClassList />
              </div>
            </div>
          </div>
        } />
        <Route path="/class/Detail/:classId" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ClassDetail />
              </div>
            </div>
          </div>
        } />
        
        {/* 문제 업로드 - 나중에 추가        */}
        <Route path="/problem-upload" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ProblemUpload />
              </div>
            </div>
          </div>
        } />

        {/* 문제 조회 */}
        <Route path="/coding/list" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ProblemList />
              </div>
            </div>
          </div>
        } />
        {/* 문제 조회 */}
        <Route path="/coding/detail/:problemId" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <ProblemDetail />
              </div>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;