// components/modals/SignupModal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";

const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>회원가입</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3}>
            <FormLabel>이메일</FormLabel>
            <Input placeholder="이메일" />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>이름</FormLabel>
            <Input placeholder="이름" />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>비밀번호</FormLabel>
            <Input type="password" placeholder="비밀번호" />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>비밀번호 확인</FormLabel>
            <Input type="password" placeholder="비밀번호 확인" />
          </FormControl>

          <Button colorScheme="brown" w="100%" mt={2}>
            가입하기
          </Button>

          <Text mt={4} fontSize="sm" textAlign="center">
            이미 계정이 있으신가요?{" "}
            <Text as="span" color="orange.400" cursor="pointer" onClick={() => {
              onClose();
              onOpenLogin();
            }}>
              로그인
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
