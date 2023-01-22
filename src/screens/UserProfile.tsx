import { RouteProp, useRoute } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { ActivityIndicator, ImageBackground, StyleSheet } from "react-native";
import {
  Colors,
  KeyboardAwareScrollView,
  Text,
  View,
} from "react-native-ui-lib";
import useSWR from "swr";
import EditableAvatar from "../components/EditableAvatar";
import { abbreviatedKey, SlurpPost, useSocialProtocolGetters } from "../utils";

export default function UserProfileScreen() {
  const {
    params: {
      post: { user },
    },
  } = useRoute<RouteProp<{ params: { post: SlurpPost } }>>();
  const protoGetters = useSocialProtocolGetters();

  const userRequest = useSWR(
    protoGetters ? `user/${user.publicKey}` : null,
    () => protoGetters?.getUserByPublicKey(new PublicKey(user.publicKey))
  );

  const userProfile = userRequest.data;
  return (
    <View bg-mainBG flex>
      <KeyboardAwareScrollView>
        <ImageBackground
          style={{ backgroundColor: Colors.bannerBG }}
          source={{ uri: userProfile?.banner || undefined }}
        >
          <View height={200} center>
            <EditableAvatar uri={user.avatar} size={100} />
          </View>
        </ImageBackground>
        <View marginT-24 paddingH-16>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text>{abbreviatedKey(user.publicKey)}</Text>

          {userRequest.isLoading && (
            <View marginT-16 center>
              <ActivityIndicator />
            </View>
          )}

          {userProfile && (
            <View>
              <Text>{userProfile.bio}</Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nickname: {
    fontSize: 30,
  },
});
