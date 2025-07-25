import React, { useState } from 'react';

const CodingProblemSubmit = () => {
 const [formData, setFormData] = useState({
   title: '',
   qeustion: '',              // content → qeustion으로 변경
   level: 1,                  // difficulty → level로 변경
   language: 'java',
   filed: 'algorithm',        // problemType → filed로 변경
   model_answer: '',          // modelAnswer → model_answer로 변경
   test_case: [               // testCases → test_case로 변경
     { input: '', expectedOutput: '', description: '' }
   ]
 });

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: name === 'level' ? parseInt(value) : value  // level은 숫자로 변환
   }));
 };

 const handleTestCaseChange = (index, field, value) => {
   const newTestCases = [...formData.test_case];
   newTestCases[index][field] = value;
   setFormData(prev => ({
     ...prev,
     test_case: newTestCases
   }));
 };

 const addTestCase = () => {
   setFormData(prev => ({
     ...prev,
     test_case: [...prev.test_case, { input: '', expectedOutput: '', description: '' }]
   }));
 };

 const removeTestCase = (index) => {
   if (formData.test_case.length > 1) {
     const newTestCases = formData.test_case.filter((_, i) => i !== index);
     setFormData(prev => ({
       ...prev,
       test_case: newTestCases
     }));
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   // 입력값 검증
   if (!formData.qeustion || !formData.qeustion.trim()) {
     alert('문제 내용을 입력해주세요.');
     return;
   }
   
   if (!formData.model_answer || !formData.model_answer.trim()) {
     alert('모범답안을 입력해주세요.');
     return;
   }

   // 테스트 케이스 검증
   if (!formData.test_case || !Array.isArray(formData.test_case) || formData.test_case.length === 0) {
     alert('테스트 케이스가 올바르지 않습니다.');
     return;
   }
   
   const hasValidTestCase = formData.test_case.some(tc => 
     tc && tc.input && tc.input.trim() && tc.expectedOutput && tc.expectedOutput.trim()
   );
   
   if (!hasValidTestCase) {
     alert('최소 하나의 테스트 케이스는 입력과 예상 출력이 모두 있어야 합니다.');
     return;
   }

   // 서버로 보낼 데이터 준비 (test_case를 JSON 문자열로 변환)
   const dataToSend = {
     ...formData,  // formData의 모든 필드를 복사
     test_case: JSON.stringify(formData.test_case) // test_case만 문자열로 변환
   };
   
   console.log('변환된 dataToSend:', dataToSend);

   try {
     // 서버로 데이터 전송
     const response = await fetch('http://localhost:8080/api/admin/problem-upload', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(dataToSend)
     });

     if (response.ok) {
       const result = await response.json();
       if (result.success) {
         alert(result.message || '문제가 성공적으로 등록되었습니다.');
         // 폼 초기화
         setFormData({
           title: '',
           qeustion: '',
           level: 1,
           language: 'java',
           filed: 'algorithm',
           model_answer: '',
           test_case: [
             { input: '', expectedOutput: '', description: '' }
           ]
         });
       } else {
         alert(result.message || '문제 등록에 실패했습니다.');
       }
     } else {
       const errorResult = await response.json();
       alert(errorResult.message || '문제 등록에 실패했습니다.');
     }
   } catch (error) {
     console.error('문제 등록 오류:', error);
     alert('문제 등록 중 오류가 발생했습니다.');
   }
 };

 const getDifficultyBadge = (level) => {
   const badges = {
     1: { text: '초급', color: '#28a745' },      // 숫자 키로 변경
     2: { text: '중급', color: '#ffc107' },      // 숫자 키로 변경
     3: { text: '고급', color: '#dc3545' }       // 숫자 키로 변경
   };
   return badges[level] || { text: '미설정', color: '#6c757d' }; // 기본값 추가
 };

 return (
   <div className="container-fluid">
     <div className="row">
       <div className="col-12">
         <div className="card shadow mb-4">
           <div className="card-header py-3">
             <h6 className="m-0 font-weight-bold text-primary">코딩 문제 출제</h6>
           </div>
           <div className="card-body">
             <div>
              {/* 제목 입력 */}
                <div className="form-group mb-4">
                  <label htmlFor="title" className="form-label font-weight-bold">
                    제목 :
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="문제 제목을 입력하세요"
                    style={{ 
                      border: '1px solid #d1d3e2',
                      borderRadius: '0.35rem',
                      padding: '0.75rem'
                    }}
                  />
                </div>
               {/* 문제 설정 (난이도, 언어, 유형) */}
               <div className="row mb-4">
                 <div className="col-md-4">
                   <label htmlFor="level" className="form-label font-weight-bold">
                     난이도 :
                   </label>
                   <select
                     id="level"
                     name="level"
                     className="form-control"
                     value={formData.level}
                     onChange={handleChange}
                     style={{ 
                       border: '1px solid #d1d3e2',
                       borderRadius: '0.35rem',
                       padding: '0.75rem',
                       fontSize: '16px',        // 글자 크기 명시
                       lineHeight: '1.5',       // 줄 간격 확보
                       height: 'auto',          // 또는 직접 높이 지정 (ex. 48px)
                       appearance: 'none',      // 브라우저 기본 스타일 제거 (옵션)
                     }}
                   >
                     <option value={1}>1단계 - 초급</option>
                     <option value={2}>2단계 - 중급</option>
                     <option value={3}>3단계 - 고급</option>
                   </select>
                   <div className="mt-2">
                     <span 
                       className="badge"
                       style={{ 
                         backgroundColor: getDifficultyBadge(formData.level).color,
                         color: 'white',
                         padding: '5px 10px'
                       }}
                     >
                       {getDifficultyBadge(formData.level).text}
                     </span>
                   </div>
                 </div>

                 <div className="col-md-4">
                   <label htmlFor="language" className="form-label font-weight-bold">
                     언어 :
                   </label>
                   <select
                     id="language"
                     name="language"
                     className="form-control"
                     value={formData.language}
                     onChange={handleChange}
                     style={{ 
                       border: '1px solid #d1d3e2',
                       borderRadius: '0.35rem',
                       padding: '0.75rem',
                       fontSize: '16px',        // 글자 크기 명시
                       lineHeight: '1.5',       // 줄 간격 확보
                       height: 'auto',          // 또는 직접 높이 지정 (ex. 48px)
                       appearance: 'none',      // 브라우저 기본 스타일 제거 (옵션)
                     }}
                   >
                     <option value="java">Java</option>
                     <option value="python">Python</option>
                     <option value="javascript">JavaScript</option>
                     <option value="cpp">C++</option>
                     <option value="c">C</option>
                   </select>
                 </div>

                 <div className="col-md-4">
                   <label htmlFor="filed" className="form-label font-weight-bold">
                     문제 유형 :
                   </label>
                   <select
                     id="filed"
                     name="filed"
                     className="form-control"
                     value={formData.filed}
                     onChange={handleChange}
                     style={{ 
                       border: '1px solid #d1d3e2',
                       borderRadius: '0.35rem',
                       padding: '0.75rem',
                       fontSize: '16px',        // 글자 크기 명시
                       lineHeight: '1.5',       // 줄 간격 확보
                       height: 'auto',          // 또는 직접 높이 지정 (ex. 48px)
                       appearance: 'none',      // 브라우저 기본 스타일 제거 (옵션)
                     }}
                   >
                     <option value="algorithm">알고리즘</option>
                     <option value="string">문자열</option>
                     <option value="array">배열</option>
                     <option value="datastructure">자료구조</option>
                     <option value="graph">그래프</option>
                     <option value="dp">동적계획법</option>
                     <option value="greedy">그리디</option>
                     <option value="simulation">시뮬레이션</option>
                   </select>
                 </div>
               </div>

               {/* 내용 입력 */}
               <div className="form-group mb-4">
                 <label htmlFor="qeustion" className="form-label font-weight-bold">
                   문제 설명 :
                 </label>
                 <textarea
                   id="qeustion"
                   name="qeustion"
                   className="form-control"
                   rows="10"
                   value={formData.qeustion}
                   onChange={handleChange}
                   placeholder="문제 내용을 입력하세요&#10;&#10;예시:&#10;주어진 배열에서 두 수의 합이 target과 같은 인덱스를 반환하는 문제입니다.&#10;&#10;입력:&#10;- nums: 정수 배열&#10;- target: 목표값&#10;&#10;출력:&#10;- 두 수의 인덱스를 담은 배열"
                   style={{ 
                     border: '1px solid #d1d3e2',
                     borderRadius: '0.35rem',
                     padding: '0.75rem',
                     resize: 'vertical'
                   }}
                 />
               </div>

               {/* 테스트 케이스 */}
               <div className="form-group mb-4">
                 <div className="d-flex justify-content-between align-items-center mb-3">
                   <label className="form-label font-weight-bold mb-0">
                     테스트 케이스 :
                   </label>
                   <button
                     type="button"
                     onClick={addTestCase}
                     className="btn btn-sm btn-outline-primary"
                     style={{ borderRadius: '0.35rem' }}
                   >
                     <i className="fas fa-plus mr-1"></i>
                     테스트 케이스 추가
                   </button>
                 </div>

                 {formData.test_case.map((testCase, index) => (
                   <div key={index} className="card mb-3" style={{ border: '1px solid #e3e6f0' }}>
                     <div className="card-header py-2" style={{ backgroundColor: '#f8f9fc' }}>
                       <div className="d-flex justify-content-between align-items-center">
                         <span className="font-weight-bold">테스트 케이스 {index + 1}</span>
                         {formData.test_case.length > 1 && (
                           <button
                             type="button"
                             onClick={() => removeTestCase(index)}
                             className="btn btn-sm btn-outline-danger"
                             style={{ borderRadius: '0.35rem' }}
                           >
                             <i className="fas fa-trash"></i>
                           </button>
                         )}
                       </div>
                     </div>
                     <div className="card-body">
                       <div className="row">
                         <div className="col-md-6">
                           <label className="form-label font-weight-bold">입력값:</label>
                           <textarea
                             className="form-control"
                             rows="3"
                             value={testCase.input}
                             onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                             placeholder="입력값을 입력하세요&#10;예: [2, 7, 11, 15]&#10;9"
                             style={{ 
                               border: '1px solid #d1d3e2',
                               borderRadius: '0.35rem',
                               padding: '0.5rem',
                               fontFamily: 'monospace'
                             }}
                           />
                         </div>
                         <div className="col-md-6">
                           <label className="form-label font-weight-bold">예상 출력:</label>
                           <textarea
                             className="form-control"
                             rows="3"
                             value={testCase.expectedOutput}
                             onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                             placeholder="예상 출력을 입력하세요&#10;예: [0, 1]"
                             style={{ 
                               border: '1px solid #d1d3e2',
                               borderRadius: '0.35rem',
                               padding: '0.5rem',
                               fontFamily: 'monospace'
                             }}
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* 모범답안 입력 */}
               <div className="form-group mb-4">
                 <label htmlFor="model_answer" className="form-label font-weight-bold">
                   모범답안:
                 </label>
                 <div className="code-editor-container" style={{ border: '1px solid #d1d3e2', borderRadius: '0.35rem' }}>
                   <div className="code-editor-header" style={{
                     backgroundColor: '#f8f9fa',
                     padding: '8px 12px',
                     borderBottom: '1px solid #e9ecef',
                     fontSize: '12px',
                     color: '#6c757d'
                   }}>
                     <i className="fas fa-code mr-2"></i>
                     Code Editor ({formData.language})
                   </div>
                   <textarea
                     id="model_answer"
                     name="model_answer"
                     className="form-control"
                     rows="15"
                     value={formData.model_answer}
                     onChange={handleChange}
                     placeholder={`// 모범답안 코드를 입력하세요
public class Solution {
   public static void main(String[] args) {
       // 여기에 코드를 작성하세요
   }
}`}
                     style={{ 
                       border: 'none',
                       borderRadius: '0 0 0.35rem 0.35rem',
                       padding: '12px',
                       fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                       fontSize: '14px',
                       lineHeight: '1.5',
                       resize: 'vertical',
                       backgroundColor: '#1e1e1e',
                       color: '#d4d4d4',
                       minHeight: '300px'
                     }}
                     onKeyDown={(e) => {
                       // Tab 키 지원
                       if (e.key === 'Tab') {
                         e.preventDefault();
                         const start = e.target.selectionStart;
                         const end = e.target.selectionEnd;
                         const value = e.target.value;
                         
                         setFormData(prev => ({
                           ...prev,
                           model_answer: value.substring(0, start) + '    ' + value.substring(end)
                         }));
                         
                         // 커서 위치 조정
                         setTimeout(() => {
                           e.target.selectionStart = e.target.selectionEnd = start + 4;
                         }, 0);
                       }
                     }}
                   />
                   <div className="code-editor-footer" style={{
                     backgroundColor: '#f8f9fa',
                     padding: '4px 12px',
                     borderTop: '1px solid #e9ecef',
                     fontSize: '11px',
                     color: '#6c757d',
                     display: 'flex',
                     justifyContent: 'space-between'
                   }}>
                     <span>Lines: {formData.model_answer.split('\n').length}</span>
                     <span>Tab을 누르면 4칸 들여쓰기</span>
                   </div>
                 </div>
               </div>

               {/* 등록 버튼 */}
               <div className="text-right">
                 <button
                   type="button"
                   onClick={handleSubmit}
                   className="btn btn-primary px-4 py-2"
                   style={{
                     backgroundColor: '#4e73df',
                     borderColor: '#4e73df',
                     borderRadius: '0.35rem'
                   }}
                 >
                   등록
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default CodingProblemSubmit;