import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, useDisclosure, useToast } from "@chakra-ui/react";
import axios from "axios";

import "../styles/dashboard.css";
import BoltIcon from "@/components/icons/BoltIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import RecentIcon from "@/components/icons/RecentIcon";
import TableIcon from "@/components/icons/TableIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import PieIcon from "@/components/icons/PieIcon";
import CodeIcon from "@/components/icons/CodeIcon";
import UserProfileIcon from "@/components/icons/UserProfileIcon";
import FolderIcon from "@/components/icons/FolderIcon";
import InboxIcon from "@/components/icons/InboxIcon";
import MoreIcon from "@/components/icons/MoreIcon";

import CreateProjectModal from "@/components/modals/CreateProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";
import DeleteProjectModal from "@/components/modals/DeleteProjectModal";
import InviteMemberModal from "@/components/modals/InviteMemberModal";
import { useTranslation } from "react-i18next"; // <-- 이 줄은 올바르게 수정되었습니다.
import RecentProjectsModal from "@/components/modals/RecentProjectsModal";

import DBConnect from "./DBConnect";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [dbConnections, setDbConnections] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editTargetProject, setEditTargetProject] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetProject, setDeleteTargetProject] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteTargetProject, setInviteTargetProject] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const [projectCount, setProjectCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [tableItemCount, setTableItemCount] = useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const navigate = useNavigate();
    const { t } = useTranslation();

    const BASE_URL = "http://20.196.89.99:8080";

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                toast({
                    title: "인증 필요",
                    description: "로그인이 필요합니다.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
                navigate("/login");
                setLoading(false);
                return;
            }

            try {
                const [userRes, projectsRes, dbConnectionsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/api/db-connections`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const fetchedUser = userRes.data;
                const fetchedProjects = projectsRes.data;
                const fetchedDbConnections = dbConnectionsRes.data;

                setUser(fetchedUser);
                setDbConnections(fetchedDbConnections);

                const projectsWithDbStatus = fetchedProjects.map((project) => ({
                    ...project,
                    isDbConnected: fetchedDbConnections.some(
                        (conn) => conn.projectId === project.id
                    ),
                }));
                setProjects(projectsWithDbStatus);

            } catch (error) {
                console.error("대시보드 데이터 로딩 실패:", error);
                const errorMessage = error.response?.data?.message || "서버에서 데이터를 가져오는 데 실패했습니다.";
                toast({
                    title: "데이터 로딩 실패",
                    description: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });

                setUser(null);
                setProjects([]);
                setDbConnections([]);

                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, toast]);

    useEffect(() => {
        const calculateProjectStatus = async () => {
            let currentProjectCount = selectedProjectId === null ? projects.length : 1;
            let currentTotalQueries = 0;
            let currentTotalTables = 0;
            const token = localStorage.getItem("token");

            if (token) {
                if (selectedProjectId !== null) {
                    const dbConn = dbConnections.find((conn) => conn.projectId === selectedProjectId);
                    if (dbConn) {
                        try {
                            const schemaRes = await axios.get(`${BASE_URL}/api/db-connections/${dbConn.id}/schemas`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            currentTotalTables = schemaRes.data?.length || 0;
                        } catch (error) {
                            console.error(`스키마 로딩 실패 for project ${selectedProjectId}:`, error);
                            toast({
                                title: "스키마 로딩 실패",
                                description: "선택된 프로젝트의 DB 스키마를 가져오는 데 실패했습니다.",
                                status: "error",
                                duration: 3000,
                            });
                        }
                    }
                } else {
                    for (const conn of dbConnections) {
                        try {
                            const projectExists = projects.some((p) => p.id === conn.projectId);
                            if (projectExists) {
                                const schemaRes = await axios.get(`${BASE_URL}/api/db-connections/${conn.id}/schemas`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                currentTotalTables += schemaRes.data?.length || 0;
                            }
                        } catch (error) {
                            console.warn(`일부 DB 스키마 로딩 실패 (conn ID: ${conn.id}):`, error);
                        }
                    }
                }
            }

            setProjectCount(currentProjectCount);
            setQueryCount(currentTotalQueries);
            setTableItemCount(currentTotalTables);
        };

        calculateProjectStatus();
    }, [selectedProjectId, projects, dbConnections, toast, BASE_URL]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
        };

        if (activeDropdownId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDropdownId]);

    const handleCreateProject = async (data) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            navigate("/login");
            return;
        }

        try {
            console.log("프로젝트 생성 요청 데이터:", data);

            const projectRes = await axios.post(`${BASE_URL}/api/projects`, {
                name: data.name,
                description: data.description,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const newProject = projectRes.data;
            newProject.isDbConnected = data.dbConnected;

            setProjects((prev) => [newProject, ...prev]);
            setIsCreateModalOpen(false);

            if (data.dbConnected) {
                console.log("DB 연결을 시도합니다. 원본 dbConfig:", data.dbConfig);
                let dbConnectionPayload = {
                    projectId: newProject.id,
                    name: data.dbConfig.dbName || data.name + " DB Connection",
                    url: '',
                    username: data.dbConfig.user || data.dbConfig.username,
                    password: data.dbConfig.password,
                    driverClassName: '',
                };

                switch (data.dbType) {
                    case 'mysql':
                        dbConnectionPayload.url = `jdbc:mysql://${data.dbConfig.host}:${data.dbConfig.port}/${data.dbConfig.dbName}`;
                        dbConnectionPayload.driverClassName = 'com.mysql.cj.jdbc.Driver';
                        break;
                    case 'postgresql':
                        dbConnectionPayload.url = `jdbc:postgresql://${data.dbConfig.host}:${data.dbConfig.port}/${data.dbConfig.dbName}`;
                        dbConnectionPayload.driverClassName = 'org.postgresql.Driver';
                        break;
                    default:
                        console.error("지원하지 않는 DB 타입입니다:", data.dbType);
                        toast({ title: "DB 연결 실패", description: "지원하지 않는 DB 타입입니다.", status: "error" });
                        return;
                }

                console.log("DB 연결 API로 최종 전송할 데이터:", dbConnectionPayload);

                const dbConnectionRes = await axios.post(`${BASE_URL}/api/db-connections`, dbConnectionPayload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const newDbConnection = dbConnectionRes.data;
                setDbConnections((prev) => [...prev, newDbConnection]);

                toast({
                    title: "프로젝트 생성 및 DB 연결 완료",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                // ✅ 생성 후, 마지막 작업 공간으로 이동하는 로직을 호출합니다.
                handleOpenProject(newProject.id);

            } else {
                toast({
                    title: "프로젝트 생성 완료",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                console.log("DB 연결 없이 프로젝트만 생성되었습니다. 에디터로 이동합니다.");
                 // ✅ 생성 후, 마지막 작업 공간으로 이동하는 로직을 호출합니다.
                handleOpenProject(newProject.id);
            }

            if (data.invitedEmails && data.invitedEmails.length > 0) {
                console.log("멤버를 초대합니다 (API 호출 필요):", data.invitedEmails);
            }

        } catch (error) {
            console.error("프로젝트 생성 실패:", error);
            toast({
                title: "프로젝트 생성 실패",
                description: error.response?.data?.message || "새 프로젝트를 생성하는 데 문제가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSaveProject = async (updatedData) => {
        const token = localStorage.getItem("token");
        if (!token || !editTargetProject) {
             toast({ title: "수정할 프로젝트를 찾을 수 없습니다.", status: "error" });
             return;
        }

        try {
            const res = await axios.put(`${BASE_URL}/api/projects/${editTargetProject.id}`, {
                name: updatedData.newName,
                description: updatedData.newDescription,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                setProjects((prevProjects) =>
                    prevProjects.map((project) => {
                        if (project.id === editTargetProject.id) {
                            return {
                                ...project,
                                name: updatedData.newName,
                                description: updatedData.newDescription,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                        return project;
                    })
                );
                toast({ title: "프로젝트 수정 완료", status: "success" });
            } else {
                throw new Error(res.data?.message || "프로젝트 수정 실패");
            }
        } catch (error) {
            console.error("프로젝트 수정 실패:", error);
            toast({
                title: "프로젝트 수정 실패",
                description: error.response?.data?.message || "프로젝트를 수정하는 데 문제가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsEditModalOpen(false);
            setEditTargetProject(null);
        }
    };

    const handleEdit = (projectId) => {
        const projectToEdit = projects.find((p) => p.id === projectId);
        if (projectToEdit) {
            setEditTargetProject(projectToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteClick = (projectId) => {
        const projectToDelete = projects.find((p) => p.id === projectId);
        if (projectToDelete) {
            setDeleteTargetProject(projectToDelete);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token || !deleteTargetProject) {
            toast({ title: "삭제할 프로젝트를 찾을 수 없습니다.", status: "error" });
            return;
        }

        try {
            const res = await axios.delete(`${BASE_URL}/api/projects/${deleteTargetProject.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200 || res.status === 204) {
                setProjects(projects.filter((p) => p.id !== deleteTargetProject.id));
                setDbConnections((prev) => prev.filter((conn) => conn.projectId !== deleteTargetProject.id));
                toast({ title: "프로젝트 삭제 완료", status: "success" });
            } else {
                throw new Error(res.data?.message || "프로젝트 삭제 실패");
            }
        } catch (error) {
            console.error("프로젝트 삭제 실패:", error);
            toast({
                title: "프로젝트 삭제 실패",
                description: error.response?.data?.message || "프로젝트를 삭제하는 데 문제가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetProject(null);
        }
    };


    const handleInvite = (projectId) => {
        const projectToInvite = projects.find((p) => p.id === projectId);
        if (projectToInvite) {
            setInviteTargetProject(projectToInvite);
            setIsInviteModalOpen(true);
        }
    };

    const toggleDropdown = (projectId) => {
        setActiveDropdownId((prev) => (prev === projectId ? null : projectId));
    };

    const handleOpenCreateModal = () => {
        if (!user) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            navigate("/login");
            return;
        }
        setIsCreateModalOpen(true);
    };
    
    // --- START: 로직 수정 ---
    // 기존 handleOpenProject 함수의 내용을 아래와 같이 변경합니다.
    const handleOpenProject = (projectId) => {
        // 1. 로컬 스토리지에서 해당 프로젝트의 마지막 방문 탭 정보를 가져옵니다.
        const lastVisitedTab = localStorage.getItem(`lastVisitedTab_${projectId}`);

        // 2. 마지막 방문 기록이 'query-builder'이면 해당 경로로 이동합니다.
        if (lastVisitedTab === 'query-builder') {
            navigate(`/query-builder/${projectId}`);
        } 
        // 3. 방문 기록이 없거나 'ide'일 경우, 기본값인 IDE 페이지로 이동합니다.
        else {
            navigate(`/editor/${projectId}`);
        }
    };
    // --- END: 로직 수정 ---

    const handleSelectProject = (id) => {
        setSelectedProjectId(id);
        setIsDropdownOpen(false);
    };

    const handleUserProfileClick = () => {
        if (user) {
            navigate("/mypage");
        }
    };

    const handleAddDbConnection = async (dbConfigData) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            navigate("/login");
            return;
        }

        try {
            console.log("DB 연결 추가 요청 데이터:", dbConfigData);
            const res = await axios.post(`${BASE_URL}/api/db-connections`, {
                name: dbConfigData.name,
                url: dbConfigData.url,
                username: dbConfigData.username,
                password: dbConfigData.password,
                driverClassName: dbConfigData.driverClassName,
                projectId: dbConfigData.projectId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const addedConnection = res.data;
            setDbConnections((prev) => [...prev, addedConnection]);

            setProjects((prev) =>
                prev.map((project) =>
                    project.id === addedConnection.projectId ? { ...project, isDbConnected: true } : project
                )
            );
            toast({ title: "DB 연결 성공!", status: "success" });

        } catch (error) {
            console.error("DB 연결 추가 실패:", error);
            toast({
                title: "DB 연결 실패",
                description: error.response?.data?.message || "DB 연결을 추가하는 데 문제가 발생했습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={8} bg="#f9f8f6" minH="100vh" color="text.primary">
            <h1 className="dashboard-title">{t("Dashboard")}</h1>
            {loading ? (
                <div className="loading-indicator">Loading...</div>
            ) : (
                <Grid templateColumns="3fr 1fr" gap={6}>
                    <Box className="dashboard-left">
                        <div className="projects">
                            <div className="projects-header">
                                <div className="projects-header-left">
                                    <FolderIcon className="folder-icon" />
                                    <span>{t("All projects")}</span>
                                </div>
                            </div>

                            {projects.length === 0 ? (
                                <div className="projects-empty-wrapper">
                                    <div className="projects-empty">
                                        <InboxIcon className="empty-icon" />
                                        <p className="empty-text">{t("No projects have been created yet")}</p>
                                        <button className="create-project-btn" onClick={handleOpenCreateModal}>
                                            {t("Create project")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="projects-list">
                                    {projects.map((project) => (
                                        // ✅ 이 부분의 onClick이 handleOpenProject를 호출하는지 확인합니다.
                                        <li key={project.id} className="project-card" onClick={() => handleOpenProject(project.id)}>
                                            <div className="project-card-content">
                                                <h3 className="project-card-name">{project.name}</h3>
                                                <p className="project-card-desc">{project.description}</p>
                                                <div className="project-card-dates">
                                                    <span>{t("created at")}: {new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                                                    <span>{t("upadate at")}: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="more-icon-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDropdown(project.id);
                                                }}
                                            >
                                                <MoreIcon className="more-icon" />
                                            </button>
                                            {activeDropdownId === project.id && (
                                                <ul ref={dropdownRef} className="project-dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <li onClick={() => handleEdit(project.id)}>프로젝트 수정</li>
                                                    <li onClick={() => handleDeleteClick(project.id)}>프로젝트 삭제</li>
                                                    <li onClick={() => handleInvite(project.id)}>멤버 초대</li>
                                                </ul>
                                            )}
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
                                    <div
                                        className="user-profile-container clickable"
                                        onClick={handleUserProfileClick}
                                        role="button"
                                        tabIndex={0}
                                    >
                                    {user.profileUrl?.trim() ? (
                                        <img className="user-profile" src={user.profileUrl} alt="프로필" />
                                    ) : (
                                        <div className="user-initial">{user.nickname?.[0] || "U"}</div>
                                    )}
                                    </div>
                                    <div className="user-info">
                                    <div>{user.name || user.nickname}</div>
                                    <div>{user.email}</div>
                                    </div>
                                </>
                                ): (
                                <>
                                    <div className="user-profile-container">
                                        <UserProfileIcon className="user-profile-icon" />
                                    </div>
                                    <p className="login-title"> {t("Login required")} </p>
                                    <p className="login-desc"> {t("Log in to your account to use the features")} </p>
                                    <div className="user-profile-buttons">
                                        <button className="sign-in-btn" onClick={() => navigate("/login")}>{t("Login")}</button>
                                        <button className="sign-up-btn" onClick={() => navigate("/signup")}>{t("Sign Up")}</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="quick-actions">
                            <h2 className="quick-actions-header">
                                <BoltIcon className="quick-actions-icon" />
                                {t("Fast action")}
                            </h2>
                            <div className="quick-action-item" onClick={handleOpenCreateModal} role="button" tabIndex={0}>
                                <PlusIcon className="quick-action-icon plus" />
                                <p className="quick-action-title">{t("New query project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={user ? onOpen : undefined} role="button" tabIndex={0}>
                                <RecentIcon className="quick-action-icon recent-project" />
                                <p className="quick-action-title">{t("Recent project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <RecentProjectsModal
                                isOpen={isOpen}
                                onClose={onClose}
                                projects={projects}
                                onSelect={handleOpenProject}
                            />

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
                                        ? projects.find((p) => p.id === selectedProjectId)?.name
                                        : t("All projects")}
                                </button>

                                {isDropdownOpen && (
                                    <ul className="status-dropdown-menu">
                                        <li onClick={() => handleSelectProject(null)}>{t("All projects")}</li>
                                        {projects.map((p) => (
                                            <li key={p.id} onClick={() => handleSelectProject(p.id)}>
                                                {p.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="status-list">
                                <div className="status-item">
                                    <FolderIcon className="status-item-icon file" />
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
                onNext={handleCreateProject}
            />

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={editTargetProject}
                onSave={handleSaveProject}
            />

            <DeleteProjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                project={deleteTargetProject}
            />

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                project={inviteTargetProject}
            />
        </Box>
    );
};

export default Dashboard;