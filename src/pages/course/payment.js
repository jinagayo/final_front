// src/pages/course/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PaymentPage = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [impLoaded, setImpLoaded] = useState(false); // 아임포트 로드 상태 추가

    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const params = new URLSearchParams(location.search);
    const classId = params.get('class_id');

    // 1. 아임포트 스크립트 동적 로딩
    useEffect(() => {
        const loadIamportScript = () => {
            return new Promise((resolve, reject) => {
                // 이미 로드되어 있는지 확인
                if (window.IMP) {
                    console.log('아임포트가 이미 로드되어 있습니다.');
                    resolve();
                    return;
                }

                // 기존 스크립트 태그가 있는지 확인
                const existingScript = document.querySelector('script[src*="iamport"]');
                if (existingScript) {
                    existingScript.onload = () => resolve();
                    existingScript.onerror = () => reject(new Error('아임포트 스크립트 로드 실패'));
                    return;
                }

                // 새 스크립트 태그 생성
                const script = document.createElement('script');
                script.src = 'https://cdn.iamport.kr/v1/iamport.js';
                script.async = true;
                
                script.onload = () => {
                    console.log('아임포트 스크립트 로드 완료');
                    resolve();
                };
                
                script.onerror = () => {
                    console.error('아임포트 스크립트 로드 실패');
                    reject(new Error('아임포트 스크립트 로드 실패'));
                };

                document.head.appendChild(script);
            });
        };

        const initializeIamport = async () => {
            try {
                await loadIamportScript();
                
                // 스크립트 로드 후 잠시 대기 (IMP 객체 초기화 시간)
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (window.IMP) {
                    window.IMP.init("imp54374528");
                    setImpLoaded(true);
                    console.log('아임포트 초기화 완료');
                } else {
                    throw new Error('IMP 객체가 생성되지 않았습니다.');
                }
            } catch (error) {
                console.error('아임포트 초기화 오류:', error);
                setError(`결제 시스템 초기화 실패: ${error.message}`);
                setImpLoaded(false);
            }
        };

        initializeIamport();
    }, []);

    // 2. 강의 정보 로딩
    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated()) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        const fetchCourseDetail = async () => {

            if (!classId) {
                setError("결제할 강의 ID가 URL에 제공되지 않았습니다.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log(`=== API 요청 시작: /course/Payment?class_id=${classId} ===`);

                const response = await axios.get(`http://localhost:8080/course/Payment`, {
                    params: { class_id: classId },
                    withCredentials: true
                });

                console.log('=== 응답 정보 ===', response);

                if (response.status === 200 && response.data) {
                    let fetchedCourseData = null;
                    
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        fetchedCourseData = response.data[0];
                    } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                        fetchedCourseData = response.data.data[0];
                    } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                        fetchedCourseData = response.data;
                    }

                    if (fetchedCourseData && Object.keys(fetchedCourseData).length > 0) {
                        setCourse(fetchedCourseData);
                        console.log('성공적으로 강의 상세 정보를 불러왔습니다:', fetchedCourseData);
                    } else {
                        setError("결제할 강의 정보를 찾을 수 없습니다.");
                        setCourse(null);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.error('=== API 요청 실패 ===', err);
                const errorMessage = `결제할 강의 정보를 불러오는데 실패했습니다: ${err.message || '알 수 없는 오류'}`;
                setError(errorMessage);
                setCourse(null);
                alert(`서버 연결 오류: ${err.message}\n네트워크 상태와 서버 상태를 확인해주세요.`);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetail();
    }, [location.search, navigate, isAuthenticated, authLoading]);

    const NaverPay = async (paymentType) => {
        if (!impLoaded) {
            alert("결제 시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        // 네이버페이 결제 로직 (카카오페이와 동일하게 구현)
        await processPayment('naverpay');
    };

    const KakaoPay = async (paymentType) => {
        if (!impLoaded) {
            alert("결제 시스템이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        await processPayment('kakaopay');
    };

    const processPayment = async (pgMethod) => {
        if (!course) {
            alert("결제할 강의 정보가 없습니다.");
            return;
        }

        if (!window.IMP) {
            alert("결제 시스템이 초기화되지 않았습니다. 페이지를 새로고침 해주세요.");
            return;
        }

        // 결제 정보 준비
        const merchantUid = `ORD-${new Date().getTime()}-${course.class_id}`;
        const orderName = course.name;
        const orderAmount = course.price;
        const buyerEmail = "goodeegdj90@gmail.com";
        const buyerName = "테스트 구매자";
        const buyerTel = "010-1234-5678";
        const buyerAddr = "서울특별시 강남구";
        const buyerPostcode = "06130";

        console.log('결제 요청 시작:', {
            pg: pgMethod,
            merchant_uid: merchantUid,
            name: orderName,
            amount: orderAmount
        });

        // 아임포트 결제 요청
        window.IMP.request_pay({
            pg: pgMethod,
            pay_method: "card",
            merchant_uid: merchantUid,
            name: orderName,
            amount: orderAmount,
            buyer_email: buyerEmail,
            buyer_name: buyerName,
            buyer_tel: buyerTel,
            buyer_addr: buyerAddr,
            buyer_postcode: buyerPostcode
        }, (rsp) => {
            console.log('결제 응답:', rsp);
            
            if (rsp.success) {
                let msg = "결제가 완료 되었습니다.";
                msg += "\n고유ID : " + rsp.imp_uid;
                msg += "\n결제금액 : " + rsp.paid_amount;
                alert(msg);


            axios.post("http://localhost:8080/course/PaymentUpdate", {
                class_id: course.classId,
                payment_type:pgMethod,
                payment_code: rsp.merchant_uid,
                price: rsp.paid_amount
            })
            .then(res => {
                console.log("백엔드 저장 성공:", res.data);
                // ⏩ 저장 완료 후 페이지 이동
                navigate(`/course/PaymentEnd?class_id=${course.classId}`);
            })
            .catch(err => {
                console.error("백엔드 저장 실패:", err);
                alert("결제 정보 저장에 실패했습니다. 관리자에게 문의하세요.");
            });

            } else {
                alert("결제에 실패했습니다: " + rsp.error_msg);
            }
        });
    };

    // 로딩 상태 UI
    if (loading || authLoading || !impLoaded) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="ml-2">
                    {!impLoaded ? "결제 시스템을 준비하는 중..." : "강의 정보를 불러오는 중..."}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">결제 오류</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>이전 페이지로 돌아가기</button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">강의 정보 없음</h4>
                    <p>결제할 강의 정보를 찾을 수 없습니다.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/course/list')}>강의 목록으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">수강 신청 및 결제</h2>
            <div className="card shadow-sm p-4 mb-4">
                <div className="row g-0 align-items-center">
                    <div className="col-md-3">
                        <img
                            src={course.img ? `/img/${course.img}` : "/img/default_course_thumbnail.png"}
                            alt={course.name || "강의 썸네일"}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="col-md-9 pl-md-4">
                        <h5 className="card-title mb-1">{course.name || '강의명 없음'}</h5>
                        <p className="card-text text-muted small mb-2">{course.intro || '강의 소개가 없습니다.'}</p>
                        <p className="card-text font-weight-bold h4 text-primary">
                            가격: {course.price ? `${course.price.toLocaleString()}원` : '가격 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>

            <h5 className="mb-3">결제 수단 선택</h5>
            <div className="payment-options">
                <button
                    className="btn btn-warning btn-lg btn-block mb-3 d-flex align-items-center justify-content-center"
                    onClick={() => KakaoPay('카카오페이')}
                    disabled={!impLoaded}
                >
                    <img src="/img/kakaopay.png" alt="카카오페이" className="payment-logo mr-2" />
                    카카오페이로 결제하기
                </button>
                <button
                    className="btn btn-success btn-lg btn-block d-flex align-items-center justify-content-center"
                    onClick={() => NaverPay('네이버페이')}
                    disabled={!impLoaded}
                >
                    <img src="/img/naverpay.svg" alt="네이버페이" className="payment-logo mr-2" />
                    네이버페이로 결제하기
                </button>
            </div>

            <p className="text-muted small mt-4 text-center">
                결제 시, 서비스 약관 및 정책에 동의하는 것으로 간주됩니다.
            </p>

        </div>
    );
};

export default PaymentPage;