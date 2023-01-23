import { FileUriData } from "@spling/social-protocol";
import React, { useCallback, useContext, useState } from "react";
import { Image } from "react-native-image-crop-picker";
import {
  Button,
  Incubator,
  KeyboardAwareScrollView,
  View,
} from "react-native-ui-lib";
import { AuthedUserContext } from "../utils";
import { useSplingTransact } from "../utils/transact";
import EditableAvatar from "./EditableAvatar";

export default function CreateUserForm() {
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<Image>();
  const transact = useSplingTransact();
  const { updateUser } = useContext(AuthedUserContext);

  const handleCreateUser = useCallback(async () => {
    const user = await transact(async (socialProtocal) => {
      if (!avatar) return;

      const file: FileUriData = {
        uri: avatar.path,
        type: avatar.mime,
        size: avatar.size,
      };
      return await socialProtocal.createUser(userName, file, bio);
    });

    if (user) {
      updateUser(user);
    }
  }, [transact, userName, bio, avatar, updateUser]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View center flex>
        <EditableAvatar uri={avatar?.path} onUpdate={setAvatar} />
        <View width={260} marginT-32>
          <Incubator.TextField
            showCharCounter
            placeholder="Nickname"
            maxLength={64}
            floatingPlaceholder
            onChangeText={setUserName}
          />

          <Incubator.TextField
            showCharCounter
            placeholder="Who are you"
            maxLength={256}
            multiline
            floatingPlaceholder
            onChangeText={setBio}
          />
          <View marginT-16>
            <Button
              disabled={userName.length === 0 && !!avatar?.path}
              label="LFG"
              onPress={handleCreateUser}
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
