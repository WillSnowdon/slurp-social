import React from "react";
import { Image, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native-ui-lib";
import ConnectButton from "../components/ConnectButton";

// TODO: Add welcome text & logo
export default function AuthScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View flex bg-mainBG centerV paddingH-24>
        <View centerH marginB-16>
          <Image
            style={{ height: 64, width: 64 }}
            source={require("../s.png")}
          />
        </View>
        <Text marginB-128 style={{ textAlign: "center" }}>
          Decentralised social.
        </Text>
        <ConnectButton label="connect" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
