import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import { FileUriData } from "@spling/social-protocol";
import merge from "lodash/merge";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Hyperlink from "react-native-hyperlink";
import Modal from "react-native-modal";
import {
  Colors,
  KeyboardAwareScrollView,
  Text,
  View,
} from "react-native-ui-lib";
import useSWR from "swr";
import EditableAvatar from "../components/EditableAvatar";
import EditProfileForm, {
  EditProfileFormData,
} from "../components/EditProfileForm";
import {
  abbreviatedKey,
  AuthedUserContext,
  SlurpPost,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";

export default function UserProfileScreen() {
  const {
    params: {
      post: { user },
    },
  } = useRoute<RouteProp<{ params: { post: SlurpPost } }>>();
  const protoGetters = useSocialProtocolGetters();
  const transact = useSplingTransact();
  const [showEditModal, setShowEditModal] = useState(false);
  const { authedUser, updateUser } = useContext(AuthedUserContext);
  const userRequest = useSWR(
    protoGetters ? `user/${user.publicKey}` : null,
    () => protoGetters?.getUserByPublicKey(new PublicKey(user.publicKey))
  );

  const userProfile = userRequest.data;
  const isProfileAuthedUser = useMemo(
    () => userProfile?.userId === authedUser?.userId,
    [authedUser, userProfile]
  );
  const handleModalDismiss = useCallback(() => {
    setShowEditModal(false);
  }, [setShowEditModal]);

  const handleModalOpen = useCallback(() => {
    setShowEditModal(true);
  }, [setShowEditModal]);

  const handleUpdateUser = useCallback(
    async ({ avatar, bio, username }: EditProfileFormData) => {
      try {
        const user = await transact(async (socialProtocal) => {
          const file: FileUriData | null = avatar
            ? {
                uri: avatar.path,
                type: avatar.mime,
                size: avatar.size,
              }
            : null;

          return await socialProtocal.updateUser(username, file, bio);
        });

        if (user) {
          updateUser(user);
          userRequest.mutate(merge({}, userRequest.data, user));
        }
      } finally {
        handleModalDismiss();
      }
    },
    [transact, updateUser, handleModalDismiss, userRequest.mutate]
  );

  return (
    <View bg-mainBG flex>
      <KeyboardAwareScrollView>
        <ImageBackground
          style={{ backgroundColor: Colors.bannerBG, position: "relative" }}
          source={{ uri: userProfile?.banner || undefined }}
        >
          {isProfileAuthedUser && (
            <TouchableOpacity
              style={{ position: "absolute", top: 16, right: 16 }}
              accessibilityLabel="Edit your profile"
              onPress={handleModalOpen}
            >
              <MaterialCommunityIcons
                name="circle-edit-outline"
                size={50}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}
          <View height={200} center>
            <EditableAvatar
              uri={userProfile?.avatar ?? user.avatar}
              size={100}
            />
          </View>
        </ImageBackground>
        <View marginT-24 paddingH-16>
          <Text style={styles.nickname}>
            {userProfile?.nickname ?? user.nickname}
          </Text>
          <Text>{abbreviatedKey(user.publicKey)}</Text>

          {userRequest.isLoading && (
            <View marginT-16 center>
              <ActivityIndicator />
            </View>
          )}

          {userProfile && (
            <View>
              <Hyperlink
                linkStyle={{
                  color: "#2980b9",
                  fontSize: 14,
                  textDecorationLine: "underline",
                }}
              >
                <Text>{userProfile.bio}</Text>
              </Hyperlink>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <Modal
        isVisible={showEditModal}
        onBackdropPress={handleModalDismiss}
        onBackButtonPress={handleModalDismiss}
        style={{ margin: 0 }}
      >
        <View bg-postInputModalBG flex paddingH-24 paddingB-16>
          <SafeAreaView style={{ flex: 1 }}>
            <View flex paddingT-8>
              <TouchableOpacity
                onPress={handleModalDismiss}
                accessibilityLabel="Close Modal"
              >
                <MaterialCommunityIcons name="close" size={32} />
              </TouchableOpacity>
              {showEditModal && userProfile && (
                <EditProfileForm
                  user={userProfile}
                  onUpdate={handleUpdateUser}
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  nickname: {
    fontSize: 30,
  },
});
