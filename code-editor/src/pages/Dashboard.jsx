import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, useDisclosure, useToast, Avatar, Center, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from '../contexts/AuthContext'; 

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
import { useTranslation } from "react-i18next";
import RecentProjectsModal from "@/components/modals/RecentProjectsModal";

const Dashboard = () => {
    const { user } = useAuth(); // AuthContext의 user만 사용
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [dbConnections, setDbConnections] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editTargetProject, setEditTargetProject] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetProject, setDeleteTargetProject] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteTargetProject, setInviteTargetProject] = useState(null);

    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const [projectCount, setProjectCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [tableItemCount, setTableItemCount] = useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const { isLoggedIn, openLoginModal, isInitialized } = useAuth(); 

    const BASE_URL = "http://20.196.89.99:8080";

    useEffect(() => {
        const fetchDashboardData = async () => {
            // AuthContext가 localStorage에서 토큰을 읽어올 때까지 기다립니다.
            if (!isInitialized) return;

            if (!isLoggedIn) {
                openLoginModal();
                setLoading(false);
                return;
            }

            setLoading(true);
            // ✅ 모든 토큰 조회를 일관된 키로 변경합니다.
            const token = localStorage.getItem('token');
            try {
                const [projectsRes, dbConnectionsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/api/db-connections`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                //setUser(userRes.data);
                setProjects(projectsRes.data);
                setDbConnections(dbConnectionsRes.data);

            } catch (error) {
                console.error("대시보드 데이터 로딩 실패:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    //window.location.reload();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isLoggedIn, isInitialized, navigate, openLoginModal]); 

    useEffect(() => {
        const calculateUsageStatus = async () => {
            setProjectCount(projects.length);

            const token = localStorage.getItem("token"); // ✅ 키 변경
            if (!token) {
                setTableItemCount(0);
                setQueryCount(0);
                return;
            }

            // --- 1. 테이블 수 계산 ---
            let totalTables = 0;
            const schemaPromises = dbConnections.map(conn =>
                axios.get(`${BASE_URL}/api/db-connections/${conn.id}/schemas`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ data: [] }))
            );
            const schemaResults = await Promise.all(schemaPromises);
            schemaResults.forEach(res => {
                if (res.data && Array.isArray(res.data)) {
                    totalTables += res.data.length;
                }
            });
            setTableItemCount(totalTables);

            // --- 2. 쿼리(.sql 파일) 수 계산 ---
            let totalSqlFiles = 0;
            const filePromises = projects.map(p =>
                axios.get(`${BASE_URL}/api/projects/${p.id}/files`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ data: [] }))
            );
            
            const countSqlFiles = (nodes) => {
                let count = 0;
                for (const node of nodes) {
                    if (node.type === 'file' && node.name.endsWith('.sql')) {
                        count++;
                    }
                    if (node.children) {
                        count += countSqlFiles(node.children);
                    }
                }
                return count;
            };

            const fileResults = await Promise.all(filePromises);
            fileResults.forEach(res => {
                if (res.data && Array.isArray(res.data)) {
                    totalSqlFiles += countSqlFiles(res.data);
                }
            });
            setQueryCount(totalSqlFiles);
        };

        if (isLoggedIn) {
            calculateUsageStatus();
        }
    }, [projects, dbConnections, isLoggedIn]);

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
        const token = localStorage.getItem("token"); // ✅ 키 변경
        if (!token) {
            toast({ title: "로그인이 필요합니다.", status: "warning" });
            navigate("/login");
            return;
        }

        try {
            const projectRes = await axios.post(`${BASE_URL}/api/projects`, {
                name: data.name,
                description: data.description,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const newProject = projectRes.data;
            setProjects((prev) => [newProject, ...prev]);
            setIsCreateModalOpen(false);

            if (data.dbConnected) {
                let dbConnectionPayload = {
                    projectId: newProject.id,
                    name: data.dbConfig.dbName || data.name + " DB Connection",
                    url: '',
                    username: data.dbConfig.user || data.dbConfig.username,
                    password: data.dbConfig.password,
                    driverClassName: '',
                    createdById: user?.id
                };

                console.log("최종 전송 데이터:", dbConnectionPayload); 
                console.log("사용자 객체:", user);

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
                        toast({ title: "DB 연결 실패", description: "지원하지 않는 DB 타입입니다.", status: "error" });
                        return;
                }

                const dbConnectionRes = await axios.post(`${BASE_URL}/api/db-connections`, dbConnectionPayload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setDbConnections((prev) => [...prev, dbConnectionRes.data]);
                toast({ title: "프로젝트 생성 및 DB 연결 완료", status: "success" });
                handleOpenProject(newProject.id);

            } else {
                toast({ title: "프로젝트 생성 완료", status: "success" });
                handleOpenProject(newProject.id);
            }

        } catch (error) {
            console.error("프로젝트 생성 실패:", error);
            toast({
                title: "프로젝트 생성 실패",
                description: error.response?.data?.message || "새 프로젝트를 생성하는 데 문제가 발생했습니다.",
                status: "error",
            });
        }
    };

    const handleSaveProject = async (updatedData) => {
        const token = localStorage.getItem("token"); // ✅ 키 변경
        if (!token || !editTargetProject) {
            toast({ title: "수정할 프로젝트를 찾을 수 없습니다.", status: "error" });
            return;
        }

        try {
            const res = await axios.put(`${BASE_URL}/api/projects/${editTargetProject.id}`, {
                newName: updatedData.newName,
                newDescription: updatedData.newDescription,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                setProjects((prevProjects) =>
                    prevProjects.map((project) => 
                        project.id === editTargetProject.id 
                        ? { ...project, name: updatedData.newName, description: updatedData.newDescription, updatedAt: new Date().toISOString() } 
                        : project
                    )
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
        const token = localStorage.getItem("token"); // ✅ 키 변경
        if (!token || !deleteTargetProject) {
            toast({ title: "삭제할 프로젝트를 찾을 수 없습니다.", status: "error" });
            return;
        }

        try {
        // 1. 삭제할 프로젝트에 연결된 DB 커넥션을 찾습니다.
        const connectionToDelete = dbConnections.find(
            (conn) => conn.projectId === deleteTargetProject.id
        );
        
        // 2. 만약 연결된 DB가 있다면, 그것부터 삭제합니다.
        if (connectionToDelete) {
            await axios.delete(
                `${BASE_URL}/api/db-connections/${connectionToDelete.id}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }

        // 3. 그리고 나서 프로젝트를 삭제합니다.
        await axios.delete(
            `${BASE_URL}/api/projects/${deleteTargetProject.id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setProjects(projects.filter((p) => p.id !== deleteTargetProject.id));
        if (connectionToDelete) {
             setDbConnections(dbConnections.filter((conn) => conn.id !== connectionToDelete.id));
        }
        toast({ title: "프로젝트 삭제 완료", status: "success" });

        } catch (error) {
            console.error("프로젝트 삭제 실패:", error);
            toast({
                title: "프로젝트 삭제 실패",
                description: error.response?.data?.message || "프로젝트를 삭제하는 데 문제가 발생했습니다.",
                status: "error",
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
            openLoginModal();
            return;
        }
        setIsCreateModalOpen(true);
    };
    
    const handleOpenProject = (projectId) => {
        const lastVisitedTab = localStorage.getItem(`lastVisitedTab_${projectId}`);
        if (lastVisitedTab === 'query-builder') {
            navigate(`/query-builder/${projectId}`);
        } else {
            navigate(`/editor/${projectId}`);
        }
    };

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
        const token = localStorage.getItem("token"); // ✅ 키 변경
        if (!token) {
            openLoginModal();
            return;
        }
        // ... (이하 로직 동일)
    };

    if (!isInitialized) {
        return (
            <Center h="calc(100vh - 60px)">
                <Spinner size="xl" />
            </Center>
        );
    }
    
    return (
        <Box p={8} bg="#f9f8f6" minH="100vh" color="text.primary">
            <h1 className="dashboard-title">{t("Dashboard")}</h1>
            {loading ? (
                <Center h="50vh"><Spinner size="xl" /></Center>
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
                                     <Avatar width="100%" height="100%" src={user.profileUrl || "/profile.png"}  background="#d57239" />
                                    </div>
                                    <div className="user-info">
                                        <div>{user.name || user.nickname}</div>
                                        <div>{user.email}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="user-profile-container">
                                        <UserProfileIcon className="user-profile-icon" />
                                    </div>
                                    <p className="login-title"> {t("Login required")} </p>
                                    <p className="login-desc"> {t("Log in to your account to use the features")} </p>
                                    <div className="user-profile-buttons">
                                        <button className="sign-in-btn" onClick={openLoginModal}>{t("Login")}</button>
                                        {/* <button className="sign-up-btn" onClick={() => navigate("/signup")}>{t("Sign Up")}</button> */}
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

                            <div className="quick-action-item"onClick={() => user && navigate('/chat')} role="button" tabIndex={0}>
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
