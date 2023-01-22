import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import ImagePicker, { ImageOrVideo } from "react-native-image-crop-picker";
import Modal from "react-native-modal";
import {
  Button,
  Colors,
  Image,
  Incubator,
  KeyboardAwareScrollView,
  Text,
  View,
} from "react-native-ui-lib";
import AuthedUserAvatar from "./AuthedUserAvatar";

const getTags = (text: string): string[] =>
  text.match(/(#+[a-zA-Z0-9(_)]{1,})/g) ?? [];

export type PostInputProps = {
  onPost?: (text: string, image?: ImageOrVideo) => void;
};

export const PostContext = React.createContext<PostInputProps>({});

export default forwardRef(() => {
  const { onPost } = useContext(PostContext);
  const [showModal, setShowModal] = useState(false);
  const closeModal = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  const handlePost = useCallback(
    (text: string, media?: ImageOrVideo) => {
      onPost?.(text, media);
      setShowModal(false);
    },
    [onPost, setShowModal]
  );

  return (
    <>
      <View paddingH-24 padding-16 row centerV bg-postInputBG>
        <AuthedUserAvatar size={48} />
        <View paddingL-16 flex>
          <TouchableOpacity
            onPress={() => {
              setShowModal(true);
            }}
          >
            <View
              style={{ borderColor: Colors.grey10, borderWidth: 1 }}
              paddingH-16
              paddingV-8
              br100
            >
              <Text>Sup?</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        isVisible={showModal}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={{ margin: 0 }}
      >
        <View bg-postInputModalBG flex paddingH-24 paddingB-16>
          <SafeAreaView style={{ flex: 1 }}>
            <View flex paddingT-8>
              <TouchableOpacity
                onPress={closeModal}
                accessibilityLabel="Close Modal"
              >
                <MaterialIcons name="close" size={32} />
              </TouchableOpacity>
              {showModal && <PostInputForm onPost={handlePost} />}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
});

const PostInputForm = ({
  onPost,
}: {
  onPost?: (text: string, image?: ImageOrVideo) => void;
}) => {
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<ImageOrVideo>();
  const handlePost = useCallback(() => {
    onPost?.(text, media);
  }, [onPost, text, media]);

  const handleMediaSelection = useCallback(async () => {
    try {
      const pickedImage = await ImagePicker.openPicker({
        multiple: false,
        mediaType: "photo",
      });

      const croppedImage = await ImagePicker.openCropper({
        path: pickedImage.path,
        mediaType: "photo",
        enableRotationGesture: false,
        cropperRotateButtonsHidden: true,
      });

      setMedia(croppedImage);
    } catch (e) {
      console.log(e);
    }
  }, [setMedia]);

  return (
    <>
      <View row centerV marginV-16>
        <AuthedUserAvatar size={52} />
        <View marginL-16 flex>
          <Text>Say some stuff</Text>
        </View>
        <TouchableOpacity
          onPress={handleMediaSelection}
          accessibilityLabel="Add media"
        >
          <MaterialIcons
            name="image"
            size={32}
            color={Colors.$iconPrimaryLight}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView>
        <Incubator.TextField
          ref={inputRef}
          showCharCounter
          placeholder="What's on your mind.."
          maxLength={512}
          multiline
          onChangeText={setText}
        />
      </KeyboardAwareScrollView>
      {media && (
        <View
          marginB-32
          style={{
            overflow: "hidden",
            borderRadius: 16,
            backgroundColor: "red",
          }}
        >
          <Image style={{ height: 200 }} source={{ uri: media.path }} />
        </View>
      )}

      <Button disabled={text.length === 0} label="Slurp" onPress={handlePost} />
    </>
  );
};
