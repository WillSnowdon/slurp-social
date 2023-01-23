import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Order_By } from "@spling/social-protocol";
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, FlatList } from "react-native";

import { View } from "react-native-ui-lib";
import PostItem from "../components/PostItem";
import ReplyItem from "../components/ReplyItem";
import ReplyModal from "../components/ReplyModal";
import {
  AuthedUserContext,
  SlurpPost,
  SlurpReply,
  useSocialProtocolGetters,
} from "../utils";
import { useSplingTransact } from "../utils/transact";
import { FeedNavProp } from "./FeedNav.types";

const ReplyContext = React.createContext<{
  post?: SlurpPost;
  loading?: boolean;
  replies?: boolean;
  onPressReply?: (post: SlurpPost) => void;
}>({});

const PostWithContext = () => {
  const { post, onPressReply } = useContext(ReplyContext);
  const navigation = useNavigation<FeedNavProp>();

  return (
    <>
      {post && (
        <PostItem
          post={post}
          marginV={false}
          onCommentPress={(post) => onPressReply?.(post)}
          onAvatarPress={() => navigation.navigate("UserProfile", { post })}
        />
      )}
    </>
  );
};

const Footer: FunctionComponent = () => {
  const { loading } = useContext(ReplyContext);

  return (
    <>
      {loading && (
        <View paddingV-16>
          <ActivityIndicator />
        </View>
      )}
    </>
  );
};

export default function PostReplies() {
  const {
    params: { post },
  } = useRoute<RouteProp<{ params: { post: SlurpPost } }>>();
  const transact = useSplingTransact();
  const { authedUser } = useContext(AuthedUserContext);
  const [replies, setReplies] = useState<SlurpReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const protoGetters = useSocialProtocolGetters();
  const [showReplyModal, setShowReplyModal] = useState(false);

  const addReply = useCallback(
    async (text: string) => {
      setShowReplyModal(false);
      try {
        const reply = await transact(async (socialProto) => {
          return await socialProto.createPostReply(post.postId, text);
        });

        setReplies((replies) => {
          return [
            ...replies,
            { ...reply, byConnectedUser: authedUser?.userId === reply.userId },
          ];
        });
      } catch {
        // TODO: handle reply error
      }
    },
    [transact, post, authedUser, setReplies, setShowReplyModal]
  );

  useEffect(() => {
    if (!protoGetters) return;

    (async () => {
      try {
        setLoadingReplies(true);
        const replies = await protoGetters?.getAllPostReplies(
          post.postId,
          100,
          0,
          Order_By.Asc
        );
        setReplies(replies);
      } finally {
        setLoadingReplies(false);
      }
    })();
  }, [protoGetters, post]);

  return (
    <ReplyContext.Provider
      value={{
        post,
        loading: loadingReplies,
        onPressReply: () => setShowReplyModal(true),
      }}
    >
      <FlatList
        ListHeaderComponent={PostWithContext}
        stickyHeaderIndices={[0]}
        style={{ flex: 1 }}
        data={replies}
        ListFooterComponent={Footer}
        keyExtractor={({ userId, timestamp }) => `${userId}${timestamp}`}
        renderItem={({ item }) => <ReplyItem reply={item} />}
      />

      <ReplyModal
        show={showReplyModal}
        onDismiss={() => setShowReplyModal(false)}
        onReply={addReply}
      />
    </ReplyContext.Provider>
  );
}
