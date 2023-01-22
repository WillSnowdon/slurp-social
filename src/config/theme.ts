import { Colors, ThemeManager } from "react-native-ui-lib";

Colors.loadColors({
  buttonBG: "#c183de",
  mainBG: "#fff",
  postBG: "#fff",
  replyBG: "#fafafa",
  postInputModalBG: "#fff",
  heart: "#d1b9dd",
  tabBarBG: "white",
  postInputBG: "white",
  bannerBG: "#d1b9dd",
  tabBarIcon: "#c183de",
  tabBarIconActive: "#c183de",
  lightIcon: Colors.$textNeutralLight,
});

ThemeManager.setComponentTheme("Button", {
  ["bg-buttonBG"]: true,
});
