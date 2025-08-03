
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "#c8a88d";;

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={8} mt="35px">
      
      <Menu isLazy>
        <MenuButton as={Button} size="sm" fontSize="13px" w="90px" bg="brand.500" _hover={{ bg: "orange.600" }} _active={{ bg: "#b35623" }}>{language}</MenuButton>
        <MenuList bg="brand.500">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              onClick={() => onSelect(lang)}
              bg={language === lang ? ACTIVE_COLOR : "inherit"}
              color={language === lang ? "white" : "gray.200"}
              fontWeight="bold"
              _hover={{ bg: ACTIVE_COLOR }}
             
            >
              {lang} ({version})
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
