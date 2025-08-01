import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid,useDisclosure } from "@chakra-ui/react";

import { mockProjects, mockUser, mockDbConnections, mockDbSchemas } from "@/mock/mockData";
//import axios from "axios";

import "../styles/dashboard.css";
import BoltIcon from "@/components/icons/BoltIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import RecentIcon from "@/components/icons/RecentIcon";
import TableIcon from "@/components/icons/TableIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import PieIcon from "@/components/icons/PieIcon";
import FileIcon from "@/components/icons/FileIcon";
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
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
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

    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- API 연동 부분 ---
                // // 1. 유저 정보 조회
                // const userResponse = await axios.get("/api/user/me");
                // const currentUser = userResponse.data;
                // setUser(currentUser);

                // // 2. 유저 정보가 있으면 프로젝트 목록 조회
                // if (currentUser) {
                //     const projectsResponse = await axios.get(`/api/projects?userId=${currentUser.id}`);
                //     setProjects(projectsResponse.data);
                // }
                // --- API 연동 부분 끝 ---

                // mock 데이터로 API 호출 시뮬레이션
                const currentUser = mockUser;
                setUser(currentUser);
                if (currentUser) {
                    const userProjects = mockProjects.filter(p => p.userId === currentUser.id);
                    setProjects(userProjects);
                }

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                setUser(null);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
                    const projectExists = projects.some(p => p.id === conn.projectId);
                    if (projectExists) {
                        const schema = mockDbSchemas[conn.id];
                        if (schema?.tables?.length) {
                            totalTables += schema.tables.length;
                        }
                    }
                });
            }
            setProjectCount(totalProjects);
            setQueryCount(totalQueries);
            setTableItemCount(totalTables);
        };
        fetchProjectStatus();
    }, [selectedProjectId, projects]);

    useEffect(() => {
        // 바깥 클릭을 감지하는 함수
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null); // 메뉴를 닫습니다.
            }
        };

        if (activeDropdownId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDropdownId]);

    // EditProjectModal에서 '저장'을 눌렀을 때 실행될 함수
    const handleSaveProject = (updatedData) => {
        // 실제 API 연동 시 주석 해제하여 사용
        // try {
        //   await axios.put(`/api/projects/${updatedData.id}`, {
        //     newName: updatedData.newName,
        //     newDescription: updatedData.newDescription
        //   });
        // } catch (error) {
        //   console.error("프로젝트 수정 실패:", error);
        //   alert("프로젝트 수정에 실패했습니다.");
        //   return; // 에러 발생 시 함수 종료
        // }
        setProjects(prevProjects =>
            prevProjects.map(project => {
                if (project.id === updatedData.id) {
                    return {
                    ...project, 
                    name: updatedData.newName,
                    description: updatedData.newDescription,
                    };
                }
                
                return project;
            })
        );
        setIsEditModalOpen(false);
    };

    // '수정' 버튼 클릭 시, 수정할 프로젝트 객체 전체를 상태에 저장
    const handleEdit = (projectId) => {
        const projectToEdit = projects.find(p => p.id === projectId);
        if (projectToEdit) {
            setEditTargetProject(projectToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteClick = (projectId) => {
        const projectToDelete = projects.find(p => p.id === projectId);
        if (projectToDelete) {
            setDeleteTargetProject(projectToDelete);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (deleteTargetProject) {
            setProjects(projects.filter(p => p.id !== deleteTargetProject.id));
            setIsDeleteModalOpen(false);
            setDeleteTargetProject(null);
        }
    };

    const handleInvite = (projectId) => {
        const projectToInvite = projects.find(p => p.id === projectId);
        if (projectToInvite) {
            setInviteTargetProject(projectToInvite); 
            setIsInviteModalOpen(true);;
        };
    }

    //프로젝트 리스트 더보기
    const toggleDropdown = (projectId) => {
        setActiveDropdownId(prev => prev === projectId ? null : projectId);
    };

    //비로그인 사용자 프로젝트 생성 버튼 사용시, 로그인 안내
    const handleOpenCreateModal = () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        setIsCreateModalOpen(true);
    };

    //프로젝트 열기
    const handleOpenProject = (projectId) => {
        navigate(`/editor/${projectId}`);
    };

    //프로젝트 선택 변경
    const handleSelectProject = (id) => {
        setSelectedProjectId(id);
        setIsDropdownOpen(false);
    };
    //마이페이지 이동
    const handleUserProfileClick = () => {
        if (user) {
            navigate("/mypage");
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
                                                    toggleDropdown(project.id)
                                                }}
                                            >
                                                <MoreIcon className="more-icon"/>
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
                            <div className="quick-action-item" onClick={handleOpenCreateModal} role="button" tabIndex={0}>
                                <PlusIcon className="quick-action-icon plus"  />
                                <p className="quick-action-title">{t("New query project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            {/*<div className="quick-action-item" onClick={() => user && navigate("/workspace")} role="button" tabIndex={0}>
                                <RecentIcon className="quick-action-icon recent-project" />
                                <p className="quick-action-title">{t("Recent project")}</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>*/}
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
                            <div className="status-list">
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

                    try { // 🎨 try 블록 시작
                        console.log("프로젝트 생성 요청 데이터:", data);
                        const newProject = {
                            id: Date.now(),
                            name: data.name,
                            description: data.description,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            role: "OWNER",
                            files: [],
                        };

                        setProjects(prev => [newProject, ...prev]);

                        if (data.dbConnected) {
                            console.log("DB 연결을 시도합니다:", data.dbConfig);
                            // await axios.post(`/api/db-connections`, { ... }); 
                            console.log("DB 연결과 함께 프로젝트가 생성되었습니다. 쿼리 빌더로 이동합니다.");
                            navigate("/Workspace");
                        } else {
                            console.log("DB 연결 없이 프로젝트만 생성되었습니다. 에디터로 이동합니다.");
                            // await axios.post(`/api/projects/${newProject.id}/invitations`, { emails: data.invitedEmails });
                            navigate(`/Editor/${newProject.id}`);
                        } 
                        if (data.invitedEmails && data.invitedEmails.length > 0) {
                            console.log("멤버를 초대합니다:", data.invitedEmails);
                            // await axios.post(`/api/projects/${newProject.id}/invitations`, { emails: data.invitedEmails });
                        }
                    } catch (error) {
                        console.error("프로젝트 생성 실패:", error);
                        alert("프로젝트 생성에 실패했습니다.");
                    }
                }}
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