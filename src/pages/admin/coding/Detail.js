import React, { useState, useEffect } from 'react';
import { useSearchParams,useParams  } from 'react-router-dom';

const CodingProblemDetail = () => {
  const [searchParams] = useSearchParams();
  const { problemId } = useParams();

  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DB에서 가져올 문제 데이터 구조
  const [problemData, setProblemData] = useState({
    code_id: '',
    title: '',
    qeustion: '', // DB 필드명 그대로 (오타 포함)
    type: '',
    level: 1,
    filed: '', // 분야
    language: '',
    test_case: '',
    model_answer: '',
    create_at: null,
    create_by: '',
    update_at: null,
    update_by: '',
    is_active: 1,
    // 추가 통계 정보
    correctRate: 0,
    submissions: 0
  });

  // 지원 언어 목록
  const languages = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'cpp', name: 'C++', extension: '.cpp' }
  ];
  
  // 임시 데이터
  const getTemporaryData = (id) => ({
      code_id: id || 1,
      title: '도시 이동경로 경우의 수',
      qeustion: `구름나라에는 N개의 도시가 있다. 각 도시는 1번부터 N번까지 번호를 가지고 있으며, 구름이는 1번 도시에서 N번 도시로 이동하려고 한다.

구름이는 이동의 규칙에 따라 도시 이동을 할 수 있다.

한번 갈 수 있는 거리는 i ≤ X ≤ N을 이동할 수

구름이에 도시 1번 도시에서 N번 도시로 이동할 수 있는 경우의 수를 구하는 프로그램을 작성한다.`,
      type: 'function',
      level: 1,
      filed: '알고리즘',
      language: 'Python',
      test_case: '[{"input": "5", "output": "8"}, {"input": "3", "output": "2"}]',
      model_answer: 'def solution(n):\n    return fibonacci(n)',
      create_at: '2025-01-15T10:30:00',
      create_by: '관리자',
      update_at: '2025-01-15T10:30:00',
      update_by: '관리자',
      is_active: 1,
      correctRate: 72.5,
      submissions: 100
  });


  // 언어별 기본 코드 템플릿
  const getDefaultCodeTemplate = (language, title) => {
    const templates = {
      javascript: `function solution(n) {
    // ${title}
    // 여기에 코드를 작성하세요
    
    return 0;
}`,
      python: `def solution(n):
    # ${title}
    # 여기에 코드를 작성하세요
    
    return 0`,
      java: `public class Solution {
    // ${title}
    // 여기에 코드를 작성하세요
    
    public static int solution(int n) {
        return 0;
    }
}`,
      cpp: `#include <iostream>
using namespace std;

// ${title}
// 여기에 코드를 작성하세요

int solution(int n) {
    return 0;
}`
    };
    
    return templates[language] || templates.javascript;
  };

