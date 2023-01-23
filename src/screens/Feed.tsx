import React, { useContext } from "react";
import PostInput from "../components/PostInput";
import PostList, { PostListContext } from "../components/PostList";

export default function FeedScreen() {
  return (
    <PostList ListHeaderComponent={ListHeader} stickyHeaderIndices={[0]} />
  );
}

const ListHeader = () => {
  const { onPost } = useContext(PostListContext);

  return <PostInput onPost={onPost} />;
};
