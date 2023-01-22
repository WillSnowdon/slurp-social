import { NavigationProp } from "@react-navigation/native";
import { SlurpPost } from "../utils";

export type FeedNavProp = NavigationProp<{
  PostReplies: { post: SlurpPost };
  UserProfile: { post: SlurpPost };
}>;
