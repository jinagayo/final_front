import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const BannerUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // 관리자 권한 확인
  const isAdmin = () => user?.position === '3' || user?.position === 'admin';

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

  // 파일 선택 핸들러
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setMessage('이미지 파일만 선택할 수 있습니다.');
        return;
      }
      
      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        setMessage('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setSelectedFile(file);
      setMessage('');
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8080/api/admin/upload-banner', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage('배너 이미지가 성공적으로 업로드되었습니다!');
        // 업로드 후 페이지 새로고침하여 새 이미지 반영
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(data.message || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      setMessage('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 선택 취소
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="container-fluid px-4 py-5">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">배너 이미지 관리</h1>
      </div>

      <div className="row">
        {/* 현재 배너 이미지 */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">현재 배너 이미지</h6>
            </div>
            <div className="card-body">
              <img 
                src="/img/main.png" 
                alt="현재 배너" 
                className="img-fluid rounded"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">새 배너 이미지 업로드</h6>
            </div>
            <div className="card-body">
              {/* 파일 선택 */}
              <div className="mb-3">
                <label htmlFor="fileInput" className="form-label">이미지 파일 선택</label>
                <input
                  id="fileInput"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <small className="form-text text-muted">
                  JPG, PNG, GIF 형식의 이미지 파일 (최대 10MB)
                </small>
              </div>

              {/* 미리보기 */}
              {previewUrl && (
                <div className="mb-3">
                  <label className="form-label">미리보기</label>
                  <div>
                    <img 
                      src={previewUrl} 
                      alt="미리보기" 
                      className="img-fluid rounded"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              {/* 메시지 */}
              {message && (
                <div className={`alert ${message.includes('성공') ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              )}

              {/* 버튼들 */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload mr-2"></i>
                      업로드
                    </>
                  )}
                </button>
                
                {selectedFile && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={uploading}
                  >
                    <i className="fas fa-times mr-2"></i>
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 사항 */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-info">안내사항</h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>권장 이미지 크기: 1200px × 300px (비율 4:1)</li>
                <li>지원 형식: JPG, PNG, GIF</li>
                <li>최대 파일 크기: 10MB</li>
                <li>업로드 후 기존 이미지는 자동으로 백업됩니다.</li>
                <li>변경사항은 즉시 홈페이지에 반영됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerUpload;