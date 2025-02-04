import { StyleSheet, View, FlatList, Text } from "react-native";
import StoryTile from "@/components/storyTile";
import { HN_ITEM_TYPE } from "@/utility/definitions";
import { useTheme } from "@/theme/context";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BookmarkContextType {
  bookmarks: HN_ITEM_TYPE[];
  addBookmark: (bookmark: HN_ITEM_TYPE) => void;
  removeBookmark: (bookmark: HN_ITEM_TYPE) => void;
}

const BookmarkContext = createContext<BookmarkContextType>({
  bookmarks: [],
  addBookmark: () => {},
  removeBookmark: () => {},
});

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<HN_ITEM_TYPE[]>([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const savedBookmarks = await AsyncStorage.getItem("bookmarks");
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      }
    };

    loadBookmarks();
  }, [])

  const addBookmark = (bookmark: HN_ITEM_TYPE) => {
    if (bookmarks.find((prevBookmark) => prevBookmark.id === bookmark.id)) {
      return;
    }
    setBookmarks((prevBookmarks) => [...prevBookmarks, bookmark]);
    AsyncStorage.setItem("bookmarks", JSON.stringify([...bookmarks, bookmark]));
  };

  const removeBookmark = (bookmark: HN_ITEM_TYPE) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((prevBookmark) => prevBookmark.id !== bookmark.id)
    );
    AsyncStorage.setItem(
      "bookmarks",
      JSON.stringify(bookmarks.filter((prevBookmark) => prevBookmark.id !== bookmark.id))
    );
  }; 

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarkContext);

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
