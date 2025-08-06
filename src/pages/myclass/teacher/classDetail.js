import { AppleIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const TClassDetail = () => {
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  
  // 편집 모드 관련 상태
  const [editMode, setEditMode] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editedMaterials, setEditedMaterials] = useState([]);

  // URL에서 classId 추출 (실제 구현시 useParams 사용)
  const getClassIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class_id');
  };

  // 강의 정보 수정용 상태
  const [editClassModalOpen, setEditClassModalOpen] = useState(false);
  const [editClassForm, setEditClassForm] = useState({
    name: '',
    intro:'',
    detail:'',
    price:'',
    img:'',         //최종 업로드(or 기존url)
    imgFile:null,   //새 파일(선택시)
    imgPreview:'',  //미리보기
  });
  const [savingClass, setSavingClass] = useState(false);

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  //강의 데이터가 바뀔 때 수정 폼도 초기화
  useEffect(() => {
    if(classData){
      setEditClassForm({
        name : classData.name || '',
        intro: classData.intro || '',
        detail: classData.detail || '',
        price: classData.price || '',
        img: classData.img || '',
        imgFile:null,
        imgPreview: classData.img || '',
      });
    }
  },[classData]);

  useEffect(() => {
    fetchClassDetail();
    fetchMaterials();
    fetchReviews();
  }, []);

  useEffect(() => {
    setEditedMaterials([...materials]);
  }, [materials]);

  // 백엔드 데이터 가져오기
  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data); 
      } else {
        console.error('강의 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(classData)

   // 폼 값 변경 핸들러
  const handleEditClassFormChange = (e) => {
   const { name, value } = e.target;
    setEditClassForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClassImageChange = (e) => {
  const file = e.target.files[0];
  if(file){
    setEditClassForm(prev => ({
      ...prev,
      imgFile: file,
      imgPreview: URL.createObjectURL(file)   // 미리보기 생성
    }));
  }
};

const handleSaveClassInfo = async() => {
  if(!editClassForm.name.trim()){
    alert("강의명을 입력해주세요.");
    return;
  }
  setSavingClass(true);
  const classId = getClassIdFromUrl();

  let imgUrl = editClassForm.img; // 기본: 기존 이미지

  // 이미지 새로 선택했으면 업로드
  if(editClassForm.imgFile){
    // 1. 파일 S3나 서버에 업로드 (FormData 활용)
    const imgForm = new FormData();
    imgForm.append("file", editClassForm.imgFile);
    imgForm.append("folderName","course-images");

    try {
      // 실제 API URL로 교체!
      const uploadRes = await fetch("http://localhost:8080/course/teacher/upload-image", {
        method: "POST",
        body: imgForm,
        credentials: 'include'
      });
      if(uploadRes.ok){
        const data = await uploadRes.json();
        imgUrl = data.url; // 서버가 { url: "업로드된 url" } 반환한다고 가정
      } else {
        alert("이미지 업로드 실패");
        setSavingClass(false);
        return;
      }
    } catch(e){
      alert("이미지 업로드 오류: " + e);
      setSavingClass(false);
      return;
    }
  }

  // 2. 강의 정보 수정 요청
  try{
    const body = {
      ...editClassForm,
      img: imgUrl,     // 바뀐 이미지 url
      imgFile: undefined,  // 파일 필드는 제거
      imgPreview: undefined,
    };

    const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`,{
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    if(response.ok){
      alert("강의 정보가 수정되었습니다.");
      setEditClassModalOpen(false);
      fetchClassDetail();  //강의정보 다시 불러오기
    }else{
      alert("수정에 실패했습니다.");
    }
  }catch(e){
    alert("수정 중 오류 발생: " + e);
  }finally{
    setSavingClass(false);
  }
};

  const fetchMaterials = async () => {
    try {
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/materials`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      } else {
        console.error('강의 자료 가져오기 실패');
       
      }
    } catch (error) {
      console.error('강의 자료 가져오기 오류:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/reviews`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.error('리뷰 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('리뷰 정보 가져오기 오류:', error);
    }
  };

  // 편집 모드 토글
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedMaterials([]);
    if (!editMode) {
      setEditedMaterials([...materials]);
    }
  };

  // 체크박스 선택 처리
  const handleCheckboxChange = (meterId) => {
    console.log('체크박스 변경:', meterId); // 디버깅용
    console.log('현재 선택된 항목들:', selectedMaterials); // 디버깅용
    
    setSelectedMaterials(prev => {
      if (prev.includes(meterId)) {
        const newSelected = prev.filter(id => id !== meterId);
        console.log('제거 후:', newSelected); // 디버깅용
        return newSelected;
      } else {
        const newSelected = [...prev, meterId];
        console.log('추가 후:', newSelected); // 디버깅용
        return newSelected;
      }
    });
  };

  // 선택된 자료 삭제
  const handleDeleteSelected = async () => {
    if (selectedMaterials.length === 0) {
      alert('삭제할 자료를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedMaterials.length}개의 자료를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const deleteData = selectedMaterials.map(meterId => ({ meterId }));
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/materials/delete?classId=${classId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData)
      });

      if (response.ok) {
        alert('선택한 자료가 삭제되었습니다.');
        fetchMaterials();
        setSelectedMaterials([]);
        setEditMode(false);
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 순서 변경 저장
  const handleSaveOrder = async () => {
    try {
      const orderData = editedMaterials.map((material, index) => ({
        meterId: material.meterId,
        seq: index + 1,
        title: material.title,
        type: material.type
      }));

      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/materials/reorder?classId=${classId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('순서가 저장되었습니다.');
        fetchMaterials();
        setEditMode(false);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 드래그 시작
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 드롭 처리
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetIndex) {
      return;
    }

    const newMaterials = [...editedMaterials];
    const draggedElement = newMaterials[draggedItem];
    
    newMaterials.splice(draggedItem, 1);
    newMaterials.splice(targetIndex, 0, draggedElement);
    
    setEditedMaterials(newMaterials);
    setDraggedItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'MET001':
        return { icon: 'fas fa-play-circle', color: 'text-primary', label: '영상' };
      case 'MET002':
        return { icon: 'fas fa-clipboard-list', color: 'text-warning', label: '과제' };
      case 'MET003':
        return { icon: 'fas fa-file-alt', color: 'text-danger', label: '시험' };
      default:
        return { icon: 'fas fa-file', color: 'text-secondary', label: '자료' };
    }
  };

  const handleMaterialClick = (material) => {

    if(material.type=='MET002'){
    // 학생들이 제출한 것들이 나오는 페이지로 이동
    navigate(`/myclass/teacher/AssignmentList?meterial_id=${material.meterId}`);
    }else if(material.type=='MET001'){
      navigate(`/myclass/videoView/${material.meterId}`);
    }else if(material.type=='MET003'){
      navigate(`/myclass/teacher/testList?meterial_id=${material.meterId}`);
    }else {
      console.log('알 수 없는 자료 타입:', material.type);
        alert('지원하지 않는 자료 타입입니다.');
    }
  };

  const handleStudentListClick = () => {
    const classId = getClassIdFromUrl();
    navigate(`/myclass/teacher/class/${classId}/students`);
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">강의 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 개별 자료 삭제 함수
const handleDeleteMaterial = async (meterId) => {
  if (!window.confirm('정말 이 자료를 삭제하시겠습니까?')) return;
  try {
    const classId = getClassIdFromUrl();
    const deleteData = [{ meterId }];
    const response = await fetch(`http://localhost:8080/api/myclass/teacher/materials/delete?classId=${classId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deleteData)
    });

    if (response.ok) {
      alert('자료가 삭제되었습니다.');
      fetchMaterials();
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('삭제 오류:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

  return (
    <div className="container-fluid">
      <div className="mb-3 mt-3">
        <button 
          className="btn btn-outline-secondary btn-sm mr-2"
          onClick={() => navigate('/myclass/teacher/classList')}
        >
          <i className="fas fa-arrow-left mr-1"></i> 강의 목록으로 돌아가기
        </button>

        {/* 강의 정보 수정 버튼 */}
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={()=> setEditClassModalOpen(true)}
        >
          <i className="fas fa-edit mr-1"></i> 강의정보 수정
        </button>

        {/* 수정 모달 */}
        {editClassModalOpen && (
        <div className="modal show fade" style={{
          display: "block", 
          background: "rgba(0,0,0,0.15)", 
          zIndex: 1000,
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">강의 정보 수정</h5>
                <button type="button" className="close" onClick={() => setEditClassModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group mb-3">
                    <label>강의명</label>
                    <input type="text" className="form-control" name="name"
                      value={editClassForm.name}
                      onChange={handleEditClassFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>간단소개</label>
                    <input type="text" className="form-control" name="intro"
                      value={editClassForm.intro}
                      onChange={handleEditClassFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>상세설명</label>
                    <textarea className="form-control" name="detail"
                      value={editClassForm.detail}
                      onChange={handleEditClassFormChange} rows={5} />
                  </div>
                  <div className="form-group mb-3">
                    <label>수강료(원)</label>
                    <input type="number" className="form-control" name="price"
                      value={editClassForm.price}
                      onChange={handleEditClassFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>대표 이미지</label>
                    <input type="file" accept="image/*"
                      className="form-control"
                      onChange={handleEditClassImageChange}
                    />
                    {editClassForm.imgPreview && 
                      <div style={{marginTop:8}}>
                        <img src={editClassForm.imgPreview}
                        alt = "이미지 미리보기"
                        style={{width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 8, border: "1px solid #eee"}} />
                      </div>
                    }
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditClassModalOpen(false)}>
                  취소
                </button>
                <button className="btn btn-primary" onClick={handleSaveClassInfo} disabled={savingClass}>
                  {savingClass ? "저장중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              {classData?.img ? (
                <img 
                 src={classData.img}
                  alt="강의 이미지"
                style={{
                   width: '100%',
                   height: '250px',
                   borderRadius: '10px',
                   objectFit: 'cover',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
               }}
              />

              ) : (
                <div className="default-image-placeholder">
                  <div className="icon-container">
                    <div className="java-icon">☕</div>
                    <h3 className="java-text">java</h3>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-9">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="badge badge-outline-primary mb-2">{classData?.subject}</span>
                  <h2 className="h3 mb-2 text-gray-800">{classData?.name}</h2>
                  <p className="text-muted mb-3">{classData?.intro}</p>
                </div>
                <div className="class-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`${i < Math.floor(calculateAverageRating()) ? 'text-warning' : 'text-secondary'}`}>
                      &#9733;
                    </span>
                  ))}
                  <span className="ml-1 font-weight-bold">{calculateAverageRating()}</span>
                  <small className="text-muted ml-1">({reviews.length}개 리뷰)</small>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-user-tie text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>강사:</strong> {classData?.teacher}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-won-sign text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>수강료:</strong> {formatPrice(classData?.price)}원
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>개설일:</strong> {formatDate(classData?.createdAt)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-users text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>수강생:</strong> {classData?.studentCount}명
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4 justify-content-center">
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/video/${classId}`);
            }}
          >
            <i className="fas fa-video mr-2"></i>강의 업로드
          </button>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <button
            className="btn btn-warning btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/assignment?class_id=${classId}`);
            }}
          >
            <i className="fas fa-clipboard-list mr-2"></i>과제 업로드
          </button>
        </div>
        <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/test?class_id=${classId}`);
            }}
          >
            <i className="fas fa-file-alt mr-2"></i>테스트 업로드
          </button>
        </div>
        <div className="col-lg-2 col-md-6 col-sm-6 mb-2">
          <button 
            className="btn btn-info btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/board/list/${classData.classId}?boardNum=BOD002`);
            }}
          >
            <i className="fas fa-bullhorn mr-2"></i>공지사항
          </button>
        </div>
        <div className="col-lg-2 col-md-6 col-sm-6 mb-2">
          <button 
            className="btn btn-secondary btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/board/list/${classData.classId}?boardNum=BOD001`);
            }}
          >
            <i className="fas fa-question-circle mr-2"></i>Q&A
          </button>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <ul className="nav nav-tabs card-header-tabs mb-0">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('materials')}
                >
                  <i className="fas fa-folder-open mr-2"></i>강의 자료 ({materials.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <i className="fas fa-star mr-2"></i>강의 평가 ({reviews.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'detail' ? 'active' : ''}`}
                  onClick={() => setActiveTab('detail')}
                >
                  <i className="fas fa-info-circle mr-2"></i>강의 상세
                </button>
              </li>
            </ul>
            
            {activeTab === 'materials' && materials.length > 0 && (
              <button 
                className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={toggleEditMode}
              >
                <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'} mr-1`}></i>
                {editMode ? '취소' : '편집'}
              </button>
            )}
          </div>
        </div>
        
        {editMode && activeTab === 'materials' && (
          <div className="card-header border-top bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">
                  {selectedMaterials.length > 0 
                    ? `${selectedMaterials.length}개 선택됨` 
                    : '편집할 항목을 선택하거나 드래그하여 순서를 변경하세요'
                  }
                </span>
              </div>
              <div>
                <button 
                  className="btn btn-danger btn-sm mr-2"
                  onClick={handleDeleteSelected}
                  disabled={selectedMaterials.length === 0}
                >
                  <i className="fas fa-trash mr-1"></i>삭제
                </button>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleSaveOrder}
                >
                  <i className="fas fa-save mr-1"></i>저장
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="card-body">
          {activeTab === 'materials' && (
            <div className="materials-tab">
              {materials.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-folder-open fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">등록된 강의 자료가 없습니다.</p>
                </div>
              ) : (
                <div className="materials-list">
                  {(editMode ? editedMaterials : materials).map((material, index) => {
                    const iconInfo = getMaterialIcon(material.type);
                    const materialId = material.meterId || `material-${index}`;
                    
                    return (
                      <div 
                        key={materialId}
                        className={`material-item d-flex align-items-center p-3 mb-2 border rounded ${
                          editMode ? 'edit-mode' : ''
                        } ${
                          selectedMaterials.includes(materialId) ? 'selected' : ''
                        }`}
                        onClick={() => handleMaterialClick(material)}
                        style={{ cursor: editMode ? 'default' : 'pointer' }}
                        draggable={editMode}
                        onDragStart={(e) => editMode && handleDragStart(e, index)}
                        onDragOver={editMode ? handleDragOver : undefined}
                        onDrop={(e) => editMode && handleDrop(e, index)}
                      >
                        {editMode && (
                          <div className="mr-3 pl-3">
                            <input
                              type="checkbox"
                              className="form-check-input material-checkbox"
                              checked={selectedMaterials.includes(materialId)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleCheckboxChange(materialId);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        
                        <div className="material-number mr-3">
                          <span className="badge badge-light">{material.seq || index + 1}</span>
                        </div>
                        <div className="material-icon mr-3">
                          <i className={`${iconInfo.icon} fa-lg ${iconInfo.color}`}></i>
                        </div>
                        <div className="material-info flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{material.title || `강의 자료 ${material.seq || index + 1}`}</h6>
                              <small className="text-muted">
                                <span className="badge badge-outline-secondary mr-2">
                                  {iconInfo.label}
                                </span>
                                {material.detail && (
                                  <span className="text-muted">{material.detail}</span>
                                )}
                              </small>
                            </div>
                            <div className="material-actions">
                          
                              {editMode ? (
                                <div
                                className="drag-handle"
                                style={{
                                cursor: 'grab',
                                fontSize: '2rem',
                                color: '#495057',
                                marginLeft: '24px',
                                marginRight: '4px',
                                minWidth: '36px',  // 공간 확보
                                userSelect: 'none',
                                fontWeight: 'bold',
                                lineHeight: '1',
                                display: 'flex',
                               alignItems: 'center',
                              justifyContent: 'center'
                             }}
                             title="드래그해서 순서 변경"
                             >
                           {/* 아이콘 대신 문자 */}
                               ≡
                          </div>
                              ) : (
                                <>
                                  <span className="badge badge-info mr-2">제출현황 보기</span>
                                  <i className="fas fa-chevron-right text-gray-300"></i>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              {reviews.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-star fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
                </div>
              ) : (
                <div className="reviews-list">
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5 className="mb-3">평가 요약</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-warning">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.floor(calculateAverageRating()) ? 'text-warning' : 'text-secondary'}>
                                &#9733;
                              </span>
                            ))}
                          </span>
                          <span className="ml-2 font-weight-bold">{calculateAverageRating()}</span>
                          <span className="text-muted ml-1">/ 5.0</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">총 {reviews.length}개의 리뷰</small>
                      </div>
                    </div>
                  </div>

                  {reviews.map((review, index) => (
                    <div key={review.id || index} className="review-item border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="font-weight-bold mr-2">{review.studentName || '익명'}</span>
                            <div className="star-rating">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < (review.rating || 0) ? 'text-warning' : 'text-secondary'}>
                                  &#9733;
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{formatDate(review.createdAt)}</small>
                      </div>
                      <p className="mb-0 text-gray-700">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="detail-tab">
              {classData?.detail ? (
                <div>
                  <h5 className="mb-3">강의 상세 설명</h5>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {classData.detail}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-info-circle fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">등록된 상세 설명이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .class-main-img {
          max-height: 200px;
          width: 100%;
          object-fit: cover;
        }
        
        .default-image-placeholder {
          width: 100%;
          height: 200px;
          background-color: #fff5e6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        
        .icon-container {
          text-align: center;
        }
        
        .java-icon {
          width: 80px;
          height: 80px;
          background-color: #f39c12;
          border-radius: 10px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          font-weight: bold;
        }
        
        .java-text {
          color: #e67e22;
          font-weight: bold;
          font-size: 24px;
          margin: 0;
        }
        
        .class-rating {
          text-align: right;
        }
        
        .badge-outline-primary {
          background-color: transparent !important;
          border: 1px solid #007bff;
          color: #007bff;
        }
        
        .badge-outline-secondary {
          background-color: transparent !important;
          border: 1px solid #6c757d;
          color: #6c757d;
        }
        
        .material-item {
          transition: all 0.2s ease-in-out;
          background-color: #fff;
          user-select: none;
        }
        
        .material-item:not(.edit-mode):hover {
          background-color: #f8f9fc !important;
          border-color: #007bff !important;
          transform: translateX(5px);
        }
        
        .material-item.edit-mode {
          cursor: default !important;
        }
        
        .material-item.selected {
          background-color: #e3f2fd !important;
          border-color: #2196f3 !important;
        }
        
        .material-item.edit-mode:hover {
          transform: none;
          background-color: #f8f9fa !important;
        }
        
        .material-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .material-number .badge {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .material-icon {
          width: 40px;
          text-align: center;
        }
        
        .drag-handle {
          padding: 8px;
          color: #6c757d;
        }
        
        .drag-handle:hover {
          color: #495057;
        }
        
        .text-sm {
          font-size: 0.875rem;
        }
        
        .btn-block {
          display: block;
          width: 100%;
        }
        
        .materials-list, .reviews-list {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          background: transparent;
        }
        
        .nav-tabs .nav-link.active {
          color: #007bff;
          background: #fff;
          border-bottom: 2px solid #007bff;
        }
        
        .nav-tabs .nav-link:hover {
          border: none;
          color: #007bff;
        }
        
        .review-item:last-child {
          border-bottom: none !important;
        }
        
        .text-gray-300 {
          color: #d1d5db !important;
        }
        
        .text-gray-400 {
          color: #9ca3af !important;
        }
        
        .text-gray-500 {
          color: #6b7280 !important;
        }
        
        .text-gray-700 {
          color: #374151 !important;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .material-item[draggable="true"] {
          opacity: 1;
        }
        
        .material-item[draggable="true"]:hover .drag-handle {
          cursor: grab;
        }
        
        .material-item[draggable="true"]:active .drag-handle {
          cursor: grabbing;
        }
        
        .edit-mode-actions {
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        
        .edit-mode .material-actions {
          min-width: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .material-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #dee2e6;
          border-radius: 3px;
          background-color: #fff;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .material-checkbox:checked {
          background-color: #007bff;
          border-color: #007bff;
        }
        
        .material-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .material-checkbox:hover {
          border-color: #007bff;
        }
        
        .material-item.selected {
          animation: selectPulse 0.3s ease-in-out;
        }
        
        @keyframes selectPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        .material-item:dragging {
          opacity: 0.5;
          transform: rotate(2deg);
        }
        
        @media (max-width: 768px) {
          .material-item {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .material-info {
            width: 100%;
            margin-top: 10px;
          }
          
          .edit-mode-actions .d-flex {
            flex-direction: column;
            gap: 10px;
          }
          
          .edit-mode-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TClassDetail;