import { useNavigation } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import { FileUriData, Order_By, Post } from "@spling/social-protocol";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { ImageOrVideo } from "react-native-image-crop-picker";
import PostInput, { PostContext } from "../components/PostInput";
import PostItem from "../components/PostItem";
import {
  AuthedUserContext,
  SlurpPost,
  SlurpUser,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";
import { FeedNavProp } from "./FeedNav.types";

const LIMIT = 10;
const MAIN_FEED_GROUP_ID = 10;

const getAllSlurpPosts = async (
  protoGetters: ReturnType<typeof useSocialProtocolGetters>,
  offset: number,
  authedUser: SlurpUser
): Promise<SlurpPost[]> => {
  if (!protoGetters) return Promise.reject();

  const fetchedPosts = await protoGetters.getAllPosts(
    MAIN_FEED_GROUP_ID,
    LIMIT,
    offset,
    Order_By.Desc
  );

  return fetchedPosts.map((post) => ({
    ...post,
    publicKey: post.publicKey.toString(),
    user: { ...post.user, publicKey: post.user.publicKey.toString() },
    liked: post.likes.includes(authedUser.userId),
  }));
};

export default function FeedScreen() {
  const transact = useSplingTransact();
  const protoGetters = useSocialProtocolGetters();
  const [posts, setPosts] = useState<SlurpPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [initialRequest, setInitialRequest] = useState(false);
  const nav = useNavigation<FeedNavProp>();
  const authedUser = useContext(AuthedUserContext).authedUser as SlurpUser;

  const getPosts = useCallback(async () => {
    if (!protoGetters) return;
    try {
      setLoading(true);
      const fetchedPosts = await getAllSlurpPosts(
        protoGetters,
        offset,
        authedUser
      );

      setPosts((posts) => posts.concat(fetchedPosts));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [protoGetters, setLoading, setPosts, offset]);

  const addPost = useCallback(
    async (text: string, media?: ImageOrVideo) => {
      const fileUriData: FileUriData | null = media
        ? {
            size: media.size,
            type: media.mime,
            uri: media.path,
          }
        : null;
      const post = (await transact(async (socialProto) => {
        return await socialProto.createPost(10, "", text, fileUriData);
      })) as Post;

      setPosts((posts) => {
        return [
          {
            ...post,
            user: { ...post.user, publicKey: post.user.publicKey.toString() },
            publicKey: post.publicKey.toString(),
            liked: false,
          },
          ...posts,
        ];
      });
    },
    [transact]
  );

  const likePost = useCallback(
    (post: SlurpPost) => {
      transact(async (socialProto) => {
        await socialProto.likePost(new PublicKey(post.publicKey));
      });
    },
    [transact]
  );

  const handleViewComments = useCallback(
    (post: SlurpPost) => {
      nav.navigate("PostReplies", { post });
    },
    [nav]
  );

  const handleAvatarPress = useCallback(
    (post: SlurpPost) => {
      nav.navigate("UserProfile", { post });
    },
    [nav]
  );

  useEffect(() => {
    if (protoGetters && !initialRequest) {
      setInitialRequest(true);
      getPosts();
    }
  }, [protoGetters, initialRequest]);

  return (
    <PostContext.Provider value={{ onPost: addPost }}>
      <FlatList
        ListHeaderComponent={PostInput}
        stickyHeaderIndices={[0]}
        style={{ flex: 1 }}
        data={posts}
        keyExtractor={({ postId }) => postId.toString()}
        renderItem={({ item, index }) => {
          return (
            <>
              <PostItem
                post={item}
                onLikePost={likePost}
                onCommentPress={handleViewComments}
                onItemPress={handleViewComments}
                onAvatarPress={handleAvatarPress}
              />
              {loading && index === posts.length - 1 && <ActivityIndicator />}
            </>
          );
        }}
      />
    </PostContext.Provider>
  );
}