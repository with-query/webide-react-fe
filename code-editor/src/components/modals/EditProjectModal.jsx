import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { mockDbConnections } from '@/mock/mockData'; 
import '@/styles/editProjectModal.css';

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const { t } = useTranslation();

  // 수정할 프로젝트 이름과 DB 정보를 위한 state
  const [projectName, setProjectName] = useState("");
  const [dbInfo, setDbInfo] = useState(null);

  // 부모로부터 받은 project prop이 바뀔 때마다 실행
  useEffect(() => {
    if (project) {
      // 전달받은 프로젝트 이름으로 state 설정
      setProjectName(project.name);
      
      // 프로젝트 ID에 맞는 DB 연결 정보를 mock 데이터에서 검색
      const connection = mockDbConnections.find(conn => conn.projectId === project.id);
      setDbInfo(connection);
    } else {
      // 모달이 닫히면 모든 정보 초기화
      setProjectName("");
      setDbInfo(null);
    }
  }, [project]); // 'project' prop이 바뀔 때마다 이 effect가 실행됩니다.

  if (!isOpen) return null;

  const handleSave = () => {
    if (!projectName.trim()) {
      alert(t("Please enter the project name."));
      return;
    }
    // 부모에게 수정된 프로젝트 이름과 id를 전달
    onSave({
      id: project.id,
      name: projectName,
    });
    onClose(); // 모달 닫기
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t("Edit Project")}</h2>

        {/* 프로젝트명: 수정 가능 */}
        <label>
          {t("project name")}
          <input 
            className="edit-project-input"
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)} 
            placeholder={t("project name")} 
          />
        </label>
        
        {/* DB 정보: 읽기 전용 (dbInfo가 있을 때만 표시) */}
        {dbInfo && (
          <>
            <label className="read-only-label">
              {t("DB Types")}
              <input className="read-only-input" value={dbInfo.type} readOnly />
            </label>
            <label className="read-only-label">
              {t("Host Info")}
              <input className="read-only-input" value={`${dbInfo.host} : ${dbInfo.port}`} readOnly />
            </label>
            <label className="read-only-label">
              {t("DB name")}
              <input className="read-only-input" value={dbInfo.database} readOnly />
            </label>
            <label className="read-only-label">
              {t("User ID")}
              <input className="read-only-input" value={dbInfo.username} readOnly />
            </label>
            
            
            {dbInfo.type === "postgres" && (
              <>
                <label className="read-only-label">
                  {t("schema")}
                  <input className="read-only-input" type="text" value={dbInfo.schema || ''} readOnly />
                </label>
                <label className="read-only-label">
                  search_path ({t("option")})
                  <input className="read-only-input" type="text" value={dbInfo.searchPath || ''} readOnly />
                </label>
              </>
            )}
          </>
        )}

        <div className="edit-modal-buttons">
          <button className="edit-cancel-btn" onClick={onClose}>{t("Cancel")}</button>
          <button className="edit-save-btn" onClick={handleSave}>{t("Save")}</button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
