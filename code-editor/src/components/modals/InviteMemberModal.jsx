import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UserProfileIcon from '@/components/icons/UserProfileIcon'; // 경로 확인 필요
import '@/styles/inviteMemberModal.css'; // 경로 확인 필요

const InviteMemberModal = ({ isOpen, onClose, project, onInvitationSent }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [currentMembers, setCurrentMembers] = useState([]);
  const BASE_URL = "http://20.196.89.99:8080"; 

  // 프로젝트 멤버를 불러오는 함수 (인증 토큰 포함)
  const fetchProjectMembers = async (projectId) => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN_KEY');
      if (!token) {
        console.warn('인증 토큰이 없어 프로젝트 멤버를 가져올 수 없습니다.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/projects/${projectId}/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('API 인증 실패: 프로젝트 멤버 조회 권한이 없습니다. 다시 로그인 해주세요.');
        }
        throw new Error('Failed to fetch project members');
      }
      const data = await response.json();
      setCurrentMembers(data);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };

  // 모달이 열리거나 project ID가 변경될 때마다 멤버 목록 새로 고침
  useEffect(() => {
    if (isOpen && project?.id) {
      setEmail(''); 
      fetchProjectMembers(project.id);
    }
  }, [isOpen, project?.id]);

  if (!isOpen) return null; 

  // 초대 전송 처리 함수 (API 호출 로직 수정)
  const handleSendInvite = async () => {
    const emailsToValidate = email.trim();
    if (!emailsToValidate) {
      alert(t('Please enter an email address.'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allEmails = emailsToValidate.split(",").map(e => e.trim()).filter(e => e);
    const invalidEmail = allEmails.find(e => !emailRegex.test(e));
    if (invalidEmail) {
      alert(t('"{{email}}" is not a valid email format.', { email: invalidEmail }));
      return;
    }

    console.log(`'${project.name}' 프로젝트에 '${email}' 초대 전송 시도`);

    try {
      const token = localStorage.getItem('ACCESS_TOKEN_KEY');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/projects/${project.id}/members/invite`, { // 변경된 엔드포인트 적용
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
        
          email: email, 
          role: "MEMBER"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("서버에서 받은 오류 데이터:", errorData);
        throw new Error(errorData.message || '초대 전송에 실패했습니다.');
      }

      alert('초대가 성공적으로 전송되었습니다!');
      setEmail(''); 
      fetchProjectMembers(project.id); 
      onClose();

      if (onInvitationSent) {
        onInvitationSent(); 
      }

    } catch (error) {
      console.error('초대 전송 오류:', error);
      alert(`초대 전송 중 오류가 발생했습니다: ${error.message}`);
    }
  };
  console.log(currentMembers);


  return(
  <div className="modal-overlay">
      <div className="modal invite-modal">
        <h2>{t('Invite Members')}</h2>

        {/* 현재 초대된 멤버 섹션 */}
        <div className="member-section">
          <p>{t('Currently invited members')}</p>
          <div className="member-list">
            {currentMembers.length > 0 ? (
              currentMembers.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar"  title={member.userName}>
                    <UserProfileIcon />
                  </div>
                  <p className="member-name" >{member.userName}</p>
                </div>
              ))
            ) : (
              <p>{t('No members currently.')}</p>
            )}
          </div>
        </div>

        {/* 멤버 초대 입력 섹션 */}
        <div className="invite-section">
          <p>{t('Invite')}</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('Please enter an email address.')}
          />
        </div>

        {/* 버튼 섹션 */}
        <div className="invite-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>{t('Cancel')}</button>
          <button className="send-btn" onClick={handleSendInvite}>{t('Send')}</button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;