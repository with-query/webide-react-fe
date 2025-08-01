/*import { useState, useEffect } from "react";
import "@/styles/createProjectModal.css";
import { useTranslation } from 'react-i18next';
import CheckIcon from "../icons/CheckIcon";
import FalseIcon from "../icons/FalseIcon";
import LoadingIcon from "../icons/LoadingIcon";

const CreateProjectModal = ({ isOpen, onClose, onNext }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [invitedEmails, setInvitedEmails] = useState("");
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

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [isNewDb, setIsNewDb] = useState(true);
  const [connectDb, setConnectDb] = useState(true); 
  
  const fieldLabels = {
    dbName: t("DB name"),
    host: t("Host"),
    port: t("Port"),
    user: t("User ID"),
    password: t("Password")
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setConnectDb(true);
      setProjectName("");
      setProjectDescription("");
      setInvitedEmails("");
      setDbConfig({ dbName: "", host: "", port: "", user: "", password: "", schema: "", searchPath: "" });
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {

    if (step === 1) {
      if (!projectName.trim()) {
        alert(t("Please enter the project name."));
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const isDbConnectionAttempted = dbConfig.dbName.trim() || dbConfig.host.trim() || dbConfig.user.trim();

      if (isDbConnectionAttempted) {
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
      setStep(3);
    } else {
        onNext({
          name: projectName, 
          description: projectDescription,
          dbConnected: false,
          invitedEmails: invitedEmails.split(",").map(e => e.trim()).filter(Boolean)
        });
        onClose();
      }
      return;
    }

    if (step === 3) {
      if (testResult !== "success") {
        alert(t("You need to successfully test the DB connection first."));
        return;
      }
    
      //프로젝트 생성
      onNext({ 
        name: projectName,
        description: projectDescription,
        dbConnected: true,
        dbType, 
        dbConfig, 
        invitedEmails: invitedEmails 
          .split(",")
          .map(email => email.trim())
          .filter(email => email.length > 0)
      });
      onClose();
    }
  }

  const handleInputChange = (key, value) => {
    setDbConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
        console.log("백엔드 API 없음 - 연결 테스트를 성공으로 간주합니다.");
        setTestResult("success");
        setIsTesting(false);
    }, 1000);
    // try {
    //   const response = await fetch("/api/db-connections/test", {
    //     method: "POST",
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({dbType, ...dbConfig}),
    //   });

    //   if (!response.ok) throw new Error("연결 테스트 실패");

    //   setTestResult("success");
    // } catch (error) {
    //   setTestResult("fail");
    // } finally {
    //   setIsTesting(false);
    // }
  };

  const getNextButtonText = () => {
    if (step === 3 || (step === 2 && !dbConfig.host.trim() && !dbConfig.dbName.trim())) {
      return t("Create project");
    }
    return t("Next");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t("Create project")}</h2>

        {step === 1 && (
          <>
            <label>
              {t("project name")}
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t("project name")}/>
            </label>
            
            <label>
              {t("Project Description")} ({t("option")})
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder={t("Enter a description for your project.")}
                rows="3"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="step-description">{t("These steps are optional and can be configured later.")}</p>
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
              {t("Invite Members")}
              <input
                type="text"
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                placeholder={t("Invite Members Ex")}
              />
            </label>
          </>
        )}

        {step === 3 && (
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
                      <p><strong>{t("schema")}:</strong> {dbConfig.schema}</p>
                      <p><strong>{t("searchPath")}:</strong> {dbConfig.searchPath}</p>
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

        <div className="modal-buttons multi-step">
          <button className="cancel-btn" onClick={onClose}>{t("Cancel")}</button>
          
          {step > 1  && (
            <button className="previous-btn" onClick={handlePrevious}> {t("Previous")} </button>
          )}
          <button className="next-btn"onClick={handleNext}>{t("Next")}</button>
        </div>
      </div>
    </div>

  );
};

export default CreateProjectModal;*/
import { useState, useEffect } from "react";
import "@/styles/createProjectModal.css";
import { useTranslation } from 'react-i18next';
import CheckIcon from "../icons/CheckIcon";
import FalseIcon from "../icons/FalseIcon";
import LoadingIcon from "../icons/LoadingIcon";

