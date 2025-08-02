
const BASE_URL = "http://20.196.89.99:8080";

/**
 * 받은 프로젝트 초대 목록을 조회합니다.
 * @param {string} token 사용자 인증 토큰
 * @returns {Promise<Array<Object>>} 초대 목록 배열
 */
export const getReceivedInvitations = async (token) => {
  const res = await fetch(`${BASE_URL}/api/projects/invitations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "받은 초대 목록을 불러올 수 없습니다.");
  }
  return res.json();
};

/**
 * 보낸 프로젝트 초대 목록을 조회합니다.
 * @param {string} token 사용자 인증 토큰
 * @returns {Promise<Array<Object>>} 초대 목록 배열
 */
export const getSentInvitations = async (token) => {
  const res = await fetch(`${BASE_URL}/api/projects/invitations/sent`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "보낸 초대 목록을 불러올 수 없습니다.");
  }
  return res.json();
};