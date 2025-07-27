// components/modals/ForgotPasswordModal.jsx
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

const ForgotPasswordModal = ({ isOpen, onClose, onOpenLogin }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>비밀번호 찾기</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text fontSize="sm" mb={4}>
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </Text>

          <FormControl mb={4}>
            <FormLabel>이메일</FormLabel>
            <Input type="email" placeholder="이메일" />
          </FormControl>

          <Button colorScheme="brown" w="100%">
            비밀번호 재설정 링크 받기
          </Button>

          <Text mt={4} color="orange.400" fontSize="sm" textAlign="center" cursor="pointer" onClick={() => {
            onClose();
            onOpenLogin();
          }}>
            로그인으로 돌아가기
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ForgotPasswordModal;
