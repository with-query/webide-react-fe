import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@chakra-ui/react";

import mockProjects from "../mock/mockProjects";
import mockUser from "../mock/mockUser";
import mockDbConnections from "../mock/mockDbConnections";
import mockDbSchemas from "../mock/mockDbSchemas";
//import axios from "axios";

import "../styles/dashboard.css";

import BoltIcon from "../components/icons/BoltIcon"
import PlusIcon from "../components/icons/PlusIcon";
import RecentIcon from "../components/icons/RecentIcon";
import TableIcon from "../components/icons/TableIcon";
import ChatIcon from "../components/icons/ChatIcon";
import PieIcon from "../components/icons/PieIcon";
import FileIcon from "../components/icons/FileIcon";
import CodeIcon from "../components/icons/CodeIcon";
import UserProfileIcon from "../components/icons/UserProfileIcon";
import FolderIcon from "../components/icons/FolderIcon";
import InboxIcon from "../components/icons/InboxIcon";

import CreateProjectModal from "../components/modals/CreateProjectModal";
import { useTranslation } from "react-i18next";


const Dashboard = () => {    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const [projectCount, setProjectCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [tableItemCount, setTableItemCount] = useState(0);

    const { t } = useTranslation();
    //프로젝트 목록 조회
    useEffect(() => {
        // axios.get("/api/projects")
        // .then((res) => {
        //     setProjects(res.data); 
        // })
        // .catch((err) => {
        //     console.error("프로젝트 목록 조회 실패", err);
        // })
        // .finally(() => {
        //     setLoading(false);
        // });
        setProjects(mockProjects);
        setLoading(false);
    }, []);

    //유저 정보 조회
    useEffect(() => {
        // axios.get("/api/user/me")
        //     .then((res) => {
        //     setUser(res.data);
        //     })
        //     .catch(() => {
        //     setUser(null);
        //     });
        setUser(mockUser);
    }, []);

    //프로젝트 상태 수 계산(쿼리/테이블 수)
    useEffect(() => {
        const fetchProjectStatus = () => {
            let filteredProjects = projects;

            if (selectedProjectId !== null) {
                filteredProjects = projects.filter(p => p.id === selectedProjectId);
            }

            const totalProjects = selectedProjectId === null ? projects.length : 1;

            let totalQueries = 0;
            filteredProjects.forEach(project => {
                project.files?.forEach(file => {
                    if (file.name.endsWith(".sql")) {
                        totalQueries++;
                    }
                });
            });

            let totalTables = 0;
            if (selectedProjectId !== null) {
                const dbConn = mockDbConnections.find(conn => conn.projectId === selectedProjectId);
                const schema = mockDbSchemas[dbConn?.id];
                totalTables = schema?.tables?.length || 0;
            } else {
                mockDbConnections.forEach((conn) => {
                    const schema = mockDbSchemas[conn.id];
                    if (schema?.tables?.length) {
                        totalTables += schema?.tables?.length;
                    }
                });
            }

            setProjectCount(totalProjects);
            setQueryCount(totalQueries);
            setTableItemCount(totalTables);
        };

        fetchProjectStatus();
    }, [selectedProjectId, projects]);

    //프로젝트 열기
    const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
    };

    //프로젝트 선택 변경
    const handleSelectProject = (id) => {
        setSelectedProjectId(id);
        setIsDropdownOpen(false);
    };

    return (
        <Box p={8} bg="#f9f8f6" minH="100vh" color="text.primary">
            <h1 className="dashboard-title">{t("Dashboard")}</h1>
            {loading ? (
                <div className="loading-indicator">Loading...</div>
                ) : (
                <Grid templateColumns="3fr 1fr" gap={6}>
                    <Box className="dashboard-left">

                        <div className="recent-projects">
                            <div className="recent-projects-header">
                                <div className="recent-projects-header-left">
                                    <FolderIcon className="folder-icon" />
                                    <span>{t("Recent project")}</span>
                                </div>
                                <button className="recent-projects-view-all">{t("View all")}</button>
                            </div>

                            {projects.length === 0 ? (
                                <div className="recent-projects-empty-wrapper">
                                    <div className="recent-projects-empty">
                                        <InboxIcon className="empty-icon" />
                                        <p className="empty-text">{t("No projects have been created yet")}</p>
                                        <button className="create-project-btn" onClick={() => setIsCreateModalOpen(true)}>
                                            {t("Create project")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="recent-projects-list">
                                    {projects.map((project) => (
                                        <li key={project.id} className="project-card">
                                            {project.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Box>

                    <Box className="dashboard-right">
                        <div className="user-card">
                            {user ? (
                                <>
                                    <div className="user-profile-container">
                                        {user?.profileUrl?.trim() ? (
                                            <img className="user-profile" src={user.profileUrl} alt="프로필" />
                                        ) : (
                                            <UserProfileIcon className="user-profile-icon" />
                                        )}
                                    </div>
                                    <p className="user-name">{user.name}</p>
                                    <p className="user-email">{user.email}</p>
                                </>
                            ) : (
                                <>
                                    <div className="user-profile-container">
                                        <UserProfileIcon className="user-profile-icon" />
                                    </div>
                                    <p className="login-title"> {t("Login required")} </p>
                                    <p className="login-desc"> {t("Log in to your account to use the features")} </p>
                                    <div className="user-profile-buttons">
                                        <button className="sign-in-btn">{t("Login")}</button>
                                        <button className="sign-up-btn">{t("Sign Up")}</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="quick-actions">
                            <h2 className="quick-actions-header">
                                <BoltIcon className="quick-actions-icon" />
                                {t("Fast action")}
                            </h2>
                            <div className="quick-action-item" onClick={() =>setIsCreateModalOpen(true)} role="button" tabIndex={0}>
                                <PlusIcon className="quick-action-icon plus"  />
                                <p className="quick-action-title">{t("New query project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && navigate("/workspace")} role="button" tabIndex={0}>
                                <RecentIcon className="quick-action-icon recent-project" />
                                <p className="quick-action-title">{t("Recent project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && setIsChatModalOpen(true)} role="button" tabIndex={0}>
                                <ChatIcon className="quick-action-icon chat" />
                                <p className="quick-action-title">{t("Team chat")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                        </div>

                        <div className="status">
                            <h2>
                                <PieIcon className="status-icon" />
                                {t("Usage status")}
                            </h2>
                            <div 
                                className="status-dropdown"
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <button className="status-dropdown-toggle">
                                    {selectedProjectId 
                                        ? projects.find(p => p.id === selectedProjectId)?.name 
                                        : t("All projects")}
                                </button>

                                {isDropdownOpen && (
                                    <ul className="status-dropdown-menu">
                                        <li onClick={() => handleSelectProject(null)}>{t("All projects")}</li>
                                        {projects.map(p => (
                                            <li key={p.id} onClick={() => handleSelectProject(p.id)}>{p.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="staus-list">
                                <div className="status-item">
                                    <FileIcon className="status-item-icon file" />
                                    <p className="status-item-title">{t("Total number of projects")}</p>
                                    <p className="status-item-value">{projectCount}</p>
                                </div>

                                <div className="status-item">
                                    <CodeIcon className="status-item-icon code" />
                                    <p className="status-item-title">{t("Total number of querys")}</p>
                                    <p className="status-item-value">{queryCount}</p>
                                </div>

                                <div className="status-item">
                                    <TableIcon className="status-item-icon table" />
                                    <p className="status-item-title">{t("Table entity")}</p>
                                    <p className="status-item-value">{tableItemCount}</p>
                                </div>
                            </div>
                        </div>
                    </Box>
                </Grid>
            )}
                <CreateProjectModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onNext={(data) => {
                        console.log("프로젝트 설정 완료", data);

                        // ✅ 새 프로젝트 정보 생성 (간단한 id 생성 포함)
                        const newProject = {
                        id: Date.now(), // 간단한 고유 id (실제론 uuid 권장)
                        name: data.projectName,
                        createdAt: new Date().toISOString(),
                        files: [], // 쿼리 파일은 아직 없으므로 빈 배열
                        };

                        // ✅ 기존 프로젝트 리스트에 추가
                        setProjects(prev => [newProject, ...prev]);

                        if (data.isNewDb) {
                            console.log("🆕 새 프로젝트입니다. 빈 디렉토리 상태입니다.");
                        } else {
                            console.log("📦 기존 DB 연결입니다. DB를 불러왔습니다.", data.dbConfig);
                        }
                        navigate("/query-builder");
                    }}
                />
        </Box>
    );
};

export default Dashboard;