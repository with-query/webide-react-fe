const mockDbConnections = [
  {
    id: 1,
    projectId: 1,
    name: "MySQL 개발 서버",
    type: "MySQL",
    host: "dev.mysql.local",
    port: 3306,
    username: "root",
    database: "dev_db",
  },
  {
    id: 2,
    projectId: 2,
    name: "PostgreSQL 테스트",
    type: "PostgreSQL",
    host: "test.pg.local",
    port: 5432,
    username: "admin",
    database: "test_db",
  },
];

export default mockDbConnections;