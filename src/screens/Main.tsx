import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useContext } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Colors, Text, View } from "react-native-ui-lib";
import {
  AuthedUserContext,
  AuthedUserProvider,
  navEventEmitter,
  useAuthorization,
} from "../utils";
import Auth from "./Auth";
import CreateUserScreen from "./CreateUser";
import FeedNav from "./FeedNav";

const Tab = createBottomTabNavigator();
export default function MainScreen() {
  const { selectedAccount } = useAuthorization();

  return (
    <>
      {selectedAccount ? (
        <AuthedUserProvider>
          <ConnectedView />
        </AuthedUserProvider>
      ) : (
        <Auth />
      )}
    </>
  );
}

function ConnectedView() {
  const { authedUser, loadingUser } = useContext(AuthedUserContext);

  return (
    <>
      {authedUser ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Home"
            component={FeedNav}
            options={{
              headerShown: false,
              tabBarIcon: ({ size, focused }) => (
                <MaterialCommunityIcons
                  accessibilityLabel="Feed"
                  size={size}
                  name="home"
                  color={focused ? Colors.tabBarIconActive : Colors.tabBarIcon}
                />
              ),
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...props}
                  onPress={(...args) => {
                    props.onPress?.(...args);
                    navEventEmitter.emit("homeTabPress");
                  }}
                />
              ),
              tabBarAccessibilityLabel: "Feed",
              tabBarShowLabel: false,
              tabBarStyle: {
                backgroundColor: Colors.tabBarBG,
              },
            }}
          />
        </Tab.Navigator>
      ) : loadingUser ? (
        <View flex center bg-primaryBG>
          <ActivityIndicator color={Colors.white} size={46} />
          <View marginT-24>
            <Text style={{ fontSize: 18 }} color={Colors.white}>
              loading user deets...
            </Text>
          </View>
        </View>
      ) : (
        <CreateUserScreen />
      )}
    </>
  );
}
