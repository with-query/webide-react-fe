import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    kr: {
        translation: {
        "Query Builder": "쿼리 빌더",
        "Settings": "설정",
        "Dashboard": "대시보드",
        "IDE": "IDE",
        "Chat": "채팅",
        "Login": "로그인",
        "Logout": "로그아웃",
        "Sign Up": "회원가입",
        "My Page": "마이페이지",

        "Email or Username": "이메일 또는 아이디",
        "Name": "이름",
        "Password": "비밀번호",
        "Remember Me": "아이디 저장",
        "Forgot Password?": "비밀번호를 잊으셨나요?",
        "No account?": "계정이 없으신가요?",
        "Already have an account?": "이미 계정이 있으신가요?",
        "Register": "가입하기",
        "Find Password": "비밀번호 찾기",
        "Enter your email and we'll send a reset link.": "가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.",
        "Send Reset Link": "비밀번호 재설정 링크 받기",
        "Back to Login": "로그인으로 돌아가기",
        "Email": "이메일",
        "Confirm Password": "비밀번호 확인",

        "Sign up date" : "가입일",
        "Last access date" : "최근 접속일",
        "Account status" : "계정 상태",
        "Active" : "활성",
        "Department" : "부서",
        "Save" : "저장",
        "Number" : "전화번호",
        "Nickame" : "닉네임",
        "Information" : "기본 정보",

        "Select a file" : "파일을 선택하세요.",
        "Data" : "데이터",
        "Chart" : "차트",
        "Run" : "실행",
        "Share" : "공유",

        "Change Password": "비밀번호 변경",
        "Current Password": "현재 비밀번호",
        "New Password": "새 비밀번호",
        "Confirm New Password": "새 비밀번호 확인"


        },
    },
    en: {
        translation: {
        "Query Builder": "Query Builder",
        "Settings": "Settings",
        "Dashboard": "Dashboard",
        "IDE": "IDE",
        "Chat": "Chat",
        "Login": "Login",
        "Logout": "Logout",
        "Sign Up": "Sign Up",
        "My Page": "My Page",

        "Email or Username": "Email or Username",
        "Name": "Name",
        "Password": "Password",
        "Remember Me": "Remember Me",
        "Forgot Password?": "Forgot Password?",
        "No account?": "No account?",
        "Already have an account?": "Already have an account?",
        "Register": "Register",
        "Find Password": "Find Password",
        "Enter your email and we'll send a reset link.": "Enter your email and we'll send a reset link.",
        "Send Reset Link": "Send Reset Link",
        "Back to Login": "Back to Login",
        "Email": "Email",
        "Confirm Password": "Confirm Password",

        "Sign up date" : "Sign up date",
        "Last access date" : "Last access date",
        "Account status" : "Account status",
        "Active" : "Active",
        "Department" : "Department",
        "Save" : "Save",
        "Number" : "Number",
        "Nickame" : "Nickame",
        "Information" : "Information",

        "Select a file" : "Select a file",

        "Data" : "Data",
        "Chart" : "Chart",
        "Run" : "Run",
        "Share" : "Share",

        "Change Password": "Change Password",
        "Current Password": "Current Password",
        "New Password": "New Password",
        "Confirm New Password": "Confirm New Password"

        },
    },
};

// 기본 언어
i18n.use(initReactI18next).init({
    resources,
    lng: "kr", 
    fallbackLng: "kr",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
