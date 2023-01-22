import { SocialProtocol } from "@spling/social-protocol";
import { useEffect, useMemo, useState } from "react";
import { useAuthorization } from "./useAuthorization";

export function useSocialProtocolGetters():
  | (Pick<
      SocialProtocol,
      | "getUserByPublicKey"
      | "getUserGroup"
      | "getAllPosts"
      | "getAllPostReplies"
    > & {
      getAuthedUser: () => ReturnType<SocialProtocol["getUserByPublicKey"]>;
    })
  | undefined {
  const { selectedAccount } = useAuthorization();
  const [socialProtocol, setSocialProtocol] = useState<SocialProtocol>();

  useEffect(() => {
    if (!selectedAccount) return;

    (async () => {
      const walletMock = {
        publicKey: selectedAccount.publicKey,
        payer: null as any,
      } as any;
      const social = new SocialProtocol(walletMock, null, {
        rpcUrl: "https://api.mainnet-beta.solana.com/",
        useIndexer: true,
      });
      setSocialProtocol(social);
    })();
  }, [selectedAccount]);

  const callbacks = useMemo(() => {
    if (!socialProtocol || !selectedAccount) {
      return;
    }

    return {
      getAuthedUser: () =>
        socialProtocol.getUserByPublicKey(selectedAccount.publicKey),
      ...socialProtocol,
    };
  }, [socialProtocol, selectedAccount]);

  return callbacks;
}
