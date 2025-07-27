import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  Text,
  Flex,
} from "@chakra-ui/react";

const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>로그인</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>이메일 또는 아이디</FormLabel>
            <Input placeholder="이메일 또는 아이디" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>비밀번호</FormLabel>
            <Input type="password" placeholder="비밀번호" />
          </FormControl>
          <Flex justify="space-between" mb={4}>
            <Checkbox>아이디 저장</Checkbox>
            <Text color="orange.400" fontSize="sm" cursor="pointer" onClick={() => {
              onClose();
              onOpenForgot();
            }}>
              비밀번호를 잊으셨나요?
            </Text>
          </Flex>
          <Button colorScheme="orange" w="100%" onClick={onLoginSuccess}>
            로그인
          </Button>
          <Text mt={4} fontSize="sm" textAlign="center">
            계정이 없으신가요?{" "}
            <Text as="span" color="orange.400" cursor="pointer" onClick={() => {
              onClose();
              onOpenSignup();
            }}>
              회원가입하기
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
