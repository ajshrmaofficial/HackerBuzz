import { HN_ITEM_TYPE } from "@/utility/definitions";

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