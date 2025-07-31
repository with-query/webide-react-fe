import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { mockDbConnections } from '@/mock/mockData'; 
import '@/styles/editProjectModal.css';

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const { t } = useTranslation();

  // 수정할 프로젝트 이름과 DB 정보를 위한 state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [dbInfo, setDbInfo] = useState(null);
  const isOwner = project?.role === 'OWNER';

  // 부모로부터 받은 project prop이 바뀔 때마다 실행
  useEffect(() => {
    if (project) {
      console.log("수정할 프로젝트 데이터:", project);
      setProjectName(project.name);
      setProjectDescription(project.description || "");
      const connection = mockDbConnections.find(conn => conn.projectId === project.id);
      setDbInfo(connection);
    } 
    // else {
    //   setProjectName("");
    //   setProjectDescription("");
    //   setDbInfo(null);
    // }
  }, [project]); 

  if (!isOpen) return null;

  const handleReadOnlyClick = () => {
    alert("프로젝트 소유자만 수정할 수 있습니다.");
  };

  const handleSave = () => {
    if (!projectName.trim()) {
      alert(t("Please enter the project name."));
      return;
    }
   
    onSave({
      id: project.id,
      newName: projectName,
      newDescription: projectDescription,
    });
    onClose(); // 모달 닫기
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{t("Edit Project")}</h2>
          {project?.role && (
            <div className={`role-capsule ${project.role.toLowerCase()}`}>
              {project.role}
            </div>
          )}
        </div>

        <label>
          {t("project name")}
          {isOwner ? (
          <input 
            className="edit-project-input"
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)} 
            placeholder={t("project name")} 
          />
          ) : (
            <div className="read-only-input" onClick={handleReadOnlyClick}>
              {projectName}
            </div>
          )}
        </label>
        
        <label>
          {t("Project Description")}
          {isOwner ? (
          <textarea
            className="edit-project-textarea"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows="4"
          />
          ) : (
            <div className="read-only-input" onClick={handleReadOnlyClick}>
              {projectDescription || '설명이 없습니다.'}
            </div>
          )}
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
