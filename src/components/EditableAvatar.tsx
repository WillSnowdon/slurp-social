import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import { Avatar, Colors, View } from "react-native-ui-lib";

export type EditableAvatarProps = {
  uri?: string | null;
  size?: number;
  onUpdate?: (image: Image) => void;
};

export default function EditableAvatar({
  size = 200,
  uri,
  onUpdate,
}: EditableAvatarProps) {
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

      onUpdate?.(croppedImage);
    } catch (e) {
      console.log(e);
    }
  }, [onUpdate]);

  return (
    <TouchableOpacity
      style={{
        height: size,
        width: size,
        backgroundColor: Colors.grey10,
        borderRadius: size / 2,
        overflow: "hidden",
        position: "relative",
      }}
      disabled={!onUpdate}
      accessibilityLabel="Select Avatar"
      onPress={handlePickAvatar}
    >
      <Avatar source={uri ? { uri } : undefined} size={size} />
      {!!onUpdate && (
        <View
          center
          flex
          style={{
            position: "absolute",
            height: size,
            width: size,
          }}
        >
          <MaterialCommunityIcons
            name={uri ? "image-edit" : "image-plus"}
            size={80}
            color={Colors.white}
            style={[
              !!uri && {
                opacity: 0.8,
                position: "absolute",
                top: 10,
                right: 10,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
