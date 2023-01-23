import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActionSheet,
  Colors,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { FeedNavProp } from "../screens/FeedNav.types";
import {
  AuthedUserContext,
  navEventEmitter,
  SlurpPost,
  SlurpUser,
  useAuthorization,
  useGuardedCallback,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";
import PostItem from "./PostItem";
import TipForm from "./TipForm";

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
  const { authorizeSession } = useAuthorization();
  const protoGetters = useSocialProtocolGetters();
  const [posts, setPosts] = useState<SlurpPost[]>([]);
  const [loading, setLoading] = useState(false);
  const offset = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [initialRequest, setInitialRequest] = useState(false);
  const listRef = useRef<FlatList>(null);
  const nav = useNavigation<FeedNavProp>();
  const authedUser = useContext(AuthedUserContext).authedUser as SlurpUser;
  const [actionablePost, setActionablePost] = useState<SlurpPost>();
  const { connection } = useConnection();
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

  const handleTipUserSol = useGuardedCallback(
    (to: PublicKey, solAmount: number) => {
      transact(async (wallet) => {
        await authorizeSession(wallet);
        const fromPubkey = new PublicKey(authedUser.publicKey);
        const transferTransaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: to,
            lamports: solAmount * LAMPORTS_PER_SOL,
          })
        );
        const blockhash = await connection.getLatestBlockhash("finalized");
        transferTransaction.recentBlockhash = blockhash.blockhash;
        transferTransaction.feePayer = fromPubkey;
        const txIds = await wallet.signAndSendTransactions({
          transactions: [transferTransaction],
        });
        console.log(
          `tipped ${solAmount} SOL to ${to.toString()} - ${txIds.toString()}`
        );
      });
    },
    [connection, authedUser, authorizeSession]
  );

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
    },
    [splingTransact]
  );

  const likePost = useGuardedCallback(
    (post: SlurpPost) => {
      splingTransact(async (socialProto) => {
        await socialProto.likePost(new PublicKey(post.publicKey));
      });
    },
    [splingTransact]
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
            onLikePost={likePost}
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

      <Modal
        isVisible={!!tipUser}
        onBackdropPress={handleDismissTipModal}
        onBackButtonPress={handleDismissTipModal}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View flex centerV>
            <View bg-postInputModalBG padding-24 br30>
              <View row centerV marginB-24>
                <Text flex style={{ fontSize: 24 }} color={Colors.primary}>
                  Tip {tipUser?.nickname}
                </Text>

                <TouchableOpacity
                  onPress={handleDismissTipModal}
                  accessibilityLabel="Close Modal"
                >
                  <MaterialCommunityIcons name="close" size={32} />
                </TouchableOpacity>
              </View>
              <View paddingT-8>
                <TipForm
                  onSubmit={(tokenOption, amount) => {
                    if (!tipUser) return;

                    if (tokenOption.name === "SOL") {
                      handleTipUserSol(
                        new PublicKey(tipUser.publicKey),
                        amount
                      );

                      setTipUser(undefined);
                    } else {
                      // TODO: SPL token transfer
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
