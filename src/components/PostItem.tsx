import MaterialIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistance } from "date-fns";
import enUS from "date-fns/locale/en-US";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View as RNView } from "react-native";
import { Avatar, Colors, Image, Text, View } from "react-native-ui-lib";
import { SlurpPost } from "../utils";

export type PostItemProps = {
  post: SlurpPost;
  marginV?: boolean;
  hideLikes?: boolean;
  onItemPress?: (post: SlurpPost) => void;
  onCommentPress: (post: SlurpPost) => void;
  onLikePost: (post: SlurpPost) => void;
  onAvatarPress: (post: SlurpPost) => void;
};

export default ({
  post,
  hideLikes,
  marginV = true,
  onAvatarPress,
  onCommentPress,
  onItemPress,
  onLikePost,
}: PostItemProps) => {
  const isDark = Colors.getScheme() === "dark";
  const imageUri = post.media?.[0]?.file;
  const [aspectRatio, setAspectRatio] = useState(0);
  const [width, setWidth] = useState(0);
  const ref = useRef<RNView>(null);

  useEffect(() => {
    if (!imageUri) return;

    Image.getSize(imageUri, (width, height) => {
      setAspectRatio(height / width);
    });
  }, [imageUri]);
  return (
    <View
      paddingH-16
      paddingV-8
      bg-postBG
      marginT-12={marginV}
      style={isDark ? styles.darkTheme : styles.lightTheme}
    >
      <TouchableOpacity
        onPress={() => onItemPress?.(post)}
        style={{ flexDirection: "row" }}
        delayPressIn={1000}
      >
        <View marginR-16>
          <Avatar
            source={{ uri: post.user.avatar as string }}
            onPress={() => onAvatarPress?.(post)}
            size={32}
          />
        </View>
        <View flex>
          <View>
            {/* Metadata */}
            <View row spread centerV>
              <Text>{post.user.nickname}</Text>
              <Text text100L>
                {formatDistance(Date.now(), post.timestamp * 1000, {
                  locale: enUS,
                })}{" "}
                ago
              </Text>
            </View>
            {/* Content */}
            <View
              marginV-8
              ref={ref}
              onLayout={() => {
                ref.current?.measureInWindow?.((_x, _y, width) =>
                  setWidth(width)
                );
              }}
            >
              <Text>{post.text}</Text>
              {imageUri && (
                <View
                  marginT-16
                  style={{ borderRadius: 8, overflow: "hidden" }}
                >
                  <Image
                    height={width * aspectRatio}
                    width={width}
                    source={{ uri: imageUri }}
                  />
                </View>
              )}
            </View>
          </View>
          {/* Actions */}
          <View row paddingT-8>
            {!hideLikes && (
              <View row centerV style={styles.action}>
                <TouchableOpacity onPress={() => onLikePost(post)}>
                  <MaterialIcons
                    color={post.liked ? Colors.heart : Colors.lightIcon}
                    name={post.liked ? "heart" : "heart-outline"}
                    size={20}
                  />
                </TouchableOpacity>
                <Text style={styles.likesText}>{post.likes.length}</Text>
              </View>
            )}
            <View style={styles.action}>
              <TouchableOpacity onPress={() => onCommentPress(post)}>
                <MaterialIcons
                  color={Colors.lightIcon}
                  name="comment-outline"
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  lightTheme: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
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
