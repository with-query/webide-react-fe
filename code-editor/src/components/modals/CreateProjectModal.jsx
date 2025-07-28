import { useState } from "react";
import "/src/styles/createProjectModal.css";
import { useTranslation } from "react-i18next";

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
                  <input type="text" value={dbConfig.schema} onChange={(e) => handleInputChange("schema", e.target.value)} />
                </label>
                <label>
                  search_path
                  <input type="text" value={dbConfig.searchPath} onChange={(e) => handleInputChange("searchPath", e.target.value)} />
                </label>
              </>
            )}

            <label>
              {t("Invite Friends")}
              <input
                type="text"
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                placeholder={t("Invite Friends Ex")}
              />
            </label>
          </>
        )}

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>{t("Cancel")}</button>
          <button className="next-btn"onClick={handleNext}>{t("Next")}</button>
        </div>
      </div>
    </div>

  );
};

export default CreateProjectModal;