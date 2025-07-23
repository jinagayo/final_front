import React from "react";

const KakaoLogin = () => {
    const KAKAO_CLIENT_ID = "d3274d532da930a23835ed9d1443e15b";
    const REDIRECT_URI = "http://localhost:3000/kakao/callback";
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const handleKakaoLogin = () => {
        console.log('🟡 카카오 로그인 시작...');
        console.log('Client ID:', KAKAO_CLIENT_ID);
        console.log('Redirect URI:', REDIRECT_URI);
        console.log('Auth URL:', KAKAO_AUTH_URL);

        // 카카오 로그인 페이지로 이동
        window.location.href = KAKAO_AUTH_URL;
    };

    return { handleKakaoLogin };
};

export default KakaoLogin;