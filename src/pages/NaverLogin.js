import React from "react";

const NaverLogin = () => {
    const NAVER_CLIENT_ID = "W24SNU9H24_ktuo8Bmmn";
    const REDIRECT_URI = "http://localhost:3000/oauth"; // callback url
    const STATE = "random_state_string";
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;

    const handleNaverLogin = () => {
        console.log('Redirect URL:', REDIRECT_URI);
        window.location.href = NAVER_AUTH_URL;
    };

    return { handleNaverLogin };
};

export default NaverLogin;