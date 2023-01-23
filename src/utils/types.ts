import { Post, Reply, User } from "@spling/social-protocol";

/**
 * SocialProtocol Post with some extra precalc info and string pubKeys for serialization purposs
 */
export type SlurpPost = Omit<Post, "publicKey" | "user"> & {
  liked: boolean;

  byConnectedUser: boolean;
  /**
   * pub key converted to string for react nav serialization
   */
  publicKey: string;
  user: Omit<Post["user"], "publicKey"> & { publicKey: string };
};

export type SlurpReply = Reply & {
  byConnectedUser: boolean;
};

export type SlurpUser = Omit<User, "publicKey"> & { publicKey: string };
