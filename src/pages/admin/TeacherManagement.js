import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('userId');
  const [sortOrder, setSortOrder] = useState('asc');
  const { user } = useAuth();

  // 관리자 권한 확인
  const isAdmin = () => user?.position === '3' || user?.position === 'admin';

  // 강사 목록 가져오기
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/admin/teachers', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data || []);
      } else {
        console.error('강사 목록 가져오기 실패');
        setTeachers([]);
      }
    } catch (error) {
      console.error('강사 목록 가져오기 오류:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // 강사 상태 변경
  const toggleTeacherStatus = async (userId, currentStatus) => {
    if (!window.confirm(`이 강사를 ${currentStatus === 'ACTIVE' ? '비활성화' : '활성화'}하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        })
      });

      if (response.ok) {
        fetchTeachers();
        alert('강사 상태가 변경되었습니다.');
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 강사 삭제
  const deleteTeacher = async (userId) => {
    if (!window.confirm('정말로 이 강사를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchTeachers();
        alert('강사가 삭제되었습니다.');
      } else {
        alert('강사 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 삭제 오류:', error);
      alert('강사 삭제 중 오류가 발생했습니다.');
    }
  };

  // 데이터 필터링
  const filterData = (data) => {
    return data.filter(item =>
      item.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 데이터 정렬
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  };

  // 정렬 변경
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTeachers();
  }, []);

  // 관리자 권한 확인
  if (!isAdmin()) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          관리자 권한이 필요합니다.
        </div>
      </div>
    );
  }

  const filteredData = filterData(teachers);
  const sortedData = sortData(filteredData);

  return (
    <div className="container-fluid px-4 py-5">
      {/* 페이지 헤더 */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-chalkboard-teacher mr-2"></i>
          강사 관리
        </h1>
      </div>

      {/* 강사 통계 카드 */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    전체 강사
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    활성 강사
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.filter(teacher => teacher.state === 'ACTIVE').length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user-check fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    비활성 강사
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.filter(teacher => teacher.state === 'INACTIVE').length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user-times fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>*/}

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    승인 대기
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.filter(teacher => teacher.state === 'PENDING').length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 강사 목록 테이블 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">강사 목록</h6>
        </div>

        <div className="card-body">
          {/* 검색 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">검색
                    <i className="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="강사 ID, 이름, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-right">
              <button
                className="btn btn-primary"
                onClick={fetchTeachers}
                disabled={loading}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                새로고침
              </button>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">강사 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 결과 정보 */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <small className="text-muted">
                    총 {teachers.length}명 중 {filteredData.length}명 표시
                  </small>
                </div>
              </div>

              {/* 테이블 */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('userId')}
                      >
                        강사 ID
                        {sortBy === 'userId' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                      </th>
                      <th 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        이름
                        {sortBy === 'name' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                      </th>
                      <th 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('email')}
                      >
                        이메일
                        {sortBy === 'email' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                      </th>
                      <th>전화번호</th>
                      <th>생년월일</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length > 0 ? (
                      sortedData.map((teacher, index) => (
                        <tr key={teacher.userId || index}>
                          <td className="font-weight-bold">{teacher.userId}</td>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.phone || '-'}</td>
                          <td>{teacher.birthday ? new Date(teacher.birthday).toLocaleDateString() : '-'}</td>
                          <td>
                            <span className={`badge ${
                              teacher.state === 'ACTIVE' ? 'badge-success' : 
                              teacher.state === 'PENDING' ? 'badge-warning' : 
                              'badge-secondary'
                            }`}>
                              {teacher.state === 'ACTIVE' ? '승인완료' : 
                               teacher.state === 'PENDING' ? '승인대기' : 
                               '비활성'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteTeacher(teacher.userId)}
                                title="삭제"
                              >삭제
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          {searchTerm ? '검색 결과가 없습니다.' : '등록된 강사가 없습니다.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;