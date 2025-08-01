// CreateProjectModal의 step2~3번 과정 분리
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const ConnectDBModal = ({ project, isOpen, onClose }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(2); // 시작은 step 2
    const [dbConfig, setDbConfig] = useState({
        dbName: '',
        host: '',
        port: '',
        user: '',
        password: '',
        schema: '',
        searchPath: ''
    });
    const [dbType, setDbType] = useState('mysql');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleInputChange = (key, value) => {
        setDbConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        // simulate test
        setTimeout(() => {
        setTestResult("success"); // or "fail"
        setIsTesting(false);
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{project.name} DB 연결</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
                <>
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
                </>
            )}
            </ModalBody>
            <ModalFooter>
            <Button onClick={onClose} mr={3}>취소</Button>
            {step > 2 && <Button onClick={() => setStep(step - 1)}>이전</Button>}
            <Button colorScheme="blue" onClick={() => setStep(step + 1)}>다음</Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    );
};

export default ConnectDBModal;