const fetchProblemData = async () => {
    setLoading(true);
    setError(null);
    try{
      console.log('=== 문제 데이터 조회 시작 ===');
      console.log('problemId:', problemId);
      console.log('problemId 타입:', typeof problemId);

      // problemId 유효성 검사 개선
      const isValidProblemId = problemId && 
                              problemId !== 'undefined' && 
                              problemId !== 'null' && 
                              problemId.trim() !== '';
      if (!isValidProblemId) {
        console.log('⚠️ problemId가 유효하지 않음, 임시 데이터 사용');
        const tempData = getTemporaryData(problemId);
        setProblemData(tempData);
        setCode(getDefaultCodeTemplate(selectedLanguage, tempData.title));
        return;
      }
      // 실제 API 호출
      const url = `http://localhost:8080/api/admin/detail/${problemId}`;
      console.log('🌐 API 호출 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      console.log('📡 응답 상태:', response.status);
      console.log('📡 응답 OK:', response.ok);
       if (response.ok) {
        const responseData = await response.json();
        console.log('✅ 받은 응답 데이터:', responseData);
        if (responseData.success && responseData.data) {
          const data = responseData.data;
          console.log('✅ 문제 데이터 추출:', data);
          if (data && (data.title || data.code_id)) {
            console.log('✅ 유효한 데이터 수신, 상태 업데이트');
            setProblemData(prevData => ({
              ...prevData,
              ...data,
              // 기본값 설정
              correctRate: data.correctRate || 0,
              submissions: data.submissions || 0
            }));

            // 언어 설정 및 코드 템플릿 설정
            const dataLanguage = data.language ? data.language.toLowerCase() : null;
            const langMap = {
              'python': 'python',
              'javascript': 'javascript', 
              'java': 'java',
              'c++': 'cpp',
              'cpp': 'cpp'
            };
            let targetLanguage = selectedLanguage;
            if (dataLanguage && langMap[dataLanguage]) {
              targetLanguage = langMap[dataLanguage];
              setSelectedLanguage(targetLanguage);
            }
            setCode(getDefaultCodeTemplate(targetLanguage, data.title || '문제'));
          }else{
                // HTTP 에러 응답 처리
                const errorText = await response.text();
                console.log('❌ API 응답 에러:', response.status, errorText);
                
                if (response.status === 404) {
                  setError(`문제를 찾을 수 없습니다. (ID: ${problemId})`);
                } else if (response.status === 500) {
                  setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                } else {
                  setError(`서버 오류 (${response.status}): ${errorText}`);
                }
                
                // 에러 시에도 기본 데이터는 설정 (UI가 깨지지 않도록)
                const tempData = getTemporaryData(problemId);
                setProblemData(prevData => ({ ...prevData, ...tempData }));
                setCode(getDefaultCodeTemplate(selectedLanguage, tempData.title));
          }
        }
      }
    }catch(err){
      console.error('❌ 문제 데이터 조회 오류:', err);
    }finally{
      console.log('✅ 로딩 완료');
      setLoading(false);
    }
  };

  // 테스트 케이스 파싱
  const parseTestCases = (testCaseString) => {
    if (!testCaseString) return [];
    
    try {
      // JSON 형태의 테스트 케이스 파싱
      const parsed = JSON.parse(testCaseString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('테스트 케이스 파싱 오류:', error);
      return [];
    }
  };

  useEffect(() => {
    console.log('=== useEffect 실행 ===');
    fetchProblemData();
  }, [problemId]);

const executeCode = (code, language, input) => {
  try {
    switch (language) {
      case 'javascript':
        return executeJavaScript(code, input);
      case 'python':
        return executePython(code, input);
      case 'java':
        return executeJava(code, input);
      case 'cpp':
        return executeCpp(code, input);
      default:
        throw new Error(`${language}는 현재 지원되지 않는 언어입니다.`);
    }
  } catch (error) {
    throw new Error(`실행 오류: ${error.message}`);
  }
};

const executeJava = (code, input) => {
  try {
    console.log('Java 코드 실행 시뮬레이션:', { code, input });
    
    // Java 코드에서 solution 메서드를 찾아서 실행하는 로직
    if (code.includes('public static') && code.includes('solution')) {
      
      // 간단한 패턴 매칭으로 return 값 추출
      const returnMatch = code.match(/return\s+([^;]+);/);
      if (returnMatch) {
        const returnValue = returnMatch[1].trim();
        
        // 문자열 리터럴인 경우 따옴표 제거
        if (returnValue.startsWith('"') && returnValue.endsWith('"')) {
          return returnValue.slice(1, -1);
        }
        
        // 숫자인 경우
        if (!isNaN(returnValue)) {
          return parseInt(returnValue) || parseFloat(returnValue);
        }
        
        // 변수나 복잡한 표현식인 경우 입력값 반환 (임시)
        return input;
      }
    }
    
    throw new Error('solution 메서드를 찾을 수 없습니다.');
  } catch (error) {
    throw new Error(`Java 실행 오류: ${error.message}`);
  }
};

// C++ 코드 실행 (시뮬레이션)
const executeCpp = (code, input) => {
  try {
    console.log('C++ 코드 실행 시뮬레이션:', { code, input });
    
    if (code.includes('int solution') && code.includes('return')) {
      // 간단한 패턴 매칭으로 return 값 추출
      const returnMatch = code.match(/return\s+([^;]+);/);
      if (returnMatch) {
        const returnValue = returnMatch[1].trim();
        
        // 숫자인 경우
        if (!isNaN(returnValue)) {
          return parseInt(returnValue) || parseFloat(returnValue);
        }
        
        // 변수나 복잡한 표현식인 경우 입력값 반환 (임시)
        return input;
      }
    }
    
    throw new Error('solution 함수를 찾을 수 없습니다.');
  } catch (error) {
    throw new Error(`C++ 실행 오류: ${error.message}`);
  }
};

// 개선된 값 비교 함수 (문자열과 숫자 혼합 처리)
const deepEqual = (a, b) => {
  // 둘 다 null/undefined인 경우
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  
  // 정확히 같은 경우
  if (a === b) return true;
  
  // 문자열-숫자 변환 비교
  if (typeof a === 'string' && typeof b === 'number') {
    return !isNaN(a) && parseFloat(a) === b;
  }
  if (typeof a === 'number' && typeof b === 'string') {
    return !isNaN(b) && a === parseFloat(b);
  }
  
  // 둘 다 문자열이고 숫자로 변환 가능한 경우
  if (typeof a === 'string' && typeof b === 'string') {
    if (!isNaN(a) && !isNaN(b)) {
      return parseFloat(a) === parseFloat(b);
    }
    return a === b;
  }
  
  // 타입이 다른 경우
  if (typeof a !== typeof b) return false;
  
  // 객체/배열 비교
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]));
  }
  
  return false;
};

