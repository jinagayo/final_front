import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import BoardList from '../pages/board/List';
import BoardDetail from '../pages/board/Detail'
import BoardWrite from "../pages/board/Write"
import BoardEdit from '../pages/board/Edit';
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
            {/* 게시물 상세 */}
            <Route path='/detail/:boardId' element={
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card shadow mb-4">
                            <BoardDetail />
                        </div>
                    </div>
                </div>
            }/>
            {/* 게시글 작성 */}
            <Route path='/write' element={
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card shadow mb-4">
                            <BoardWrite />
                        </div>
                    </div>
                </div>
            }/>
            {/* 게시글 작성 */}
            <Route path='/edit/:boardId' element={
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card shadow mb-4">
                            <BoardEdit />
                        </div>
                    </div>
                </div>
            }/>
            </Route>

        </Routes>
    )
};  

export default BoardRouters;