import { useNavigate } from "react-router-dom";
import { Button, VStack, Heading } from "@chakra-ui/react";

function Dashboard() {
  const navigate = useNavigate();

  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  return (
    <VStack p={10}>
      <Heading>대시보드</Heading>
      <Button onClick={() => handleOpenProject("myProject1")}>
        myProject1 열기
      </Button>
      
    </VStack>
  );
}

export default Dashboard;
