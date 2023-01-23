import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistance } from "date-fns";
import enUS from "date-fns/locale/en-US";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View as RNView } from "react-native";
import Hyperlink from "react-native-hyperlink";
import { Avatar, Colors, Image, Text, View } from "react-native-ui-lib";
import { SlurpPost } from "../utils";

export type PostItemProps = {
  post: SlurpPost;
  marginV?: boolean;
  onItemPress?: (post: SlurpPost) => void;
  onCommentPress?: (post: SlurpPost) => void;
  onLikePost?: (post: SlurpPost) => void;
  onMenuPress?: (post?: SlurpPost) => void;
  onAvatarPress: (post: SlurpPost) => void;
  onTipUser?: (post: SlurpPost) => void;
};

export default ({
  post,
  marginV = true,
  onAvatarPress,
  onCommentPress,
  onItemPress,
  onMenuPress,
  onLikePost,
  onTipUser,
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
            <View row centerV>
              <Text flex>{post.user.nickname}</Text>
              <Text text100L>
                {formatDistance(Date.now(), post.timestamp * 1000, {
                  locale: enUS,
                })}{" "}
                ago
              </Text>

              {post.byConnectedUser && onMenuPress && (
                <View marginL-4>
                  <TouchableOpacity onPress={() => onMenuPress?.(post)}>
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      color={Colors.lightIcon}
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              )}
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
              <Hyperlink
                linkDefault
                linkStyle={{
                  color: Colors.hyperlink,
                  fontSize: 14,
                  textDecorationLine: "underline",
                }}
              >
                <Text>{post.text}</Text>
              </Hyperlink>
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
          <View row paddingT-8 centerV>
            {onLikePost && (
              <View row centerV style={styles.action}>
                <TouchableOpacity
                  onPress={() => onLikePost(post)}
                  accessibilityLabel="Like Post"
                >
                  <MaterialCommunityIcons
                    color={post.liked ? Colors.heart : Colors.lightIcon}
                    name={post.liked ? "heart" : "heart-outline"}
                    size={20}
                  />
                </TouchableOpacity>
                <Text style={styles.likesText}>{post.likes.length}</Text>
              </View>
            )}
            {onCommentPress && (
              <View style={styles.action} accessibilityLabel="Reply to post">
                <TouchableOpacity onPress={() => onCommentPress(post)}>
                  <MaterialCommunityIcons
                    color={Colors.lightIcon}
                    name="comment-outline"
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            )}

            {!post.byConnectedUser && onTipUser && (
              <View style={styles.action}>
                <TouchableOpacity
                  onPress={() => onTipUser(post)}
                  accessibilityLabel="Tip Post Creator"
                >
                  <MaterialCommunityIcons
                    color="#afd9af"
                    name="cash"
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            )}
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
