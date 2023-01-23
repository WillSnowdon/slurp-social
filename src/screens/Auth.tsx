import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib";
import ConnectButton from "../components/ConnectButton";

// TODO: Add welcome text & logo
export default function AuthScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View flex bg-mainBG centerV paddingH-24>
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
