import { Box, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

// ✅ props로 output과 isError를 직접 전달받습니다.
const Output = ({ output, isError }) => {
  const { t } = useTranslation();

  const placeholder = t('Click "Run Code" to see the output here');

  return (
    <Box
      height="100%" // 부모 컨테이너의 높이를 100% 채웁니다.
      p={2}
      color={isError ? "red.400" : ""}
      bg="white"
      fontFamily="monospace"
    >
      {output
        ? output.map((line, i) => <Text key={i}>{line}</Text>)
        : placeholder}
    </Box>
  );
};

export default Output;
