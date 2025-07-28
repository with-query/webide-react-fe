import { useState } from "react";
import "/src/styles/createProjectModal.css";
import { useTranslation } from 'react-i18next';
import CheckIcon from "../icons/CheckIcon";
import FalseIcon from "../icons/FalseIcon";
import LoadingIcon from "../icons/LoadingIcon";

const CreateProjectModal = ({ isOpen, onClose, onNext }) => {
  const { t } = useTranslation();
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
  const fieldLabels = {
    dbName: t("DB name"),
    host: t("Host"),
    port: t("Port"),
    user: t("User ID"),
    password: t("Password")
  };

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    //프로젝트 입력 조건
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!projectName.trim()) {
        alert(t("Please enter the project name."));
        return;
      }
      setStep((prev) => prev + 1);
      return;
    }

    if (step === 3) {
      const requiredFields = ["dbName", "host", "port", "user", "password"];
      for (const field of requiredFields) {
        if (!dbConfig[field].trim()) {
          alert(t('Please enter the "{{field}}" field.', { field: fieldLabels[field] }));
          return;
        }
      }

      if (dbType === "postgres") {
        if (!dbConfig.schema.trim()) {
          alert(t('Please enter the "schema" field.'));
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmail = invitedEmails
        .split(",")
        .map(email => email.trim())  
        .find(email => !emailRegex.test(email));
      if (invalidEmail) {
        alert(t(`"${invalidEmail}" is not a valid email format.`));
        return;
      }

      setTestResult(null);
      setIsTesting(false);
      setStep(4);
      return;
    }

    if (step === 4) {
      if (testResult !== "success") {
        alert(t("You need to successfully test the DB connection first."));
        return;
      }
    
      //프로젝트 생성
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
  }

  const handleInputChange = (key, value) => {
    setDbConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/db-connections/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbType,
          ...dbConfig,
        }),
      });

      if (!response.ok) throw new Error("연결 테스트 실패");

      setTestResult("success");
    } catch (error) {
      setTestResult("fail");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t("Create project")}</h2>

        {step === 1 && (
          <div className="step1">
            <label>
              <input type="radio" name="mode" checked={isNewDb} onChange={() => setIsNewDb(true)} /> {t("New DB connection")}
            </label>
            <label>
              <input type="radio" name="mode" checked={!isNewDb} onChange={() => setIsNewDb(false)} /> {t("Existing DB connection")}
            </label>
          </div>
        )}

        {step === 2 && (
          <label>
            {t("project name")}
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t("project name")}/>
          </label>
        )}

        {step === 3 && (
          <>
            <label>
              {t("DB name")}
              <input type="text" value={dbConfig.dbName} onChange={(e) => handleInputChange("dbName", e.target.value)} placeholder={t("DB name")} />
            </label>
            <label>
              {t("DB Types")}
              <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
                <option value="mysql">MySQL</option>
                <option value="postgres">PostgreSQL</option>
              </select>
            </label>
            <label>
              {t("Host")}
              <input type="text" value={dbConfig.host} onChange={(e) => handleInputChange("host", e.target.value)} placeholder={t("Host Ex")}/>
            </label>
            <label>
              {t("Port")}
              <input type="text" value={dbConfig.port} onChange={(e) => handleInputChange("port", e.target.value)} placeholder={t("Port Ex")} />
            </label>
            <label>
              {t("User ID")}
              <input type="text" value={dbConfig.user} onChange={(e) => handleInputChange("user", e.target.value)} placeholder={t("User ID Ex")} />
            </label>
            <label>
              {t("Password")}
              <input type="password" value={dbConfig.password} onChange={(e) => handleInputChange("password", e.target.value)} placeholder={t("Password Ex")} />
            </label>

            {dbType === "postgres" && (
              <>
                <label>
                  {t("schema")}
                  <input type="text" value={dbConfig.schema} onChange={(e) => handleInputChange("schema", e.target.value)} placeholder={t("schema Ex")} />
                </label>
                <label>
                  search_path ({t("option")})
                  <input type="text" value={dbConfig.searchPath} onChange={(e) => handleInputChange("searchPath", e.target.value)} placeholder={t("searchPath Ex")} />
                </label>
              </>
            )}

            <label>
              {t("Invite Friends")} ({t("option")})
              <input
                type="text"
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                placeholder={t("Invite Friends Ex")}
              />
            </label>
          </>
        )}

        {step === 4 && (
          <div className="step4">
            <div className="db-test-section">
              <h3 className="db-test-title">
                {t("Check Database Connection")}
              </h3>

              <div className="db-config-summary">
                <h4 className="summary-title">{t("Summary Title")}</h4>
                <div className="summary-content">
                  <p><strong>{t("DB Type")}:</strong> {dbType === 'mysql' ? 'MySQL' : 'PostgreSQL'}</p>
                  <p><strong>{t("Host Info")}:</strong> {dbConfig.host}:{dbConfig.port}</p>
                  <p><strong>{t("DB Name")}:</strong> {dbConfig.dbName}</p>
                  <p><strong>{t("User")}:</strong> {dbConfig.user}</p>
                  {dbType === 'postgres' && (
                    <>
                      <p><strong>{t(schema)}:</strong> {dbConfig.schema}</p>
                      <p><strong>{t(searchPath)}:</strong> {dbConfig.searchPath}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="test-button-section">
                <button 
                  onClick={handleTestConnection} 
                  disabled={isTesting} 
                  className={`test-connection-btn ${isTesting ? 'testing' : ''}`}
                >
                  {isTesting ? t("Testing connection...") : t("DB connection test")}
                </button>
              </div>

              {testResult === "success" && (
                <div className="test-result success">
                  <div className="result-icon"> 
                    <CheckIcon />
                  </div>
                  <div className="result-title">{t("Connection Success!")}</div>
                  <p className="result-message">
                  {t("Connection Success Message")}
                  </p>
                </div>
              )}

              {testResult === "fail" && (
                <div className="test-result fail">
                  <div className="result-icon">
                    <FalseIcon />
                  </div>
                  <div className="result-title">{t("Connection Failed")}</div>
                  <p className="result-message">
                    {t("Connection Failed Message1")}<br />{t("Connection Failed Message2")}
                  </p>
                </div>
              )}

              {isTesting && (
                <div className="test-result loading">
                  <div className="result-icon">
                    <LoadingIcon />
                  </div>
                  <div className="result-title">{t("Connecting...")}</div>
                  <p className="result-message">
                    {t("Connecting Message1")}<br />{t("Connecting Message2")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}  

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>{t("Cancel")}</button>
          
          {step !== 1 && (
            <button className="previous-btn" onClick={handlePrevious}> {t("Previous")} </button>
          )}
          <button className="next-btn"onClick={handleNext}>{t("Next")}</button>
        </div>
      </div>
    </div>

  );
};

export default CreateProjectModal;