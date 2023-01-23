import React from "react";
import { SafeAreaView } from "react-native";
import { View } from "react-native-ui-lib";
import CreateUserForm from "../components/CreateUserForm";

export default function CreateUserScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View flex bg-mainBG>
        <CreateUserForm />
      </View>
    </SafeAreaView>
  );
}
