import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useContext, useState } from "react";
import { Image, SafeAreaView, TouchableOpacity } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import Modal from "react-native-modal";
import { ActionSheet, Avatar, Colors, View } from "react-native-ui-lib";
import { AuthedUserContext } from "../utils";
import NftSelect from "./NftSelect";
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
  const [showActions, setShowActions] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const { authedUser } = useContext(AuthedUserContext);

  const hideModal = () => {
    setShowNftModal(false);
  };
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
        borderRadius: size / 2,
        overflow: "hidden",
        position: "relative",
      }}
      disabled={!onUpdate}
      accessibilityLabel="Select Avatar"
      onPress={() => setShowActions(true)}
    >
      <Avatar
        backgroundColor={Colors.grey10}
        source={uri ? { uri } : undefined}
        size={size}
      />
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

      <ActionSheet
        title="Avatar"
        message="Select avatar option"
        visible={showActions}
        onDismiss={() => setShowActions(false)}
        options={[
          {
            label: "Select Pic",
            onPress: handlePickAvatar,
          },
          {
            label: "Select NFT",
            onPress: () => setShowNftModal(true),
          },
        ]}
      />

      <Modal
        isVisible={showNftModal}
        onBackdropPress={hideModal}
        onBackButtonPress={hideModal}
        style={{ margin: 0 }}
      >
        <View bg-postInputModalBG flex paddingH-24 paddingB-16>
          <SafeAreaView style={{ flex: 1 }}>
            <View flex paddingT-8>
              <TouchableOpacity
                onPress={hideModal}
                accessibilityLabel="Close Modal"
              >
                <MaterialCommunityIcons name="close" size={32} />
              </TouchableOpacity>
              {showNftModal && authedUser && (
                <NftSelect
                  userPubKey={authedUser.publicKey}
                  onSelect={async (uri) => {
                    console.log(uri);
                    // TODO: download file
                  }}
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}
