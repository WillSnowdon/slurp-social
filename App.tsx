// import "./polyfills";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl, PublicKey, PublicKeyInitData } from "@solana/web3.js";
import React, { Suspense } from "react";
import { AppState, LogBox, SafeAreaView, StyleSheet } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { View } from "react-native-ui-lib";
import { Cache, SWRConfig } from "swr";
import MainScreen from "./src/screens/Main";

const MAINNET_ENDPOINT = /*#__PURE__*/ clusterApiUrl("mainnet-beta");

// Ignore annoying ui lib migration warnings
LogBox.ignoreLogs([/^RNUILib/i]);

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
      endpoint={MAINNET_ENDPOINT}
    >
      <ToastProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.shell}>
            <View flex bg-primaryBG>
              <Suspense fallback={null}>
                <SWRConfig value={{ provider: asyncStorageProvider }}>
                  <MainScreen />
                </SWRConfig>
              </Suspense>
            </View>
          </SafeAreaView>
        </NavigationContainer>
      </ToastProvider>
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
