export const mockUser = {
  id: "user-123", // 사용자 고유 ID
  name: "쿼리랑",
  email: "test@example.com",
  profileUrl: "",
};

export const mockProjects = [
  {
    id: 1,
    userId: "user-123", // 이 프로젝트의 소유자
    name: "SQL 시각화 프로젝트",
    createdAt: "2025-07-25",
    files: [
      { name: "user_analysis.sql" },
      { name: "sales_report.sql" },
      { name: "notes.md" },
    ],
  },
  {
    id: 2,
    userId: "user-123", // 이 프로젝트의 소유자
    name: "고객 데이터 분석",
    createdAt: "2025-07-24",
    files: [
      { name: "segmentation_query.sql" },
      { name: "project_schema.json" },
    ],
  },
  {
    id: 3,
    userId: "user-789", // 다른 사용자의 프로젝트
    name: "경쟁사 분석 리포트",
    createdAt: "2025-07-23",
    files: [
      { name: "competitor_A.sql" },
      { name: "competitor_B.sql" },
      { name: "competitor_C.sql" },
    ],
  }
];

export const mockDbConnections = [
  {
    id: 1,
    projectId: 1,
    name: "MySQL 개발 서버",
    type: "mysql",
    host: "dev.mysql.local",
    port: 3306,
    username: "root",
    database: "dev_db",
  },
  {
    id: 2,
    projectId: 2,
    name: "PostgreSQL 테스트",
    type: "postgres",
    host: "test.pg.local",
    port: 5432,
    username: "admin",
    database: "test_db",
    schema: "public",
    searchPath: "public, test"
  },
  {
    id: 3,
    projectId: 3,
    name: "PostgreSQL 테스트",
    type: "postgres",
    host: "test.pg.local",
    port: 5432,
    username: "user-789",
    database: "test_db",
    schema: "cc",
    searchPath: "public, test",
  }
];

export const mockDbSchemas = {
  1: { tables: [{ name: "users" }, { name: "products" }] },
  2: { tables: [{ name: "clients" }, { name: "contracts" }] },
};

export const mockMembers = [
  { id: 1, name: '페퍼로니', avatar: null },
  { id: 2, name: '아메리카노', avatar: null },
  { id: 3, name: '호빵', avatar: null },
];