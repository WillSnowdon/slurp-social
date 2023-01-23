import React, { useContext, useMemo } from "react";
import UiAvatar from "react-native-ui-lib/avatar";
import { AuthedUserContext } from "../utils";

export default function AuthedUserAvatar({
  size = 50,
  onPress,
}: {
  size?: number;
  onPress?: () => void;
}) {
  const { authedUser } = useContext(AuthedUserContext);

  const avatarSrc = useMemo(() => {
    if (!authedUser) return undefined;

    return authedUser.avatar ? { uri: authedUser.avatar } : undefined;
  }, [authedUser?.avatar]);

  return (
    <>
      {authedUser && (
        <UiAvatar
          source={avatarSrc}
          size={size}
          label={authedUser.nickname[0]}
          onPress={onPress}
        />
      )}
    </>
  );
}
