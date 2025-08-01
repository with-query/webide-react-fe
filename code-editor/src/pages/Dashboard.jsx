import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, useDisclosure } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// mock 데이터는 백업용으로 유지
import { mockUser, mockDbConnections, mockDbSchemas } from "@/mock/mockData";

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

// DBConnect 컴포넌트 임포트
import DBConnect from "./DBConnect";

// API 기본 설정
const API_BASE_URL = "http://20.196.89.99:8080";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const { t } = useTranslation();

  // API 함수들
  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      return response.data;
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
      throw error;
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updateData) => {
    try {
      const response = await api.put(`/api/projects/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/api/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      throw error;
    }
  };

  const fetchDbConnections = async () => {
    try {
      const response = await api.get('/api/db-connections');
      return response.data;
    } catch (error) {
      console.error('DB 연결 조회 실패:', error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 토큰 확인
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          // 토큰이 없으면 mock 데이터 사용 (비로그인 상태)
          setUser(null);
          setProjects([]);
          setDbConnections([]);
          setLoading(false);
          return;
        }

        // 병렬로 데이터 가져오기
        const [userProfile, projectsData, dbConnectionsData] = await Promise.all([
          fetchUserProfile(),
          fetchProjects(),
          fetchDbConnections().catch(() => []) // DB 연결은 실패해도 계속 진행
        ]);

        setUser(userProfile);
        
        // 프로젝트에 DB 연결 상태 추가
        const projectsWithDbStatus = projectsData.map((project) => ({
          ...project,
          isDbConnected: dbConnectionsData.some((conn) => conn.projectId === project.id),
        }));

        setProjects(projectsWithDbStatus);
        setDbConnections(dbConnectionsData);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setError("데이터를 불러오는데 실패했습니다.");
        
        // API 실패 시 mock 데이터로 폴백
        if (error.response?.status !== 401) {
          setUser(mockUser);
          setProjects([]);
          setDbConnections(mockDbConnections);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 프로젝트 상태 계산
  useEffect(() => {
    const fetchProjectStatus = () => {
      let filteredProjects = projects;
      if (selectedProjectId !== null) {
        filteredProjects = projects.filter((p) => p.id === selectedProjectId);
      }
      
      const totalProjects = selectedProjectId === null ? projects.length : 1;
      let totalQueries = 0;
      
      filteredProjects.forEach((project) => {
        project.files?.forEach((file) => {
          if (file.name.endsWith(".sql")) {
            totalQueries++;
          }
        });
      });

      let totalTables = 0;
      if (selectedProjectId !== null) {
        const dbConn = dbConnections.find((conn) => conn.projectId === selectedProjectId);
        const schema = mockDbSchemas[dbConn?.id];
        totalTables = schema?.tables?.length || 0;
      } else {
        dbConnections.forEach((conn) => {
          const projectExists = projects.some((p) => p.id === conn.projectId);
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
  }, [selectedProjectId, projects, dbConnections]);

  // 드롭다운 외부 클릭 감지
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

  // 프로젝트 생성 핸들러
  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject({
        ...projectData,
        id: uuidv4(), // 임시 ID, 서버에서 실제 ID 생성
      });
      
      setProjects((prevProjects) => [...prevProjects, {
        ...newProject,
        isDbConnected: false
      }]);
      
      setIsCreateModalOpen(false);
      return newProject;
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    }
  };

  // 프로젝트 수정 핸들러
  const handleSaveProject = async (updatedData) => {
    try {
      const updatedProject = await updateProject(updatedData.id, {
        name: updatedData.newName,
        description: updatedData.newDescription,
      });

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === updatedData.id) {
            return {
              ...project,
              name: updatedData.newName,
              description: updatedData.newDescription,
              updatedAt: updatedProject.updatedAt || new Date().toISOString(),
            };
          }
          return project;
        })
      );
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      alert('프로젝트 수정에 실패했습니다.');
    }
  };

  // 프로젝트 삭제 핸들러
  const handleConfirmDelete = async () => {
    if (!deleteTargetProject) return;

    try {
      await deleteProject(deleteTargetProject.id);
      
      setProjects(projects.filter((p) => p.id !== deleteTargetProject.id));
      setDbConnections((prev) => prev.filter((conn) => conn.projectId !== deleteTargetProject.id));
      
      setIsDeleteModalOpen(false);
      setDeleteTargetProject(null);
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // 수정 버튼 핸들러
  const handleEdit = (projectId) => {
    const projectToEdit = projects.find((p) => p.id === projectId);
    if (projectToEdit) {
      setEditTargetProject(projectToEdit);
      setIsEditModalOpen(true);
    }
  };

  // 삭제 버튼 핸들러
  const handleDeleteClick = (projectId) => {
    const projectToDelete = projects.find((p) => p.id === projectId);
    if (projectToDelete) {
      setDeleteTargetProject(projectToDelete);
      setIsDeleteModalOpen(true);
    }
  };

  // 초대 버튼 핸들러
  const handleInvite = (projectId) => {
    const projectToInvite = projects.find((p) => p.id === projectId);
    if (projectToInvite) {
      setInviteTargetProject(projectToInvite);
      setIsInviteModalOpen(true);
    }
  };

  // 드롭다운 토글
  const toggleDropdown = (projectId) => {
    setActiveDropdownId((prev) => (prev === projectId ? null : projectId));
  };

  // 프로젝트 생성 모달 열기
  const handleOpenCreateModal = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsCreateModalOpen(true);
  };

  // 프로젝트 열기
  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  // 프로젝트 선택 변경
  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setIsDropdownOpen(false);
  };

  // 마이페이지 이동
  const handleUserProfileClick = () => {
    if (user) {
      navigate("/mypage");
    }
  };

  // DB 연결 추가 핸들러
  const handleAddDbConnection = (newConnection) => {
    setDbConnections((prev) => [...prev, newConnection]);
    setProjects((prev) =>
      prev.map((project) =>
        project.id === newConnection.projectId 
          ? { ...project, isDbConnected: true } 
          : project
      )
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="dashboard-error">
        <div>{error}</div>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

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

          try {
            console.log("프로젝트 생성 요청 데이터:", data);
            const newProject = {
              id: Date.now(), // 고유한 ID 생성
              name: data.name,
              description: data.description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              role: "OWNER", // 기본 역할
              files: [],
              isDbConnected: data.dbConnected, // DB 연결 여부 플래그 추가
            };

            // 새 프로젝트를 기존 프로젝트 목록에 추가
            setProjects((prev) => [newProject, ...prev]);

            if (data.dbConnected) {
              console.log("DB 연결을 시도합니다:", data.dbConfig);
              const newDbConnection = {
                id: uuidv4(), // DB 연결 ID
                projectId: newProject.id,
                type: data.dbType,
                host: data.dbConfig.host,
                port: data.dbConfig.port,
                database: data.dbConfig.dbName,
                username: "testuser", // 예시
                password: "testpassword", // 예시
              };
              // Dashboard의 dbConnections 상태에 추가
              setDbConnections((prev) => [...prev, newDbConnection]);
              console.log("DB 연결과 함께 프로젝트가 생성되었습니다. 쿼리 빌더로 이동합니다.");
              navigate(`/Workspace`); // navigate에 template literal 사용
            } else {
              console.log("DB 연결 없이 프로젝트만 생성되었습니다. 에디터로 이동합니다.");
              navigate(`/Editor/${newProject.id}`); // navigate에 template literal 사용
            }
            if (data.invitedEmails && data.invitedEmails.length > 0) {
              console.log("멤버를 초대합니다:", data.invitedEmails);
              // 초대 로직 (현재 mock)
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