// JavaScript 코드 실행
const executeJavaScript = (code, input) => {
  try {
    // 안전한 실행을 위한 Function 생성
    const wrappedCode = `
      ${code}
      
      // solution 함수가 있는지 확인
      if (typeof solution === 'function') {
        return solution(${JSON.stringify(input)});
      } else {
        throw new Error('solution 함수를 찾을 수 없습니다.');
      }
    `;
    
    const func = new Function(wrappedCode);
    const result = func();
    return result;
  } catch (error) {
    throw new Error(`JavaScript 실행 오류: ${error.message}`);
  }
};

// 개선된 Python 코드 실행 (시뮬레이션)
const executePython = (code, input) => {
  try {
    console.log('Python 코드 실행 시뮬레이션:', { code, input });
    
    // solution 함수가 있는지 확인
    if (!code.includes('def solution')) {
      throw new Error('solution 함수를 찾을 수 없습니다.');
    }
    
    // 함수 정의에서 매개변수 추출
    const functionMatch = code.match(/def\s+solution\s*\([^)]*\):/);
    if (!functionMatch) {
      throw new Error('solution 함수 정의가 올바르지 않습니다.');
    }
    
    const functionDef = functionMatch[0];
    console.log('함수 정의:', functionDef);
    
    // 매개변수 개수 확인
    const paramMatch = functionDef.match(/\(([^)]*)\)/);
    if (!paramMatch) {
      throw new Error('함수 매개변수를 파싱할 수 없습니다.');
    }
    
    const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
    console.log('매개변수들:', params);
    
    // 입력값 처리
    let processedInput;
    if (Array.isArray(input)) {
      processedInput = input;
    } else if (typeof input === 'string') {
      try {
        // JSON 배열인지 확인
        processedInput = JSON.parse(input);
      } catch {
        // JSON이 아니면 단일 값으로 처리
        processedInput = input;
      }
    } else {
      processedInput = input;
    }
    
    console.log('처리된 입력:', processedInput);
    
    // 함수 본문에서 return 문 찾기
    const lines = code.split('\n');
    let returnValue = null;
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('return ')) {
        const returnExpression = trimmedLine.substring(7).replace(/\s*#.*$/, ''); // 주석 제거
        console.log('return 표현식:', returnExpression);
        
        // 간단한 표현식 계산
        try {
          returnValue = evaluatePythonExpression(returnExpression, params, processedInput);
          break;
        } catch (error) {
          console.error('표현식 계산 오류:', error);
          throw new Error(`return 문 계산 오류: ${error.message}`);
        }
      }
    }
    
    if (returnValue === null) {
      throw new Error('return 문을 찾을 수 없습니다.');
    }
    
    console.log('계산된 결과:', returnValue);
    return returnValue;
    
  } catch (error) {
    throw new Error(`Python 실행 오류: ${error.message}`);
  }
};

