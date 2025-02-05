import { StyleSheet, View, FlatList, Text } from "react-native";
import StoryTile from "@/components/storyTile";
import { useTheme } from "@/theme/context";
import { useBookmarks } from "@/utility/bookmarkContext";

export default function Bookmarks() {
  const { colors } = useTheme();
  const { bookmarks } = useBookmarks();

  const ListEmptyComponent = () => (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.text }}>No bookmarks found</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <FlatList
        data={bookmarks}
        renderItem={({ item }) => <StoryTile story={item} />}
        keyExtractor={(item) => `story-${item.id}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    // padding: 16,
  },
});
