import React, { useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-sql"; // SQL 문법 하이라이트용
import "prismjs/themes/prism.css"; // 기본 Prism 테마 (커스터마이징 가능)
import "../styles/prism-custom.css"
import { useTranslation } from "react-i18next";


const CodeEditor = () => {
  const { t } = useTranslation();
  const [sql, setSql] = useState(`SELECT
  c.customer_id,
  c.customer_name,
  c.email,
  o.order_date,
  p.product_name,
  oi.quantity,
  oi.price
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_date >= '2023-01-01'
ORDER BY`);

  const handleRun = () => {
    console.log("쿼리 실행:", sql);
  };

  return (
    <Box flex="1" p={4} bg="brand.100" borderRadius="md" boxShadow="sm">
      <Flex justify="flex-end" gap={2} mb={2}>
        <Button colorScheme="orange" size="sm" onClick={handleRun}>
          ▶ {t("Run")}
        </Button>
        <Button colorScheme="orange" size="sm">
          {t("Save")}
        </Button>
        <Button colorScheme="orange" size="sm">
          {t("Share")}
        </Button>
      </Flex>

      <Box
        bg="white"
        color="black"
        fontFamily="monospace"
        fontSize="sm"
        height="400px"
        overflow="auto"
        borderRadius="md"
        padding={2}
      >
        <Editor
          value={sql}
          onValueChange={setSql}
          highlight={(code) => Prism.highlight(code, Prism.languages.sql, "sql")}
          padding={10}
          style={{
            fontFamily: "monospace",
            fontSize: 14,
                }}
        />
      </Box>
    </Box>
  );
};

export default CodeEditor;
