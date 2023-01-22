import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FileUriData } from "@spling/social-protocol";
import React, { useCallback, useContext, useState } from "react";
import { ImageBackground, TouchableOpacity } from "react-native";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import { Button, Colors, Incubator, View } from "react-native-ui-lib";
import { DataContext } from "../utils";
import { useSplingTransact } from "../utils/transact";

export default function CreateUserForm() {
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<Image>();
  const transact = useSplingTransact();
  const { refreshUser } = useContext(DataContext);

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
    await transact(async (socialProtocal) => {
      if (!avatar) return;

      const file: FileUriData = {
        uri: avatar.path,
        type: avatar.mime,
        size: avatar.size,
      };
      return await socialProtocal.createUser(userName, file, bio);
    });

    refreshUser?.();
  }, [transact, userName, bio, avatar, refreshUser]);

  return (
    <View center flex>
      <TouchableOpacity
        style={{
          height: 200,
          width: 200,
          backgroundColor: Colors.grey10,
          borderRadius: 100,
          overflow: "hidden",
          position: "relative",
        }}
        accessibilityLabel="Select Avatar"
        onPress={handlePickAvatar}
      >
        <ImageBackground
          source={avatar ? { uri: avatar.path } : undefined}
          style={{ height: 200, width: 200 }}
        >
          <View center flex>
            <MaterialCommunityIcons
              name={avatar ? "image-edit" : "image-plus"}
              size={80}
              color={Colors.white}
              style={[
                avatar && {
                  opacity: 0.8,
                  position: "absolute",
                  top: 10,
                  right: 10,
                },
              ]}
            />
          </View>
        </ImageBackground>
      </TouchableOpacity>
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
