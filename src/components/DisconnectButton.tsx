import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import React from "react";
import { Button, ButtonProps } from "react-native-ui-lib";

import { useAuthorization } from "../utils/useAuthorization";

export default function DisconnectButton(props: ButtonProps) {
  const { deauthorizeSession } = useAuthorization();
  return (
    <Button
      {...props}
      onPress={() => {
        transact(async (wallet) => {
          await deauthorizeSession(wallet);
        });
      }}
    />
  );
}
