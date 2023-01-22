import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useContext } from "react";
import { Colors } from "react-native-ui-lib";
import { AuthedUserContext, useAuthorization } from "../utils";
import Auth from "./Auth";
import CreateUserScreen from "./CreateUser";
import FeedNav from "./FeedNav";

const Tab = createBottomTabNavigator();
export default function MainScreen() {
  const { selectedAccount } = useAuthorization();
  const { authedUser, loadingUser } = useContext(AuthedUserContext);

  return (
    <>
      {selectedAccount ? (
        authedUser ? (
          <NavigationContainer>
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
                      color={
                        focused ? Colors.tabBarIconActive : Colors.tabBarIcon
                      }
                    />
                  ),
                  tabBarLabel: ({}) => null,
                  tabBarAccessibilityLabel: "Feed",
                  tabBarStyle: {
                    backgroundColor: Colors.tabBarBG,
                  },
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        ) : loadingUser ? (
          <></>
        ) : (
          <CreateUserScreen />
        )
      ) : (
        <Auth />
      )}
    </>
  );
}
