import { useState } from "react";
import "/src/styles/createProjectModal.css";

const CreateProjectModal = ({ isOpen, onClose, onNext }) => {
  const [step, setStep] = useState(1);
  const [isNewDb, setIsNewDb] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [invitedEmails, setInvitedEmails] = useState("")
  const [dbType, setDbType] = useState("mysql");
  const [dbConfig, setDbConfig] = useState({
    dbName: "",
    host: "",
    port: "",
    user: "",
    password: "",
    schema: "",
    searchPath: ""
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 3) {
      onNext({ 
        projectName, 
        isNewDb, 
        dbType, 
        dbConfig, 
        invitedEmails: invitedEmails 
          .split(",")
          .map(email => email.trim())
          .filter(email => email.length > 0)
      });
      onClose();
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleInputChange = (key, value) => {
    setDbConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>프로젝트 생성</h2>

        {step === 1 && (
          <div className="step1">
            <label>
              <input type="radio" name="mode" checked={isNewDb} onChange={() => setIsNewDb(true)} /> 새 데이터베이스 연결
            </label>
            <label>
              <input type="radio" name="mode" checked={!isNewDb} onChange={() => setIsNewDb(false)} /> 기존 데이터베이스 연결
            </label>
          </div>
        )}

        {step === 2 && (
          <label>
            프로젝트 이름
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="프로젝트 이름"/>
          </label>
        )}

        {step === 3 && (
          <>
            <label>
              데이터베이스 이름
              <input type="text" value={dbConfig.dbName} onChange={(e) => handleInputChange("dbName", e.target.value)} placeholder="데이터베이스 이름" />
            </label>
            <label>
              데이터베이스 종류
              <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
                <option value="mysql">MySQL</option>
                <option value="postgres">PostgreSQL</option>
              </select>
            </label>
            <label>
              호스트
              <input type="text" value={dbConfig.host} onChange={(e) => handleInputChange("host", e.target.value)} placeholder="호스트  (ex. localhost)"/>
            </label>
            <label>
              포트
              <input type="text" value={dbConfig.port} onChange={(e) => handleInputChange("port", e.target.value)} placeholder="포트  (ex. 3306 / 5432)" />
            </label>
            <label>
              사용자 ID
              <input type="text" value={dbConfig.user} onChange={(e) => handleInputChange("user", e.target.value)} placeholder="사용자 ID  (ex. root)" />
            </label>
            <label>
              비밀번호
              <input type="password" value={dbConfig.password} onChange={(e) => handleInputChange("password", e.target.value)} placeholder="비밀번호  (ex. root)" />
            </label>

            {dbType === "postgres" && (
              <>
                <label>
                  스키마
                  <input type="text" value={dbConfig.schema} onChange={(e) => handleInputChange("schema", e.target.value)} />
                </label>
                <label>
                  search_path
                  <input type="text" value={dbConfig.searchPath} onChange={(e) => handleInputChange("searchPath", e.target.value)} />
                </label>
              </>
            )}

            <label>
              친구 초대 (이메일, 쉼표로 구분)
              <input
                type="text"
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                placeholder="이메일  (ex. friend1@example.com, friend2@example.com)"
              />
            </label>
          </>
        )}

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="next-btn"onClick={handleNext}>다음</button>
        </div>
      </div>
    </div>

  );
};

export default CreateProjectModal;