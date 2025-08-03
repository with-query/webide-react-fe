import { useTranslation, Trans } from 'react-i18next';
import '@/styles/deleteProjectModal.css';

const DeleteProjectModal = ({ isOpen, onClose, onConfirm, project }) => {
  const { t } = useTranslation();

  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay">
      <div className="modal delete-modal">
        <p className="delete-message">
          <Trans
            i18nKey="confirm_delete_project_message"
            values={{ projectName: project.name }}
            components={[<strong></strong>, <br />]}
          />
        </p>

        <div className="delete-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>{t('Cancel')}</button>
          <button className="next-btn" onClick={onConfirm}>{t('Next')}</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;