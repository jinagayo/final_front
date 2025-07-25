import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import BoardList from '../pages/board/List';

const BoardRouters = () => {
    return (
        <Routes>
            <Route element={<Layout/>}>
                {/* 게시판 리스트 */}
                <Route path='/list' element={
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card shadow mb-4">
                                <BoardList />
                            </div>
                        </div>
                    </div>
                }/>
            </Route>
        </Routes>
    )
};  

export default BoardRouters;