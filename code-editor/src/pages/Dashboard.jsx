import { useEffect, useState } from "react";
import mockProjects from "../mock/mockProjects";
import mockUser from "../mock/mockUser";
import mockDbConnections from "../mock/mockDbConnections";
import mockDbSchemas from "../mock/mockDbSchemas";
//import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@chakra-ui/react";
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

const Dashboard = () => {    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectCount, setProjectCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [tableItemCount, setTableItemCount] = useState(0);

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

    const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

    const handleOpenProjectModal = () => {
        alert("프로젝트 생성 모달을 여는 기능은 아직 구현되지 않았습니다.");
    };

    const setIsChatModalOpen = (value) => {
        alert("팀 채팅 기능은 아직 구현되지 않았습니다.");
    };

    const handleSelectProject = (id) => {
        setSelectedProjectId(id);
        setIsDropdownOpen(false);
    };

    return (
        <Box p={8} bg="#f9f8f6" minH="100vh">
            <h1 className="dashboard-title">대시보드</h1>
            {loading ? (
                <div className="loading-indicator">Loading...</div>
                ) : (
                <Grid templateColumns="3fr 1fr" gap={6}>
                    <Box className="dashboard-left">

                        <div className="recent-projects">
                            <div className="recent-projects-header">
                                <div className="recent-projects-header-left">
                                    <FolderIcon className="folder-icon" />
                                    <span>최근 프로젝트</span>
                                </div>
                                <button className="recent-projects-view-all">모두 보기</button>
                            </div>

                            {projects.length === 0 ? (
                                <div className="recent-projects-empty-wrapper">
                                    <div className="recent-projects-empty">
                                        <InboxIcon className="empty-icon" />
                                        <p className="empty-text">아직 생성된 프로젝트가 없습니다</p>
                                        <button className="create-project-btn">프로젝트 생성</button>
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
                                    <p className="login-title"> 로그인이 필요합니다. </p>
                                    <p className="login-desc"> 계정에 로그인하여 기능을 이용해보세요 </p>
                                    <div className="user-profile-buttons">
                                        <button className="sign-in-btn">로그인</button>
                                        <button className="sign-up-btn">회원가입</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="quick-actions">
                            <h2 className="quick-actions-header">
                                <BoltIcon className="quick-actions-icon" />
                                빠른 액션
                            </h2>
                            <div className="quick-action-item" onClick={handleOpenProjectModal} role="button" tabIndex={0}>
                                <PlusIcon className="quick-action-icon plus"  />
                                <p className="quick-action-title">새 쿼리 프로젝트</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && navigate("/workspace")} role="button" tabIndex={0}>
                                <RecentIcon className="quick-action-icon recent-project" />
                                <p className="quick-action-title">최근 프로젝트 열기</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && setIsChatModalOpen(true)} role="button" tabIndex={0}>
                                <ChatIcon className="quick-action-icon chat" />
                                <p className="quick-action-title">팀 채팅</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                        </div>

                        <div className="status">
                            <h2>
                                <PieIcon className="status-icon" />
                                사용 현황
                            </h2>
                            <div 
                                className="status-dropdown"
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <button className="status-dropdown-toggle">
                                    {selectedProjectId 
                                        ? projects.find(p => p.id === selectedProjectId)?.name 
                                        : "전체 프로젝트"}
                                </button>

                                {isDropdownOpen && (
                                    <ul className="status-dropdown-menu">
                                        <li onClick={() => handleSelectProject(null)}>전체 프로젝트</li>
                                        {projects.map(p => (
                                            <li key={p.id} onClick={() => handleSelectProject(p.id)}>{p.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="staus-list">
                                <div className="status-item">
                                    <FileIcon className="status-item-icon file" />
                                    <p className="status-item-title">총 프로젝트 수</p>
                                    <p className="status-item-value">{projectCount}</p>
                                </div>

                                <div className="status-item">
                                    <CodeIcon className="status-item-icon code" />
                                    <p className="status-item-title">총 쿼리 수</p>
                                    <p className="status-item-value">{queryCount}</p>
                                </div>

                                <div className="status-item">
                                    <TableIcon className="status-item-icon table" />
                                    <p className="status-item-title">테이블 항목</p>
                                    <p className="status-item-value">{tableItemCount}</p>
                                </div>
                            </div>
                        </div>
                    </Box>
                </Grid>
            )}
        </Box>
    );
};

export default Dashboard;