const CreateProjectModal = ({
  isOpen,
  onClose,
  onNext,
  skipStep1 = false,
  presetProjectName = ""
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(skipStep1 ? 2 : 1);
  const [projectName, setProjectName] = useState(skipStep1 ? presetProjectName : "");
  const [projectDescription, setProjectDescription] = useState("");

  const [invitedEmails, setInvitedEmails] = useState("");
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

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fieldLabels = {
    dbName: t("DB name"),
    host: t("Host"),
    port: t("Port"),
    user: t("User ID"),
    password: t("Password")
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(skipStep1 ? 2 : 1);
      setProjectName(skipStep1 ? presetProjectName : "");
      setProjectDescription("");
      setInvitedEmails("");
      setDbConfig({
        dbName: "",
        host: "",
        port: "",
        user: "",
        password: "",
        schema: "",
        searchPath: ""
      });
      setTestResult(null);
    }
  }, [isOpen, skipStep1, presetProjectName]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!projectName.trim()) {
        alert(t("Please enter the project name."));
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const isDbConnectionAttempted = dbConfig.dbName.trim() || dbConfig.host.trim() || dbConfig.user.trim();

      if (isDbConnectionAttempted) {
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
        setStep(3);
      } else {
        // DB 연결 안 할 경우 바로 프로젝트 생성 (혹은 연결정보 저장)
        onNext({
          name: projectName,
          description: projectDescription,
          dbConnected: false,
          invitedEmails: invitedEmails
            .split(",")
            .map(e => e.trim())
            .filter(Boolean)
        });
        onClose();
      }
      return;
    }

    if (step === 3) {
      if (testResult !== "success") {
        alert(t("You need to successfully test the DB connection first."));
        return;
      }

      onNext({
        name: projectName,
        description: projectDescription,
        dbConnected: true,
        dbType,
        dbConfig,
        invitedEmails: invitedEmails
          .split(",")
          .map(email => email.trim())
          .filter(email => email.length > 0)
      });
      onClose();
    }
  };

  const handleInputChange = (key, value) => {
    setDbConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      console.log("백엔드 API 없음 - 연결 테스트를 성공으로 간주합니다.");
      setTestResult("success");
      setIsTesting(false);
    }, 1000);
  };

  const getNextButtonText = () => {
    if (step === 3 || (step === 2 && !dbConfig.host.trim() && !dbConfig.dbName.trim())) {
      return t("Create project");
    }
    return t("Next");
  };




  

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t("Create project")}</h2>

        {!skipStep1 && step === 1 && (
          <>
            <label>
              {t("project name")}
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("project name")}
                
              />
            </label>

            <label>
              {t("Project Description")} ({t("option")})
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder={t("Enter a description for your project.")}
                rows="3"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="step-description">{t("These steps are optional and can be configured later.")}</p>
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
              <input type="text" value={dbConfig.host} onChange={(e) => handleInputChange("host", e.target.value)} placeholder={t("Host Ex")} />
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
              {t("Invite Members")}
              <input
                type="text"
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                placeholder={t("Invite Members Ex")}
              />
            </label>
          </>
        )}

        {step === 3 && (
          <div className="step4">
            <div className="db-test-section">
              <h3 className="db-test-title">{t("Check Database Connection")}</h3>
              <div className="db-config-summary">
                <h4 className="summary-title">{t("Summary Title")}</h4>
                <div className="summary-content">
                  <p><strong>{t("DB Type")}:</strong> {dbType === 'mysql' ? 'MySQL' : 'PostgreSQL'}</p>
                  <p><strong>{t("Host Info")}:</strong> {dbConfig.host}:{dbConfig.port}</p>
                  <p><strong>{t("DB Name")}:</strong> {dbConfig.dbName}</p>
                  <p><strong>{t("User")}:</strong> {dbConfig.user}</p>
                  {dbType === 'postgres' && (
                    <>
                      <p><strong>{t("schema")}:</strong> {dbConfig.schema}</p>
                      <p><strong>{t("searchPath")}:</strong> {dbConfig.searchPath}</p>
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
                  <div className="result-icon"><CheckIcon /></div>
                  <div className="result-title">{t("Connection Success!")}</div>
                  <p className="result-message">{t("Connection Success Message")}</p>
                </div>
              )}

              {testResult === "fail" && (
                <div className="test-result fail">
                  <div className="result-icon"><FalseIcon /></div>
                  <div className="result-title">{t("Connection Failed")}</div>
                  <p className="result-message">
                    {t("Connection Failed Message1")}<br />{t("Connection Failed Message2")}
                  </p>
                </div>
              )}

              {isTesting && (
                <div className="test-result loading">
                  <div className="result-icon"><LoadingIcon /></div>
                  <div className="result-title">{t("Connecting...")}</div>
                  <p className="result-message">
                    {t("Connecting Message1")}<br />{t("Connecting Message2")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-buttons multi-step">
          <button className="cancel-btn" onClick={onClose}>{t("Cancel")}</button>
          {step > (skipStep1 ? 2 : 1) && (
            <button className="previous-btn" onClick={handlePrevious}>{t("Previous")}</button>
          )}
          <button className="next-btn" onClick={handleNext}>{getNextButtonText()}</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
