
// src/App.jsx
import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext"; 
import Header from "./components/layout/Header";
//import QueryBuilder from "./pages/QueryBuilder";
//import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Chat from "./pages/Chat";
import MyPage from "./pages/MyPage";
import Workspace from "./pages/Workspace/Workspace";
import DBConnect from "./pages/DBConnect";



function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/DBConnect" element={<DBConnect />} />
            
            <Route path="/ide" element={<Editor />} />
            <Route path="/editor/:projectId" element={<Editor />} />
            <Route path="/query-builder/:projectId" element={<Workspace />} />
            <Route path="/query-builder/:projectId/:dbConnectionId" element={<Workspace />} />
            <Route path="*" element={<div>페이지를 찾을 수 없습니다 (404)</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
