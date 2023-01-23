import { Colors, ThemeManager } from "react-native-ui-lib";

const primary = "#c183de";

Colors.loadColors({
  buttonBG: primary,
  mainBG: "#fff",
  primaryBG: primary,
  nickname: primary,
  primary,
  postBG: "#fff",
  replyBG: "#fafafa",
  postInputModalBG: "#fff",
  heart: "#d1b9dd",
  tabBarBG: "white",
  postInputBG: "white",
  bannerBG: "#d1b9dd",
  tabBarIcon: Colors.grey30,
  tabBarIconActive: primary,
  lightIcon: Colors.$textNeutralLight,
  hyperlink: "#2980b9",
});

ThemeManager.setComponentTheme("Button", {
  ["bg-buttonBG"]: true,
});
