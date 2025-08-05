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
import BoardList from "../pages/myclass/board/List"
import BoardWrite from "../pages/myclass/board/Write"
import BoardEdit from '../pages/myclass/board/Edit';
import BoardDetail from '../pages/myclass/board/Detail';
import Main from '../pages/myclass/Main';
import StudentTestTake from '../pages/myclass/Test';
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
      {/* 강의별 게시판 라우트 추가 */}
      <Route path='board/list/:classId' element={
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow mb-4">
              <BoardList />
            </div>
          </div>
        </div>
      }/>
      <Route path='board/detail/:classId/:boardId' element={
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow mb-4">
              <BoardDetail />
            </div>
          </div>
        </div>
      }/>
      {/* 강의별 게시판작성 라우터 */}
      <Route path='board/write/:classId' element={
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow mb-4">
              <BoardWrite />
            </div>
          </div>
        </div>
      }/>
      {/* 강의별 게시판작성 라우터 */}
      <Route path='board/edit/:classId/:boardId' element={
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow mb-4">
              <BoardEdit />
            </div>
          </div>
        </div>
      }/>
    </Routes>
  );
}

export default ClassRoutes;