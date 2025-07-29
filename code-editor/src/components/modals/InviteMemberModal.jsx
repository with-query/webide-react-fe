import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockMembers } from '@/mock/mockData';
import UserProfileIcon from '@/components/icons/UserProfileIcon';
import '@/styles/inviteMemberModal.css'; 

const InviteMemberModal = ({ isOpen, onClose, project }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const currentMembers = mockMembers; 

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendInvite = () => {
    const emailsToValidate = email.trim();
    if (!email.trim()) {
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

    console.log(`'${project.name}' 프로젝트에 '${email}' 초대 전송`);
    onClose();
  };

  return (
    <div className="modal-overlay">
        <div className="modal invite-modal">
            <h2>{t('Invite Members')}</h2>

            <div className="member-section">
                <p>{t('Currently invited members')}</p>
                <div className="member-list">
                    {currentMembers.map(member => (
                        <div key={member.id} className="member-item">
                            <div key={member.id} className="member-avatar" title={member.name}>
                                <UserProfileIcon />
                            </div>
                            <p className="member-name">{member.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="invite-section">
            <p>{t('Invite')}</p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Please enter an email address.')}
            />
            </div>

            <div className="invite-modal-buttons">
                <button className="cancel-btn" onClick={onClose}>{t('Cancel')}</button>
                <button className="send-btn" onClick={handleSendInvite}>{t('Send')}</button>
            </div>
        </div>
    </div>
  );
};

export default InviteMemberModal;