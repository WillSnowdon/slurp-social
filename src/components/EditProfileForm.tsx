import React, { useMemo, useState } from "react";
import { Image } from "react-native-image-crop-picker";
import { Button, Incubator, View } from "react-native-ui-lib";
import { SlurpUser } from "../utils";
import EditableAvatar from "./EditableAvatar";

export type EditProfileFormData = {
  avatar?: Image;
  username: string;
  bio: string;
};

export type EditProfileFormProps = {
  user: SlurpUser;
  onUpdate: (data: EditProfileFormData) => void;
};

export default function EditProfileForm({
  user,
  onUpdate,
}: EditProfileFormProps) {
  const [userName, setUserName] = useState(user.nickname);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState<Image>();

  const avatarUri = useMemo(() => {
    return avatar?.path || (user.avatar ? user.avatar : undefined);
  }, [user, avatar]);

  return (
    <View center flex>
      <EditableAvatar uri={avatarUri} size={150} onUpdate={setAvatar} />
      <View width={260} marginT-32>
        <Incubator.TextField
          showCharCounter
          placeholder="Nickname"
          value={userName}
          floatingPlaceholder
          maxLength={64}
          onChangeText={setUserName}
        />

        <Incubator.TextField
          showCharCounter
          placeholder="Bio"
          maxLength={256}
          floatingPlaceholder
          multiline
          value={bio}
          onChangeText={setBio}
        />
        <View marginT-16>
          <Button
            disabled={userName.length === 0 && !!avatar?.path}
            label="Update"
            onPress={() => {
              onUpdate({ username: userName, bio, avatar });
            }}
          />
        </View>
      </View>
    </View>
  );
}
