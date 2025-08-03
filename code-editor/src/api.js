import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

// --- 1. 코드 실행용 API (Piston) ---
const pistonApi = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language, sourceCode) => {
  const response = await pistonApi.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  });
  return response.data;
};


// --- 2. 백엔드 서버용 API (프로젝트 파일 관리) ---
const backendApi = axios.create({
  baseURL: 'http://20.196.89.99:8080/api',
});

// API 요청 시 토큰을 헤더에 포함시키는 인터셉터
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 특정 프로젝트의 파일 트리 구조를 가져옵니다.
 * @param {string} projectId - 프로젝트 ID
 */
export const getProjectFiles = (projectId) => {
  return backendApi.get(`/projects/${projectId}/files`);
};

/**
 * 특정 프로젝트의 파일 트리 구조를 저장(생성/업데이트)합니다.
 * @param {string} projectId - 프로젝트 ID
 * @param {Array} fileTree - 저장할 파일 트리 데이터
 */
export const saveProjectFiles = (projectId, fileTree) => {
  // ✅ PUT 대신 POST 메소드를 사용하여 파일 목록 전체를 처리하도록 요청합니다.
  return backendApi.post(`/projects/${projectId}/files`, fileTree);
};
