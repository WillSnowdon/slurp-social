import React, { useContext } from "react";
import UiAvatar from "react-native-ui-lib/avatar";
import { DataContext } from "../utils";

export default function AuthedUserAvatar(props: { size: number }) {
  const { authedUser } = useContext(DataContext);

  return (
    <>
      {authedUser && (
        <UiAvatar
          source={authedUser.avatar ? { uri: authedUser.avatar } : undefined}
          size={50}
          label={authedUser.nickname[0]}
        />
      )}
    </>
  );
}
