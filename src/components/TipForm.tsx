import React, { useState } from "react";
import { Button, Incubator, Picker, View } from "react-native-ui-lib";

type TokenOption = { name: string };
const supportedTokens: TokenOption[] = [
  {
    name: "SOL",
  },
];

export default function TipForm({
  onSubmit,
}: {
  onSubmit: (token: TokenOption, amount: number) => void;
}) {
  const [selected, setSelected] = useState(supportedTokens[0].name);
  const [value, setValue] = useState<number>(0);

  return (
    <View>
      <Picker
        value={selected}
        placeholder="Token"
        floatingPlaceholder
        onChange={(option: { value: string }) => {
          setSelected(
            supportedTokens.find((t) => t.name === option.value)?.name as string
          );
        }}
      >
        {supportedTokens.map((item) => (
          <Picker.Item key={item.name} value={item.name} label={item.name} />
        ))}
      </Picker>

      <Incubator.TextField
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        floatingPlaceholder
        placeholder="Amount"
      />

      <Button
        marginT-32
        label="Send Tip"
        disabled={!+value || !selected}
        onPress={() =>
          onSubmit(
            supportedTokens.find((t) => t.name === selected) as TokenOption,
            +value
          )
        }
      />
    </View>
  );
}