// Python 표현식 계산 (간단한 시뮬레이션)
const evaluatePythonExpression = (expression, params, input) => {
  console.log('표현식 계산:', { expression, params, input });
  
  // 매개변수를 실제 값으로 치환
  let evaluatedExpression = expression;
  
  if (params.length === 1) {
    // 단일 매개변수인 경우
    const paramName = params[0];
    if (Array.isArray(input)) {
      // 배열 요소 접근 시뮬레이션
      evaluatedExpression = evaluatedExpression.replace(
        new RegExp(`${paramName}\\[0\\]`, 'g'), 
        input[0] || 0
      );
      evaluatedExpression = evaluatedExpression.replace(
        new RegExp(`${paramName}\\[1\\]`, 'g'), 
        input[1] || 0
      );
      // 전체 배열 참조
      if (evaluatedExpression.includes(paramName) && !evaluatedExpression.includes('[')) {
        evaluatedExpression = evaluatedExpression.replace(
          new RegExp(`\\b${paramName}\\b`, 'g'), 
          JSON.stringify(input)
        );
      }
    } else {
      // 단일 값 치환
      evaluatedExpression = evaluatedExpression.replace(
        new RegExp(`\\b${paramName}\\b`, 'g'), 
        input
      );
    }
  } else if (params.length === 2 && Array.isArray(input) && input.length >= 2) {
    // 두 개 매개변수인 경우
    evaluatedExpression = evaluatedExpression.replace(
      new RegExp(`\\b${params[0]}\\b`, 'g'), 
      input[0]
    );
    evaluatedExpression = evaluatedExpression.replace(
      new RegExp(`\\b${params[1]}\\b`, 'g'), 
      input[1]
    );
  }
  
  console.log('치환된 표현식:', evaluatedExpression);
  
  // 간단한 산술 표현식 계산
  try {
    // 안전한 계산을 위해 eval 대신 간단한 파싱
    const sanitized = evaluatedExpression.replace(/[^0-9+\-*/().\s]/g, '');
    if (sanitized !== evaluatedExpression) {
      // 복잡한 표현식인 경우 기본값 반환
      if (Array.isArray(input) && input.length >= 2) {
        return input[0] + input[1]; // 덧셈 가정
      }
      return input;
    }
    
    // eval을 안전하게 사용 (숫자와 연산자만 포함된 경우)
    const result = eval(sanitized);
    return result;
  } catch (error) {
    console.error('표현식 계산 실패:', error);
    // 기본적인 덧셈 시도
    if (Array.isArray(input) && input.length >= 2) {
      return input[0] + input[1];
    }
    return input;
  }
};

// 숫자 비교 (부동소수점 오차 고려)
const isNumberEqual = (a, b, epsilon = 1e-9) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < epsilon;
  }
  return a === b;
};

