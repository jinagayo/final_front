import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import LectureViewer from '../pages/myclass/videoView';
import VideoUploader from '../pages/myclass/teacher/video';
import TCourseList from '../pages/myclass/teacher/classList';
import TCourseDetail from '../pages/myclass/teacher/classDetail';
import TAssignmentForm from '../pages/myclass/teacher/assignment';
import AssignmentSubmissions from '../pages/myclass/teacher/AssignmentList';
import TestCreate from '../pages/myclass/teacher/Test';
import StudentAssignmentView from '../pages/myclass/Assignment';
import List from '../pages/myclass/List';
import Main from '../pages/myclass/Main';
import StudentTestTake from '../pages/myclass/Test';
import StudentTestResult from '../pages/myclass/TestResult';
import TeacherTestList from '../pages/myclass/teacher/TestList';
import TeacherTestResult from '../pages/myclass/teacher/TestDetail';

function ClassRoutes() {
  return (
    <Routes>
 <Route path="teacher/classList" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseList />
            </div>
              </div>
              </div>
  } />
            <Route path="teacher/classDetail" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseDetail />
            </div>
              </div>
              </div>
  } />  
            <Route path="teacher/assignment" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TAssignmentForm />
            </div>
              </div>
              </div>
  } />  
            <Route path="teacher/test" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TestCreate />
            </div>
              </div>
              </div>
  } /> 
            <Route path="teacher/video/:classId" element={
               <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                 <VideoUploader />
            </div>
              </div>
              </div>
   } />

           <Route path="videoView/:meterId" element={
               <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                 < LectureViewer />
            </div>
              </div>
              </div>
   } />

        <Route path="list" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <List />
              </div>
            </div>
          </div>
        } />
        <Route path="Main" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <Main />
              </div>
            </div>
          </div>
        } />
        <Route path="assignment" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <StudentAssignmentView />
              </div>
            </div>
          </div>
        } />

        <Route path="teacher/assignmentList" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <AssignmentSubmissions />
              </div>
            </div>
          </div>
        } />
        <Route path="test" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <StudentTestTake />
              </div>
            </div>
          </div>
        } />
        <Route path="test/result" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <StudentTestResult />
              </div>
            </div>
          </div>
        } />

        <Route path="teacher/testList" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <TeacherTestList />
              </div>
            </div>
          </div>
        } />
        <Route path="teacher/testDetail" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <TeacherTestResult />
              </div>
            </div>
          </div>
        } />
      
    </Routes>
  );
}

export default ClassRoutes;