import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import ConnectButton from "../components/ConnectButton";

// TODO: Add welcome text & logo
export default function AuthScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ConnectButton label="connect" />
    </ScrollView>
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
