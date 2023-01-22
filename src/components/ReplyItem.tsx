import { Reply } from "@spling/social-protocol";
import { formatDistance } from "date-fns";
import enUS from "date-fns/locale/en-US";
import React from "react";
import { StyleSheet } from "react-native";
import { Avatar, Colors, Text, View } from "react-native-ui-lib";

export default ({ reply }: { reply: Reply }) => {
  const isDark = Colors.getScheme() === "dark";

  return (
    <View
      row
      paddingH-16
      paddingV-8
      bg-replyBG
      style={isDark ? styles.darkTheme : styles.lightTheme}
    >
      <View marginR-16>
        <Avatar source={{ uri: reply.user.avatar as string }} size={32} />
      </View>
      <View flex>
        <View>
          {/* Metadata */}
          <View row spread centerV>
            <Text>{reply.user.nickname}</Text>
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
