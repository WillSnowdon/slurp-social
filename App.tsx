// import "./polyfills";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl, PublicKey, PublicKeyInitData } from "@solana/web3.js";
import React, { Suspense } from "react";
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Cache, SWRConfig } from "swr";
import MainScreen from "./src/screens/Main";
import { DataProvider } from "./src/utils";

const DEVNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl("mainnet-beta");

function cacheReviver(key: string, value: any) {
  if (key === "publicKey") {
    return new PublicKey(value as PublicKeyInitData);
  } else {
    return value;
  }
}

const STORAGE_KEY = "app-cache";
let initialCacheFetchPromise: Promise<void>;
let initialCacheFetchResult: any;
function asyncStorageProvider() {
  if (initialCacheFetchPromise == null) {
    initialCacheFetchPromise = AsyncStorage.getItem(STORAGE_KEY).then(
      (result) => {
        initialCacheFetchResult = result;
      }
    );
    throw initialCacheFetchPromise;
  }
  let storedAppCache;
  try {
    storedAppCache = JSON.parse(initialCacheFetchResult, cacheReviver);
  } catch {}
  const map = new Map(storedAppCache || []);
  initialCacheFetchResult = undefined;
  function persistCache() {
    const appCache = JSON.stringify(Array.from(map.entries()));
    AsyncStorage.setItem(STORAGE_KEY, appCache);
  }
  AppState.addEventListener("change", (state) => {
    if (state !== "active") {
      persistCache();
    }
  });
  AppState.addEventListener("memoryWarning", () => {
    persistCache();
  });
  return map as Cache<any>;
}

export default function App() {
  return (
    <ConnectionProvider
      config={{ commitment: "processed" }}
      endpoint={DEVNET_ENDPOINT}
    >
      <SafeAreaView style={styles.shell}>
        <Suspense
          fallback={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" style={styles.loadingIndicator} />
            </View>
          }
        >
          <SWRConfig value={{ provider: asyncStorageProvider }}>
            <DataProvider>
              <MainScreen />
            </DataProvider>
          </SWRConfig>
        </Suspense>
      </SafeAreaView>
    </ConnectionProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: "100%",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginVertical: "auto",
  },
  shell: {
    height: "100%",
  },
});
