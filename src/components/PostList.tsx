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
import { ActivityIndicator, FlatList, FlatListProps } from "react-native";
import { ImageOrVideo } from "react-native-image-crop-picker";
import { useToast } from "react-native-toast-notifications";
import { ActionSheet, View } from "react-native-ui-lib";
import { FeedNavProp } from "../screens/FeedNav.types";
import {
  AuthedUserContext,
  navEventEmitter,
  SlurpPost,
  SlurpUser,
  useGuardedCallback,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";
import PostItem from "./PostItem";
import TipModal from "./TipModal";

const LIMIT = 10;
const MAIN_FEED_GROUP_ID = 10;

export type PostListContextConfig = {
  loading?: boolean;
  onPost?: (text: string, image?: ImageOrVideo) => void;
};

export const PostListContext = React.createContext<PostListContextConfig>({});

const toSlurpPost = (post: Post, authedUser: SlurpUser): SlurpPost => ({
  ...post,
  publicKey: post.publicKey.toString(),
  user: { ...post.user, publicKey: post.user.publicKey.toString() },
  liked: post.likes.includes(authedUser.userId),
  byConnectedUser: authedUser.userId === post.userId,
});
const getAllPostsByUser = async (
  protoGetters: ReturnType<typeof useSocialProtocolGetters>,
  userId: number,
  offset: number,
  authedUser: SlurpUser
): Promise<SlurpPost[]> => {
  if (!protoGetters) return Promise.reject();

  const fetchedPosts = await protoGetters.getAllPostsByUserId(
    userId,
    LIMIT,
    offset,
    Order_By.Desc
  );

  return fetchedPosts.map((post) => toSlurpPost(post, authedUser));
};

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

  return fetchedPosts.map((post) => toSlurpPost(post, authedUser));
};

export type PostListProps = {
  ListHeaderComponent?: React.ComponentType;
  /**
   * If provided it will look up posts for user otherwise default app group it
   */
  userId?: number;
} & Pick<
  FlatListProps<SlurpPost>,
  "ListHeaderComponent" | "stickyHeaderIndices"
>;

export default function PostList({ userId, ...listProps }: PostListProps) {
  const splingTransact = useSplingTransact();
  const protoGetters = useSocialProtocolGetters();
  const toast = useToast();
  const [posts, setPosts] = useState<SlurpPost[]>([]);
  const [loading, setLoading] = useState(false);
  const offset = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [initialRequest, setInitialRequest] = useState(false);
  const listRef = useRef<FlatList>(null);
  const nav = useNavigation<FeedNavProp>();
  const authedUser = useContext(AuthedUserContext).authedUser as SlurpUser;
  const [actionablePost, setActionablePost] = useState<SlurpPost>();
  const [tipUser, setTipUser] = useState<SlurpPost["user"]>();

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
      const fetchedPosts = await (typeof userId !== "undefined"
        ? getAllPostsByUser(protoGetters, userId, offset.current, authedUser)
        : getAllSlurpPosts(protoGetters, offset.current, authedUser));

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
  }, [
    protoGetters,
    setLoading,
    setRefreshing,
    setPosts,
    userId,
    offset,
    loading,
  ]);

  const handleDismissTipModal = useCallback(() => {
    setTipUser(undefined);
  }, [setTipUser]);

  const handleOpenTipModal = useCallback(
    (post: SlurpPost) => {
      setTipUser(post.user);
    },
    [setTipUser]
  );

  const addPost = useGuardedCallback(
    async (text: string, media?: ImageOrVideo) => {
      const fileUriData: FileUriData | undefined = media && {
        size: media.size,
        type: media.mime,
        uri: media.path,
      };
      const post = (await splingTransact(async (socialProto) => {
        return await socialProto.createPost(
          10,
          "",
          text,
          fileUriData ? [fileUriData] : []
        );
      })) as Post;

      setPosts((posts) => {
        return [
          {
            ...post,
            user: { ...post.user, publicKey: post.user.publicKey.toString() },
            byConnectedUser: true,
            publicKey: post.publicKey.toString(),
            liked: false,
          },
          ...posts,
        ];
      });

      toast.show("Slurp posted!", { type: "success" });
    },
    [splingTransact, setPosts, toast]
  );

  const handleLikePost = useGuardedCallback(
    async (post: SlurpPost) => {
      await splingTransact(async (socialProto) => {
        await socialProto.likePost(new PublicKey(post.publicKey));
      });

      setPosts((posts) =>
        posts.map((p) => {
          if (post.postId === p.postId) {
            const postLiked = p.likes.includes(authedUser.userId);
            const likes = postLiked
              ? p.likes.filter((userId) => userId != authedUser.userId)
              : p.likes.concat(authedUser.userId);

            return {
              ...p,
              likes,
              liked: !postLiked,
            };
          }

          return p;
        })
      );
    },
    [splingTransact, setPosts, authedUser]
  );

  const handleViewComments = useCallback(
    (post: SlurpPost) => {
      nav.navigate("PostReplies", { post });
    },
    [nav]
  );

  const handleDeletePost = useGuardedCallback(
    async (actionablePost?: SlurpPost) => {
      await splingTransact(async (socialProtocol) => {
        if (!actionablePost) return;
        console.log(`deleting ${actionablePost.publicKey}`);
        await socialProtocol.deletePost(
          new PublicKey(actionablePost.publicKey)
        );

        setPosts((posts) =>
          posts.filter((post) => post.postId !== actionablePost.postId)
        );
      });
    },
    [actionablePost, setPosts]
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
    <PostListContext.Provider value={{ onPost: addPost, loading }}>
      <FlatList
        ref={listRef}
        {...listProps}
        ListFooterComponent={ListFooter}
        style={{ flex: 1 }}
        onRefresh={() => {
          offset.current = 0;
          setRefreshing(true);
          getPosts();
        }}
        refreshing={refreshing}
        data={posts}
        onEndReached={getPosts}
        keyExtractor={({ postId }) => postId.toString()}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onLikePost={handleLikePost}
            onCommentPress={handleViewComments}
            onItemPress={handleViewComments}
            onAvatarPress={handleAvatarPress}
            onMenuPress={setActionablePost}
            onTipUser={handleOpenTipModal}
          />
        )}
      />
      <ActionSheet
        title="Post Options"
        message="Message goes here"
        destructiveButtonIndex={0}
        visible={!!actionablePost}
        onDismiss={() => setActionablePost(undefined)}
        options={[
          {
            label: "Delete Post",
            onPress: () => handleDeletePost(actionablePost),
          },
        ]}
      />

      <TipModal
        tipUser={tipUser}
        onDone={handleDismissTipModal}
        onDismiss={handleDismissTipModal}
      />
    </PostListContext.Provider>
  );
}

const ListFooter = () => {
  const { loading } = useContext(PostListContext);

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