// 수정된 handleRunCode 함수
const handleRunCode = async () => {
  setIsRunning(true);
  setOutput('코드를 실행중입니다...');
  
  try {
    const testCases = parseTestCases(problemData.test_case);
    
    if (testCases.length === 0) {
      setOutput("실행할 테스트 케이스가 없습니다.");
      setIsRunning(false);
      return;
    }

    let results = [];
    let allPassed = true;
    let totalTests = testCases.length;
    let passedTests = 0;

    // 각 테스트 케이스 실행
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      let testResult = {
        index: i + 1,
        input: testCase.input,
        expected: testCase.output,
        actual: null,
        passed: false,
        error: null,
        executionTime: 0
      };

      try {
        const startTime = performance.now();
        
        // 실제 코드 실행
        const actualOutput = executeCode(code, selectedLanguage, testCase.input);
        
        const endTime = performance.now();
        testResult.executionTime = Math.round(endTime - startTime);
        testResult.actual = actualOutput;

        // 결과 비교
        if (typeof actualOutput === 'number' && typeof testCase.output === 'number') {
          testResult.passed = isNumberEqual(actualOutput, testCase.output);
        } else {
          testResult.passed = deepEqual(actualOutput, testCase.output);
        }

        if (testResult.passed) {
          passedTests++;
        } else {
          allPassed = false;
        }

      } catch (error) {
        testResult.error = error.message;
        testResult.passed = false;
        allPassed = false;
      }

      results.push(testResult);
    }

    // 결과 출력 생성
    let output = '';
    
    // 전체 결과 요약
    output += `실행 완료: ${passedTests}/${totalTests} 테스트 케이스 통과\n`;
    output += `결과: ${allPassed ? '✅ 성공' : '❌ 실패'}\n`;
    output += '─'.repeat(50) + '\n\n';

    // 각 테스트 케이스 결과
    results.forEach((result) => {
      output += `테스트 케이스 ${result.index}: ${result.passed ? '✅ 통과' : '❌ 실패'}\n`;
      output += `입력: ${JSON.stringify(result.input)}\n`;
      output += `예상 출력: ${JSON.stringify(result.expected)}\n`;
      
      if (result.error) {
        output += `오류: ${result.error}\n`;
      } else {
        output += `실제 출력: ${JSON.stringify(result.actual)}\n`;
        output += `실행 시간: ${result.executionTime}ms\n`;
        
        if (!result.passed && !result.error) {
          output += `💡 힌트: 예상 출력과 실제 출력이 다릅니다.\n`;
        }
      }
      
      output += '\n';
    });

    // 전체 통과 시 축하 메시지
    if (allPassed) {
      output += '🎉 모든 테스트 케이스를 통과했습니다!\n';
      output += '이제 코드를 제출해보세요.';
    } else {
      output += '💪 일부 테스트 케이스가 실패했습니다.\n';
      output += '코드를 다시 확인해보세요.';
    }

    setOutput(output);

  } catch (error) {
    setOutput(`실행 오류: ${error.message}\n\n코드 문법을 확인해주세요.`);
  } finally {
    setIsRunning(false);
  }
};

  const handleSubmit = async () => {
    try {
      // 실제 제출 API 호출
      const response = await fetch(`http://localhost:8080/api/admin/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_id: problemData.code_id,
          language: selectedLanguage,
          source_code: code
        })
      });

      if (response.ok) {
        alert('코드가 성공적으로 제출되었습니다!');
      } else {
        throw new Error('제출에 실패했습니다.');
      }
    } catch (error) {
      alert(`제출 오류: ${error.message}`);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getDifficultyColor = (level) => {
    const colors = {
      1: { background: '#dcfce7', color: '#166534' },
      2: { background: '#fef3c7', color: '#92400e' },
      3: { background: '#fed7aa', color: '#c2410c' },
      4: { background: '#fecaca', color: '#dc2626' },
      5: { background: '#e9d5ff', color: '#7c3aed' }
    };
    return colors[level] || { background: '#f3f4f6', color: '#374151' };
  };

  const getDifficultyText = (level) => {
    const texts = ['', '초급', '중급', '고급', '전문가', '마스터'];
    return texts[level] || '미정';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return dateString;
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>문제를 불러오는 중...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>오류 발생</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const testCases = parseTestCases(problemData.test_case);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* 헤더 */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '16px 24px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={handleGoBack}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#4b5563',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← 코딩 문제
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 73px)' }}>
        {/* 왼쪽 패널 - 문제 설명 */}
        <div style={{ 
          width: '50%', 
          background: 'white', 
          borderRight: '1px solid #e5e7eb', 
          overflowY: 'auto' 
        }}>
          <div style={{ padding: '24px' }}>
            {/* 문제 제목 및 정보 */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                {problemData.title}
              </h1>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  ...getDifficultyColor(problemData.level)
                }}>
                  {getDifficultyText(problemData.level)}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  출제: {problemData.create_by || '관리자'}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  분야: {problemData.filed}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  언어: {problemData.language}
                </span>
                {problemData.submissions > 0 && (
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                    정답률: {problemData.correctRate}%
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                문제 ID: {problemData.code_id} | 
                등록일: {formatDate(problemData.create_at)} |
                수정일: {formatDate(problemData.update_at)}
              </div>
            </div>

            {/* 문제 설명 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                문제
              </h2>
              <div style={{ 
                color: '#374151', 
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {problemData.qeustion || '문제 설명이 없습니다.'}
              </div>
            </div>

            {/* 입출력 예시 */}
            {testCases.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  입출력 예시
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {testCases.map((testCase, index) => (
                    <div key={index} style={{ 
                      background: '#f9fafb', 
                      borderRadius: '8px', 
                      padding: '16px' 
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px' 
                      }}>
                        <div>
                          <h4 style={{ 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                          }}>
                            입력
                          </h4>
                          <code style={{ 
                            background: 'white', 
                            padding: '8px 12px', 
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            {JSON.stringify(testCase.input)}
                          </code>
                        </div>
                        <div>
                          <h4 style={{ 
                            fontWeight: '500', 
                            color: '#374151', 
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                          }}>
                            출력
                          </h4>
                          <code style={{ 
                            background: 'white', 
                            padding: '8px 12px', 
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            display: 'block'
                          }}>
                            {JSON.stringify(testCase.output)}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 모범 답안 (참고용) */}
            {problemData.model_answer && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  힌트
                </h2>
                <div style={{ 
                  background: '#f3f4f6', 
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  whiteSpace: 'pre-wrap'
                }}>
                  {problemData.model_answer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 패널 - 코드 에디터 */}
        <div style={{ 
          width: '50%', 
          background: 'white', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {/* 에디터 헤더 */}
          <div style={{ 
            background: '#f3f4f6', 
            borderBottom: '1px solid #e5e7eb', 
            padding: '12px 16px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setCode(getDefaultCodeTemplate(e.target.value, problemData.title));
                  }}
                  style={{ 
                    padding: '6px 12px', 
                    background: 'white', 
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {languages.find(l => l.id === selectedLanguage)?.extension}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 16px', 
                    background: isRunning ? '#9ca3af' : '#059669', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ▶ {isRunning ? '실행중...' : '실행'}
                </button>
                <button
                  onClick={handleSubmit}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 16px', 
                    background: '#2563eb', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📤 제출
                </button>
              </div>
            </div>
          </div>

          {/* 코드 에디터 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                  paddingLeft: '60px',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  fontSize: '14px',
                  lineHeight: '1.5',
                  background: '#1f2937',
                  color: '#d1d5db',
                  resize: 'none',
                  outline: 'none',
                  border: 'none',
                  whiteSpace: 'pre'
                }}
                placeholder="여기에 코드를 작성하세요..."
              />
              
              {/* 줄 번호 */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '48px',
                background: '#374151',
                color: '#9ca3af',
                fontSize: '14px',
                padding: '16px 0',
                pointerEvents: 'none',
                textAlign: 'right',
                borderRight: '1px solid #4b5563'
              }}>
                {code.split('\n').map((_, index) => (
                  <div key={index} style={{ 
                    height: '21px', 
                    paddingRight: '8px',
                    boxSizing: 'border-box'
                  }}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* 출력 패널 */}
            <div style={{ 
              height: '192px', 
              borderTop: '1px solid #e5e7eb', 
              background: '#000000', 
              color: '#10b981', 
              padding: '16px',
              overflowY: 'auto'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {output || '코드를 실행하면 결과가 여기에 표시됩니다.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProblemDetail;
