import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BookmarkContextType {
    bookmarks: Set<number>;
    addBookmark: (bookmark: number) => void;
    removeBookmark: (bookmark: number) => void;
    checkIsBookmark: (bookmark: number) => boolean;
  }
  
  const BookmarkContext = createContext<BookmarkContextType>({
    bookmarks: new Set(),
    addBookmark: () => {},
    removeBookmark: () => {},
    checkIsBookmark: () => false,
  });
  
  export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  
    useEffect(() => {
      const loadBookmarks = async () => {
        try {
          const savedBookmarks = await AsyncStorage.getItem("bookmarks");
          if (savedBookmarks) {
            setBookmarks(new Set(JSON.parse(savedBookmarks)));
          }
        } catch (error) {
          console.error("Failed to load bookmarks:", error);
        }
      };
  
      loadBookmarks();
    }, [])

    useEffect(() => {
      const saveBookmarks = async () => {
        try {
          await AsyncStorage.setItem("bookmarks", JSON.stringify(Array.from(bookmarks)));
        } catch (error) {
          console.error("Failed to save bookmarks:", error);
        }
      };
  
      saveBookmarks();
    }, [bookmarks]);
  
    const addBookmark = useCallback((id: number) => {
      setBookmarks(prev => new Set([...prev, id]));
    }, []);
  
    const removeBookmark = useCallback((id: number) => {
      setBookmarks(prev => {
        const next = new Set([...prev]);
        next.delete(id);
        return next;
      });
    }, []);

    const checkIsBookmark = useCallback((id: number) => {
      return bookmarks.has(id);
    }, [bookmarks]);
  
    return (
      <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, checkIsBookmark }}>
        {children}
      </BookmarkContext.Provider>
    );
  }
  
  export const useBookmarks = () => useContext(BookmarkContext);