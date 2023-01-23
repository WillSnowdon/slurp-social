import { useNavigation } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import { FileUriData, Order_By, Post } from "@spling/social-protocol";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { ImageOrVideo } from "react-native-image-crop-picker";
import { View } from "react-native-ui-lib";
import PostInput from "../components/PostInput";
import PostItem from "../components/PostItem";
import {
  AuthedUserContext,
  navEventEmitter,
  SlurpPost,
  SlurpUser,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";
import { FeedNavProp } from "./FeedNav.types";

const LIMIT = 10;
const MAIN_FEED_GROUP_ID = 10;

export type PostContext = {
  loading?: boolean;
  onPost?: (text: string, image?: ImageOrVideo) => void;
};

export const PostContext = React.createContext<PostContext>({});

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
  const offset = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [initialRequest, setInitialRequest] = useState(false);
  const listRef = useRef<FlatList>(null);
  const nav = useNavigation<FeedNavProp>();
  const authedUser = useContext(AuthedUserContext).authedUser as SlurpUser;

  useEffect(() => {
    const handler = () => {
      listRef.current?.scrollToIndex({ index: 0 });
    };
    navEventEmitter.addListener("homeTabPress", handler);

    return () => {
      navEventEmitter.removeListener("homeTabPres", handler);
    };
  }, []);

  const getPosts = useCallback(async () => {
    if (!protoGetters || loading || offset.current < 0) return;
    try {
      setLoading(true);
      const fetchedPosts = await getAllSlurpPosts(
        protoGetters,
        offset.current,
        authedUser
      );

      setPosts((posts) =>
        offset.current === 0 ? fetchedPosts : posts.concat(fetchedPosts)
      );
      offset.current =
        fetchedPosts.length < LIMIT ? -1 : offset.current + LIMIT;
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [protoGetters, setLoading, setRefreshing, setPosts, offset, loading]);

  const addPost = useCallback(
    async (text: string, media?: ImageOrVideo) => {
      const fileUriData: FileUriData | undefined = media && {
        size: media.size,
        type: media.mime,
        uri: media.path,
      };
      const post = (await transact(async (socialProto) => {
        return await socialProto.createPost(
          10,
          "",
          text,
          fileUriData ? [fileUriData] : null
        );
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
    <PostContext.Provider value={{ onPost: addPost, loading }}>
      <FlatList
        ref={listRef}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        stickyHeaderIndices={[0]}
        style={{ flex: 1 }}
        onRefresh={() => {
          offset.current = 0;
          setRefreshing(true);
          setTimeout(() => getPosts(), 0);
        }}
        refreshing={refreshing}
        data={posts}
        onEndReached={getPosts}
        keyExtractor={({ postId }) => postId.toString()}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onLikePost={likePost}
            onCommentPress={handleViewComments}
            onItemPress={handleViewComments}
            onAvatarPress={handleAvatarPress}
          />
        )}
      />
    </PostContext.Provider>
  );
}

const ListHeader = () => {
  const { onPost } = useContext(PostContext);

  return <PostInput onPost={onPost} />;
};

const ListFooter = () => {
  const { loading } = useContext(PostContext);

  return (
    <>
      {loading && (
        <View paddingV-24>
          <ActivityIndicator />
        </View>
      )}
    </>
  );
};
