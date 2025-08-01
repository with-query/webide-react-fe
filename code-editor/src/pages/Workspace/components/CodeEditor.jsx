import React, { useState } from "react";
import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-sql"; // SQL 문법 하이라이트용
import "prismjs/themes/prism.css"; // 기본 Prism 테마 (커스터마이징 가능)
import "../styles/prism-custom.css"
import { useTranslation } from "react-i18next";
import {DownloadIcon, LinkIcon } from '@chakra-ui/icons';



const CodeEditor = ({ sql, setSql, onRunQuery, isExecuting  }) => {
  const { t } = useTranslation();

  return (
    <Box flex="1" p={4} height="100%" display="flex" flexDirection="column" bg="brand.100" borderRadius="md" boxShadow="sm">
      <Flex justify="flex-end" gap={2} mb={2}>
        <Button  colorScheme="orange" size="sm" onClick={onRunQuery} isLoading={isExecuting} leftIcon={isExecuting ? <Spinner size="xs" /> : undefined}>
          ▶ {t("Run")}
        </Button>
        <Button leftIcon={<DownloadIcon />} colorScheme="orange" size="sm">
          {t("Save")}
        </Button>
        <Button leftIcon={<LinkIcon />} colorScheme="orange" size="sm">
          {t("Share")}
        </Button>
      </Flex>

      <Box
        flex="1" 
        bg="white"
        color="black"
        fontFamily="monospace"
        fontSize="sm"
        height="400px"
        overflow="auto"
        borderRadius="md"
        padding={2}
        className="code-editor-container"
      >
        <Editor
          value={sql}
          onValueChange={setSql}
          highlight={(code) => Prism.highlight(code, Prism.languages.sql, "sql")}
          padding={10}
          style={{
            fontFamily: `"Fira code", "Fira Mono", monospace`,
            fontSize: 14,
                }}
        />
      </Box>
    </Box>
  );
};

export default CodeEditor;
