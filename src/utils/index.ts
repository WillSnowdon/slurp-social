export * from "./AuthedUserContext";
export * from "./types";
export * from "./useAuthorization";
export * from "./useGuardedCallback";
export * from "./useSocialProtocolGetters";

export const abbreviatedKey = (pubKey: string) => {
  return `${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4)}`;
};
