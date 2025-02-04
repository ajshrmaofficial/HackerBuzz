import { useTheme } from "@/theme/context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const BookmarkIcon = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const onPress = () => {
    router.push({ pathname: "/bookmarks" });
  };

  /**
   * Currently, the `onPress` function is not working as expected.
   * When trying to call onPress on HeaderRight, the screen is not navigating to the settings screen.
   * Refer - https://github.com/expo/expo/issues/29489
   * That is why using onPressIn for now.
   */

  return (
    <TouchableOpacity onPressIn={onPress} style={{ padding: 10 }}>
      <AntDesign name="book" size={24} color={colors.text} />
    </TouchableOpacity>
  );
};

export default BookmarkIcon;
