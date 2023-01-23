import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useContext } from "react";
import { useToast } from "react-native-toast-notifications";
import { AuthedUserContext } from "./AuthedUserContext";
import { useAuthorization } from "./useAuthorization";
import { useGuardedCallback } from "./useGuardedCallback";

export default function useTransferTransactions() {
  const { authorizeSession } = useAuthorization();
  const { authedUser } = useContext(AuthedUserContext);
  const { connection } = useConnection();
  const toast = useToast();

  const tipUserSol = useGuardedCallback(
    async (to: PublicKey, nickname: string, solAmount: number) => {
      if (!authedUser) return;
      const txIds = await transact(async (wallet) => {
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

        return await wallet.signAndSendTransactions({
          transactions: [transferTransaction],
        });
      });

      console.log(
        `tipped ${solAmount} SOL to ${to.toString()} - ${txIds.toString()}`
      );

      toast.show(`Tipped ${nickname} ${solAmount}SOL!`, { type: "success" });
    },
    [connection, authedUser, toast, authorizeSession]
  );

  return { tipUserSol };
}
