import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Text, TouchableOpacity, View } from "react-native-ui-lib";
import useTransferTransactions from "../utils/useTransferTransactions";
import TipForm from "./TipForm";

export type TipModalProps = {
  tipUser?: { nickname: string; publicKey: string };
  onDismiss?: () => void;
  onDone: () => void;
};

export default function TipModal({
  tipUser,
  onDone,
  onDismiss,
}: TipModalProps) {
  const { tipUserSol } = useTransferTransactions();
  return (
    <Modal
      isVisible={!!tipUser}
      onBackdropPress={onDismiss}
      onBackButtonPress={onDismiss}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View flex centerV>
          <View bg-postInputModalBG padding-24 br30>
            <View row centerV marginB-24>
              <Text flex style={{ fontSize: 24 }} color={Colors.primary}>
                Tip {tipUser?.nickname}
              </Text>

              <TouchableOpacity
                onPress={onDismiss}
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
                    tipUserSol(
                      new PublicKey(tipUser.publicKey),
                      tipUser.nickname,
                      amount
                    );

                    onDone();
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
  );
}
