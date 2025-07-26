import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@chakra-ui/react";
import "../styles/dashboard.css";

const Dashboard = () => {    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [projectCount, setProjectCount] = useState(0);
    const [queryCount, setQueryCount] = useState(0);
    const [tableItemCount, setTableItemCount] = useState(0);

    useEffect(() => {
        axios.get("/api/projects")
        .then((res) => {
            setProjects(res.data); 
        })
        .catch((err) => {
            console.error("프로젝트 목록 조회 실패", err);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        axios.get("/api/user/me")
            .then((res) => {
            setUser(res.data);
            })
            .catch(() => {
            setUser(null);
            });
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const projectRes = await axios.get("/api/projects");
                const projects = projectRes.data;

                const totalProjects = projects.length;
                let totalQueries = 0;

                projects.forEach((project) => {
                    project.files?.forEach((file) => {
                        if (file.name.endsWith(".sql")) totalQueries++;
                    });
                });

                const dbRes = await axios.get("/api/db-connections");
                let totalTables = 0;

                for (const db of dbRes.data) {
                    const schemaRes = await axios.get(`/api/db-connections/${db.id}/schemas`);
                    totalTables += schemaRes.data.tables?.length || 0;
                }

                setProjectCount(totalProjects);
                setQueryCount(totalQueries);
                setTableItemCount(totalTables);
            } catch (e) {
                console.error("사용 현황 조회 실패", e);
            }
        };
        fetchStatus();
    }, []);

    const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

    const handleOpenProjectModal = () => {
        alert("프로젝트 생성 모달을 여는 기능은 아직 구현되지 않았습니다.");
    };

    const setIsChatModalOpen = (value) => {
        alert("팀 채팅 기능은 아직 구현되지 않았습니다.");
    };

    const handleProjectChange = (e) => {
        const selectedProjectId = e.target.value;
        console.log("선택된 프로젝트 ID:", selectedProjectId);
    };

    return (
        <Box p={8} bg="#f9f8f6" minH="100vh">
            {loading ? (
                <div className="loading-indicator">Loading...</div>
                ) : (
                <Grid templateColumns="3fr 1fr" gap={6}>
                    <Box className="dashboard-left">
                        <h1 className="dashboard-title">
                            대시보드
                        </h1>

                        <div className="recent-projects">
                            <div className="recent-projects-header">
                                <div className="recent-projects-header-left">
                                    <img className="folder-icon" src="/icons/folder.svg" alt="최근 프로젝트 아이콘" />
                                    <span>최근 프로젝트</span>
                                </div>
                                <button className="recent-projects-view-all">모두 보기</button>
                            </div>

                            {projects.length === 0 ? (
                                <div className="recent-projects-empty">
                                    <img className="empty-icon" src="/icons/empty-box.svg" alt="빈 프로젝트 안내 아이콘" />
                                    <p className="empty-text">아직 생성된 프로젝트가 없습니다</p>
                                    <button className="create-project-btn">프로젝트 생성</button>
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
                                    <img className="user-profile" src={user.profileUrl || "/icons/user-default.svg"} alt="프로필" />
                                    <p className="user-name">{user.name}</p>
                                    <p className="user-email">{user.email}</p>
                                </>
                            ) : (
                                <>
                                    <img className="user-profile" src="/icons/user-default.svg" alt="유저 프로필 아이콘" />
                                    <p> 로그인이 필요합니다. </p>
                                    <p> 계정에 로그인하여 기능을 이용해보세요 </p>
                                    <div className="user-profile-buttons">
                                        <button className="sign-in-btn">로그인</button>
                                        <button className="sign-up0btn">회원가입</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="quick-actions">
                            <h2 className="quick-actions-header">
                                <img className="quick-actions-icon" src="/icons/bolt.svg" alt="빠른 액션 아이콘" />
                                빠른 액션
                            </h2>
                            <div className="quick-action-item" onClick={handleOpenProjectModal} role="button" tabIndex={0}>
                                <img className="quick-action-icon-plus" src="/icons/plus.svg" alt="새 쿼리 프로젝트" />
                                <p className="quick-action-title">새 쿼리 프로젝트</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && navigate("/workspace")} role="button" tabIndex={0}>
                                <img className="quick-action-icon-chart" src="/icons/chart.svg" alt="최근 프로젝트" />
                                <p className="quick-action-title">최근 프로젝트 열기</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                            <div className="quick-action-item" onClick={() => user && setIsChatModalOpen(true)} role="button" tabIndex={0}>
                                <img className="quick-action-icon-chat" src="/icons/chat.svg" alt="팀 채팅" />
                                <p className="quick-action-title">팀 채팅</p>
                                <p className="quick-action-arrow">&gt;</p>
                            </div>
                        </div>

                        <div className="status">
                            <h2>
                                <img className="status-icon" src="/icons/pie.svg" alt="현황"/>
                                사용 현황
                            </h2>
                            <select className="project-selector" onChange={handleProjectChange}>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="staus-list">
                                <div className="status-item">
                                    <img className="status-item-icon" src="/icons/folder.svg" alt="총 프로젝트 수" />
                                    <p className="status-item-title">총 프로젝트 수</p>
                                    <p className="status-item-value">{projectCount}</p>
                                </div>

                                <div className="status-item">
                                    <img className="status-item-icon" src="/icons/code.svg" alt="총 쿼리 수"/>
                                    <p className="status-item-title">총 쿼리 수</p>
                                    <p className="status-item-value">{queryCount}</p>
                                </div>

                                <div className="status-item">
                                    <img className="status-item-icon" src="/icons/table.svg" alt="테이블 항목" />
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