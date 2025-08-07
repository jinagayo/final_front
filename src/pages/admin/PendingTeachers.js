import React, { useState, useEffect } from 'react';

const PendingTeachers = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingTeachers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token'); // 또는 다른 방식으로 토큰 가져오기
      
      const response = await fetch('/api/admin/pending-teachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include', // 쿠키 기반 인증인 경우
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      // 응답 상태 확인
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('접근 권한이 없습니다. 관리자 권한이 필요합니다.');
        } else if (response.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else {
          throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
        }
      }

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('응답 내용 (JSON 아님):', text);
        throw new Error('서버에서 올바른 JSON 응답을 받지 못했습니다.');
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log('setState 호출 전 데이터:', result.data);
        setPendingTeachers(result.data);
        console.log('setState 완료');
      } else {
        console.log('데이터 설정 실패 - success:', result.success, 'data:', result.data);
        throw new Error(result.message || '데이터 조회 실패');
      }
    } catch (error) {
      console.error('조회 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      console.log('승인 처리 시작:', userId, action);
      
      const endpoint = action === 'approve' ? 
        `/api/admin/approve-teacher/${userId}` : 
        `/api/admin/reject-teacher/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: action === 'reject' ? '관리자 승인 거부' : '' }),
      });

      const result = await response.json();
      console.log('승인 처리 응답:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || '승인 처리 실패');
      }

      // 성공시 목록 새로고침
      await fetchPendingTeachers();
      alert(`${action === 'approve' ? '승인' : '거절'} 처리되었습니다.`);
    } catch (error) {
      console.error('승인 처리 오류:', error);
      alert('처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  if (loading) {
    return (
      <div className="card-body">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">승인 대기 중인 강사 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-body">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">오류 발생</h4>
          <p>{error}</p>
          <hr />
          <div className="mb-0">
            <button 
              className="btn btn-outline-danger" 
              onClick={() => fetchPendingTeachers()}
            >
              다시 시도
            </button>
            {error.includes('권한') && (
              <div className="mt-2">
                <small className="text-muted">
                  관리자 권한이 필요합니다. 로그인 상태와 권한을 확인해주세요.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-body">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">승인 대기 중인 강사</h6>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">로딩 중...</p>
        </div>
      )}
      
      {!loading && pendingTeachers.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">승인 대기 중인 강사가 없습니다.</p>
        </div>
      ) : (
        !loading && (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map((teacher, index) => (
                  <tr key={teacher.userId || index}>
                    <td>{teacher.userId}</td>
                    <td>{teacher.name || '정보 없음'}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.position}</td>
                    <td>{teacher.state}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm mr-2"
                        onClick={() => handleApproval(teacher.userId, 'approve')}
                      >
                        승인
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleApproval(teacher.userId, 'reject')}
                      >
                        거절
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default PendingTeachers;