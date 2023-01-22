import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import ConnectButton from "../components/ConnectButton";
import { useSocialProtocolGetters } from "../utils";

export default function AuthScreen() {
  const socialGetters = useSocialProtocolGetters();

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <ConnectButton label="connect" />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shell: {
    height: "100%",
  },
  spacer: {
    marginVertical: 16,
    width: "100%",
  },
  textInput: {
    width: "100%",
  },
});
