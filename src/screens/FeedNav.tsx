import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import FeedScreen from "./Feed";
import PostRepliesScreen from "./PostReplies";
import UserProfileScreen from "./UserProfile";

const Stack = createNativeStackNavigator();
export default function FeedNav() {
  const { setOptions } = useNavigation();

  return (
    <Stack.Navigator
      screenListeners={{
        state: (e: {
          data: { state: { index: number; routeNames: string[] } };
        }) => {
          if (e.data.state.routeNames[e.data.state.index] === "PostReplies") {
            setOptions({ tabBarStyle: { display: "none" } });
          } else {
            setOptions({ tabBarStyle: { display: "flex" } });
          }
        },
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostReplies"
        component={PostRepliesScreen}
        options={{ headerTitle: "Feed" }}
      />

      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerTitle: "" }}
      />
    </Stack.Navigator>
  );
}
