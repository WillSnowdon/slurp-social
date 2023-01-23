import {
  FindNftsByOwnerOutput,
  JsonMetadata,
  Metaplex,
} from "@metaplex-foundation/js";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Colors, Text, View } from "react-native-ui-lib";

const getNftData = async (nftResult: FindNftsByOwnerOutput) => {
  return (await Promise.all(
    nftResult.map((nft) => {
      return fetch(nft.uri).then((r) => r.json());
    })
  )) as JsonMetadata[];
};

export default function NftSelect({
  userPubKey,
  onSelect,
}: {
  userPubKey: string;
  onSelect: (uri: string) => void;
}) {
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [nftMetadata, setNftMetada] = useState<JsonMetadata[]>([]);

  useEffect(() => {
    const metaplex = new Metaplex(connection);
    (async function () {
      try {
        setLoading(true);
        const nfts = await metaplex
          .nfts()
          .findAllByOwner({ owner: new PublicKey(userPubKey) });

        const nftMetadata = await getNftData(nfts);
        setNftMetada(nftMetadata);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [userPubKey]);

  return (
    <View flex centerH>
      <Text
        style={{ fontSize: 18, fontWeight: "700" }}
        color={Colors.primary}
        marginB-32
      >
        Select an NFT for your Avatar
      </Text>

      {loading && (
        <View center flex>
          <ActivityIndicator />
          <Text>loading jpegs...</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ flex: 1 }}
          data={nftMetadata}
          keyExtractor={(data) => data.name as string}
          renderItem={({ item }) => (
            <View marginB-16>
              <TouchableOpacity onPress={() => onSelect(item.image as string)}>
                <Image
                  style={{ height: 200, width: 200, borderRadius: 8 }}
                  source={{ uri: item.image }}
                />
                <Text
                  style={{
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
