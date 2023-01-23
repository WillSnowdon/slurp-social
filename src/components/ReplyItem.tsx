import { formatDistance } from "date-fns";
import enUS from "date-fns/locale/en-US";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Avatar, Colors, Text, View } from "react-native-ui-lib";
import { SlurpReply } from "../utils";
import AuthedUserAvatar from "./AuthedUserAvatar";

export default ({ reply }: { reply: SlurpReply }) => {
  const isDark = Colors.getScheme() === "dark";

  const avatarSrc = useMemo(() => {
    return {
      uri: reply.user.avatar ? reply.user.avatar + `?${Date.now()}` : undefined,
    };
  }, [reply.user]);

  return (
    <View
      row
      paddingH-16
      paddingV-8
      bg-replyBG
      style={isDark ? styles.darkTheme : styles.lightTheme}
    >
      <View marginR-16>
        {reply.byConnectedUser ? (
          <AuthedUserAvatar size={32} />
        ) : (
          <Avatar source={avatarSrc} size={32} />
        )}
      </View>
      <View flex>
        <View>
          {/* Metadata */}
          <View row spread centerV>
            <Text color={Colors.nickname} stle={{ fontWeight: "700" }}>
              {reply.user.nickname}
            </Text>
            <Text text100L>
              {formatDistance(Date.now(), reply.timestamp * 1000, {
                locale: enUS,
              })}{" "}
              ago
            </Text>
          </View>
          {/* Content */}
          <View marginV-8>
            <Text>{reply.text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lightTheme: {},
  darkTheme: {},
  timeAgo: {
    fontSize: 10,
  },
  action: {
    marginRight: 32,
  },
  likesText: {
    marginLeft: 4,
    fontSize: 12,
  },
});
