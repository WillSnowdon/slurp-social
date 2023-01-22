import { FileUriData } from "@spling/social-protocol";
import React, { useCallback, useContext, useState } from "react";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import { Button, Incubator, View } from "react-native-ui-lib";
import { AuthedUserContext } from "../utils";
import { useSplingTransact } from "../utils/transact";
import EditableAvatar from "./EditableAvatar";

export default function CreateUserForm() {
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<Image>();
  const transact = useSplingTransact();
  const { updateUser } = useContext(AuthedUserContext);

  const handlePickAvatar = useCallback(async () => {
    try {
      const pickedImage = await ImagePicker.openPicker({
        multiple: false,
        mediaType: "photo",
      });

      const croppedImage = await ImagePicker.openCropper({
        path: pickedImage.path,
        mediaType: "photo",
        cropperCircleOverlay: true,
        enableRotationGesture: false,
        cropperRotateButtonsHidden: true,
      });

      setAvatar(croppedImage);
    } catch (e) {
      console.log(e);
    }
  }, [setAvatar]);

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
    <View center flex>
      <EditableAvatar onUpdate={handlePickAvatar} />
      <View width={260} marginT-32>
        <Incubator.TextField
          showCharCounter
          placeholder="Username"
          maxLength={64}
          onChangeText={setUserName}
        />

        <Incubator.TextField
          showCharCounter
          placeholder="Who are you"
          maxLength={256}
          multiline
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
  );
}
