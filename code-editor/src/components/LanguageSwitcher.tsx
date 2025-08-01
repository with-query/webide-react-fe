import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import React from "react"

const LanguageSwitcher = ({ onChange }: { onChange?: (lang: string) => void }) => (
  <Menu>
    <MenuButton as={Button} size="sm" variant="outline">
      언어
    </MenuButton>
    <MenuList>
      <MenuItem onClick={() => onChange?.("ko")}>한국어</MenuItem>
      <MenuItem onClick={() => onChange?.("en")}>English</MenuItem>
    </MenuList>
  </Menu>
)

export default LanguageSwitcher
