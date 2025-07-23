import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentEnd = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const class_id = params.get('class_id');


    useEffect(() => {
        if (!class_id) return;

        axios.get("http://localhost:8080/course/PaymentEnd", {
        params: {
            class_id: class_id
        },withCredentials: true
        }).then(response => {
        console.log(response.data);
        }).catch(error => {
        console.error("요청 실패", error);
        });
    },[class_id]);
    


    const navigate = (path) => {
        console.log(`Navigate to: ${path}`);
        // 실제로는 useNavigate()(path) 형태로 사용
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        style={{height:"100%"}}>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                {/* 성공 아이콘 */}
                <div className="mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg 
                            className="w-10 h-10 text-green-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{width:"400px"}}
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
                
                {/* 완료 메시지 */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    결제가 완료되었습니다!
                </h2>
                <p className="text-gray-600 mb-8">
                    구매해주셔서 감사합니다. 이제 강의를 수강하실 수 있습니다.
                </p>
                
                {/* 버튼들 */}
                <div className="space-y-3" style={{height:"130px"}}>
                    <button
                        className="btn btn-primary payment-end-button"
                        style={{margin:"5px"}}
                        onClick={() => navigate('/my-courses')} // 내 강의실 경로로 변경
                    >
                        내 강의실 바로가기
                    </button>
                    <button
                        className="btn btn-outline-secondary payment-end-button"
                        style={{margin:"5px"}}
                        onClick={() => navigate('/course/list')} // 강의 목록 경로로 변경
                    >
                        전체 강의 목록
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default PaymentEnd;