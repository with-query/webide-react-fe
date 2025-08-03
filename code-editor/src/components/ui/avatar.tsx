// src/components/ui/avatar.jsx (or .tsx)
// This file replaces the original Shadcn UI Avatar component.

import { Avatar as ChakraAvatar, AvatarBadge, Text } from "@chakra-ui/react";
import React from "react";

// Avatar 컴포넌트의 props 타입을 정의합니다.
// Chakra UI의 Avatar 컴포넌트가 받는 모든 props를 포함하고,
// 추가적으로 className과 children을 명시합니다.
interface CustomAvatarProps extends React.ComponentPropsWithoutRef<typeof ChakraAvatar> {
  className?: string; // 외부 CSS 클래스를 적용할 경우를 위해 className 속성 추가
  // children은 React.ComponentPropsWithoutRef에 암시적으로 포함되어 있습니다.
}

const Avatar = React.forwardRef<HTMLSpanElement, CustomAvatarProps>( // ref와 props의 타입을 정확히 지정
  ({ className, children, ...props }, ref) => {
    return (
      <ChakraAvatar
        ref={ref} // ref 타입이 HTMLSpanElement로 지정되어 할당 가능
        // 기존 Shadcn UI의 Tailwind 스타일을 Chakra UI props로 변환
        // "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"
        w={10} // 40px, 원래 h-10 w-10에 해당
        h={10} // 40px
        flexShrink="0" // shrink-0
        overflow="hidden"
        borderRadius="full" // rounded-full
        {...props} // src, name, alt 등 나머지 props를 ChakraAvatar에 직접 전달
      >
        {children} {/* 자식 요소를 ChakraAvatar 내부에 렌더링 */}
      </ChakraAvatar>
    );
  }
);
Avatar.displayName = "Avatar";

// AvatarImage: Chakra UI에서는 Avatar 컴포넌트의 'src' prop을 통해 이미지를 직접 처리합니다.
// 별도의 AvatarImage 컴포넌트가 필요한 경우는 드뭅니다.
// 하위 호환성을 위해 유지하더라도, 실제로는 아무것도 렌더링하지 않고 경고를 표시합니다.
interface AvatarImageProps extends React.ComponentPropsWithoutRef<"img"> {
  className?: string;
}
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => {
  console.warn("AvatarImage는 Chakra UI에서 일반적으로 별도의 컴포넌트가 아닙니다. <Avatar>에 'src' prop을 직접 전달하세요.");
  return null; // Chakra UI의 Avatar가 이미지를 직접 처리하므로 여기서는 렌더링하지 않음
});
AvatarImage.displayName = "AvatarImage";


// AvatarFallback: Chakra UI에서는 Avatar 컴포넌트의 'name' prop으로 이니셜 폴백을 자동 생성하거나,
// 커스텀 폴백 콘텐츠를 자식으로 직접 전달하여 처리합니다.
// 하위 호환성을 위해 유지하더라도, 실제로는 Text 컴포넌트를 렌더링하고 경고를 표시합니다.
interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof Text> {
  className?: string;
}
const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(({ className, ...props }, ref) => {
  console.warn("AvatarFallback은 Chakra UI에서 일반적으로 별도의 컴포넌트가 아닙니다. <Avatar>에 커스텀 폴백 콘텐츠를 자식으로 직접 전달하세요.");
  return (
    <Text
      ref={ref}
      display="flex"
      h="full"
      w="full"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      bg="gray.200" // bg-muted (Chakra UI 기본 회색)
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
