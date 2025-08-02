import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";

// ✅ props에서 타입스크립트 문법을 제거했습니다.
const LanguageSwitcher = ({ onChange }) => (
  <Menu>
    <MenuButton as={Button} size="sm" variant="outline">
      언어
    </MenuButton>
    <MenuList>
      {/* onChange가 undefined일 수도 있으므로, 
        optional chaining(?.)을 사용하여 안전하게 호출합니다.
      */}
      <MenuItem onClick={() => onChange?.("ko")}>한국어</MenuItem>
      <MenuItem onClick={() => onChange?.("en")}>English</MenuItem>
    </MenuList>
  </Menu>
);

export default LanguageSwitcher;
