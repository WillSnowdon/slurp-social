import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import React, { useState } from "react";
import { Button, ButtonProps } from "react-native-ui-lib";
import { useAuthorization, useGuardedCallback } from "../utils";

export default function ConnectButton(props: ButtonProps) {
  const { authorizeSession } = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const handleConnectPress = useGuardedCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }
      setAuthorizationInProgress(true);
      await transact(async (wallet) => {
        await authorizeSession(wallet);
      });
    } finally {
      setAuthorizationInProgress(false);
    }
  }, []);
  return (
    <Button
      {...props}
      disabled={authorizationInProgress}
      onPress={handleConnectPress}
    />
  );
}
