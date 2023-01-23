import React from "react";
import { View } from "react-native-ui-lib";
import DisconnectButton from "../components/DisconnectButton";

export default function SettingsScreen() {
  return (
    <View flex padding-24>
      <DisconnectButton label="Disconnect" />
    </View>
  );
}
