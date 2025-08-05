import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Info from '../pages/mypage/Info';
import BoardList from "../pages/myclass/List"
function MypageRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="Info" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <Info />
              </div>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default MypageRoutes;