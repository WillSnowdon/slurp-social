import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import {
  Button,
  Incubator,
  KeyboardAwareScrollView,
  Text,
  View,
} from "react-native-ui-lib";
import AuthedUserAvatar from "./AuthedUserAvatar";

export type ReplyModalProps = {
  show: boolean;
  onReply: (text: string) => void;
  onDismiss: () => void;
};

export default ({ show, onReply: onPost, onDismiss }: ReplyModalProps) => {
  return (
    <Modal
      isVisible={show}
      onBackdropPress={onDismiss}
      onBackButtonPress={onDismiss}
      style={{ margin: 0 }}
    >
      <View bg-postInputModalBG flex paddingH-24 paddingB-16>
        <SafeAreaView style={{ flex: 1 }}>
          <View flex paddingT-8>
            <TouchableOpacity
              onPress={onDismiss}
              accessibilityLabel="Close Modal"
            >
              <MaterialIcons name="close" size={32} />
            </TouchableOpacity>
            {show && <ReplyInputForm onSubmit={onPost} />}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const ReplyInputForm = ({
  onSubmit,
}: {
  onSubmit?: (text: string) => void;
}) => {
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const handleReply = useCallback(() => {
    onSubmit?.(text);
  }, [onSubmit, text]);

  return (
    <>
      <View row centerV marginV-16>
        <AuthedUserAvatar size={52} />
        <View marginL-16 flex>
          <Text>Tell em what you think</Text>
        </View>
      </View>

      <KeyboardAwareScrollView>
        <Incubator.TextField
          ref={inputRef}
          showCharCounter
          placeholder="Reply.."
          maxLength={512}
          multiline
          onChangeText={setText}
        />
      </KeyboardAwareScrollView>

      <Button disabled={text.length === 0} label="Ok" onPress={handleReply} />
    </>
  );
};
