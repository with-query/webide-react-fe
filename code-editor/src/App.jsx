
// src/App.jsx
import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

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
      <Header />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ide" element={<Editor />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/query-builder" element={<Workspace />} />
        <Route path="/DBConnect" element={<DBConnect />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
