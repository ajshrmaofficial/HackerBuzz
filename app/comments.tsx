import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState, memo, useCallback, useEffect, useMemo, RefObject } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import HTMLView from 'react-native-htmlview';
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetBroswer from "@/components/bottomSheetBrowser";
import { fetch } from "@/utility/HN_Firebase";
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { useTheme } from "@/theme/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HN_ITEM_TYPE } from "@/utility/definitions";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueries, useQuery } from "@tanstack/react-query";
import React from "react";
import { Share } from "react-native";
import { useBookmarks } from "../utility/bookmarkContext";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    paddingInline: 10
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
  },
  repliesCount: {
    marginTop: 8,
    fontSize: 12,
  },
  moreReplies: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
  },
  commentSeparator: {
    height: 8
  }
});

const CommentSkeleton = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={[styles.commentContainer, { 
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
      borderLeftWidth: 1,
      borderColor: colors.commentBorder,
      backgroundColor: colors.secondary,
    }]}>
      <View style={styles.commentHeader}>
        <View style={{ 
          width: 100, 
          height: 16, 
          backgroundColor: colors.border,
          borderRadius: 4}} />
        <View style={{ 
          width: 50, 
          height: 12, 
          backgroundColor: colors.border,
          borderRadius: 4 
        }} />
      </View>
      <View style={{ 
        width: '100%', 
        height: 100, 
        backgroundColor: colors.border,
        borderRadius: 4 
      }} />
    </View>
  );
});

const CommentSeparator = memo(() => (
  <View style={styles.commentSeparator} />
));

const HTMLViewer = memo(({ content }: { content: string | undefined }) => {
  const { colors } = useTheme();

  if (!content) return null;

  const htmlViewStyles = useMemo(()=>StyleSheet.create({
    p: { marginVertical: 0, fontSize: 14, lineHeight: 20, color: colors.text },
    a: { color: colors.link, textDecorationLine: 'underline' as 'underline' },
    pre: { backgroundColor: colors.secondary, padding: 8, borderRadius: 4, color: colors.text },
    code: { fontFamily: 'monospace', backgroundColor: colors.secondary, color: colors.text },
    blockquote: { borderLeftWidth: 4, borderLeftColor: colors.border, paddingLeft: 8, color: colors.textSecondary },
    ul: { marginVertical: 8, paddingLeft: 20, color: colors.text },
    ol: { marginVertical: 8, paddingLeft: 20, color: colors.text },
    li: { marginVertical: 4, color: colors.text },
    h1: { fontSize: 20, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    h2: { fontSize: 18, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    h3: { fontSize: 16, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    h4: { fontSize: 14, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    h5: { fontSize: 12, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    h6: { fontSize: 10, fontWeight: 'bold', marginVertical: 8, color: colors.text },
    strong: { fontWeight: 'bold', color: colors.text },
    em: { fontStyle: 'italic', color: colors.text },
    i: { fontStyle: 'italic', color: colors.text },
    b: { fontWeight: 'bold', color: colors.text },
    div: { color: colors.text }
  }), [colors]);

  return (
    <HTMLView 
      value={`<div>${content}</div>`} 
      stylesheet={htmlViewStyles} 
      addLineBreaks={false}
      renderNode={(node, index) => {
        return undefined;
      }}
    />
  );
});

const CommentBody = memo(({ comment, depth, maxDepth, onToggle, isCollapsed }: { 
  comment: HN_ITEM_TYPE, 
  depth: number, 
  maxDepth: number,
  onToggle: () => void,
  isCollapsed: boolean 
}) => {
  const { colors } = useTheme();

  const depthColor = [
    '#FF5722', // Vibrant red
    '#4CAF50', // Vibrant green
    '#2196F3', // Vibrant blue
  ]

  return (
    <TouchableOpacity 
      onPress={onToggle}
      style={[
        styles.commentContainer, 
        {
          borderLeftWidth: depth === 0 ? 0 : 1,
          marginLeft: depth * 12,
          borderColor: depthColor[depth % 3]
        }
      ]}
    >
      <View style={styles.commentHeader}>
        <Text style={[styles.username, { color: colors.link }]}>{comment.by}</Text>
        <Text style={[styles.timestamp, { color: colors.text }]}>
          {formatDistanceToNow(fromUnixTime(comment.time))}
        </Text>
      </View>
      <HTMLViewer content={comment.text} />
      {Array.isArray(comment.kids) && comment.kids?.length > 0 && (
        <Text style={[styles.repliesCount, { color: colors.text }]}>
          {isCollapsed ? '► ' : '▼ '}{comment.kids.length} {comment.kids.length === 1 ? 'reply' : 'replies'}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const NestedComments = memo(({ commentIDs, depth, maxDepth }: { 
  commentIDs: number[], 
  depth: number, 
  maxDepth: number 
}) => {
  const commentQueries = useQueries({
    queries: commentIDs.map(id => ({
      queryKey: ['comment', id],
      queryFn: () => fetch("item", id),
      staleTime: 5 * 60 * 1000,
    }))
  });

  const loadedComments = commentQueries
    .filter(query => query.isSuccess && query.data)
    .map(query => query.data as HN_ITEM_TYPE);

  return (
    <>
      {loadedComments.map(comment => (
        <Comment 
          key={comment.id} 
          comment={comment} 
          depth={depth} 
          maxDepth={maxDepth} 
        />
      ))}
    </>
  );
});

const Comment = memo(({ comment, depth, maxDepth }: {
  comment: HN_ITEM_TYPE,
  depth: number,
  maxDepth: number
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);

  return (
    <>
      <CommentBody
        comment={comment}
        depth={depth}
        maxDepth={maxDepth}
        onToggle={toggleCollapse}
        isCollapsed={isCollapsed}
      />
      {!isCollapsed && comment.kids && depth < maxDepth && (
        <NestedComments
          commentIDs={comment.kids}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      )}
    </>
  );
});

const Header = memo(({ postData, bottomSheetRef }: { postData: HN_ITEM_TYPE, bottomSheetRef: RefObject<BottomSheetMethods> }) => {
  const { colors } = useTheme();
  return(
    <>
      <Text style={[styles.title, { color: colors.text }]}>{postData.title}</Text>
      
      <HeaderActions 
        postData={postData}
        bottomSheetRef={bottomSheetRef}
      />

      {postData.text && (
        <View style={{padding: 10}}>
          <HTMLViewer content={postData.text} />
        </View>
      )}
    </>
  )
});

const Comments = memo(({postData, bottomSheetRef}: {postData: HN_ITEM_TYPE, bottomSheetRef: RefObject<BottomSheetMethods>}) => {
  const commentIDs = postData.kids as number[];

  const RenderItem = useCallback(({ itemId }: { itemId: number }) => {
    const {data, isLoading, isError} = useQuery({
      queryKey: [itemId],
      queryFn: () => fetch("item", itemId),
      staleTime: 5 * 60 * 1000, 
    });

    if (isLoading) return <CommentSkeleton />;

    if (isError || !data) {
      return <Text style={{color: 'red'}}>Error loading comment</Text>;
    }

    return (
      <Comment
        comment={data}
        depth={0}
        maxDepth={3}
      />
    );
  }, []);

  if (!commentIDs.length) return null;

  return (
    <FlatList
      data={commentIDs}
      ListHeaderComponent={()=><Header postData={postData} bottomSheetRef={bottomSheetRef} />}
      renderItem={({item})=> <RenderItem itemId={item} />}
      keyExtractor={item => item.toString()}
      ItemSeparatorComponent={CommentSeparator}
      maxToRenderPerBatch={5}
      windowSize={3}
      removeClippedSubviews={true}
      initialNumToRender={5}
      updateCellsBatchingPeriod={50}
      onEndReachedThreshold={0.5}
    />
  );
});

const HeaderActions = memo(({ postData, bottomSheetRef }: {
  postData: HN_ITEM_TYPE,
  bottomSheetRef: React.RefObject<BottomSheet>,
}) => {
  const { colors } = useTheme();
  const { addBookmark, removeBookmark, checkIsBookmark } = useBookmarks();
  const router = useRouter();
  const isBookmarked = checkIsBookmark?.(postData.id) ?? false;

  const handleShare = useCallback(async () => {
    const shareObject = {
      message: `${postData.title}\nArticle: ${postData.url}\nPost: https://news.ycombinator.com/item?id=${postData.id}`,
      url: undefined,
      title: postData.title,
    };
    try {
      if (postData.url) await Share.share(shareObject);
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  }, [postData]);

  const handleBookmark = useCallback(() => {
    if (isBookmarked) {
      removeBookmark(postData.id);
    } else {
      addBookmark(postData.id);
    }
  }, [isBookmarked, postData.id, addBookmark, removeBookmark]);

  return (
    <>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 10}}>
          <Text style={{color: colors.backButton, fontWeight: 'bold'}}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(4)} style={{padding: 10}}>
          <Text style={{color: colors.backButton, fontWeight: 'bold'}}>Open Article</Text>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', padding: 10}}>
          {[["by", "user"], ["score", "like2"], ["time", "clockcircleo"]].map((key) => (
            <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}} key={key[0]}>
              <AntDesign name={key[1] as "like2" | "user" | "clockcircleo"} size={12} color={colors.text} style={{marginRight: 5}} />
              <Text style={{color: colors.text, fontSize: 14}}>
                {key[0] === "time" ? formatDistanceToNow(fromUnixTime(postData.time)) : postData[key[0] as keyof HN_ITEM_TYPE]}
              </Text>
            </View>
          ))}
        </View>
        <View style={{flexDirection: 'row', padding: 10}}>
          <TouchableOpacity onPress={handleShare}>
            <AntDesign name="sharealt" size={20} color={colors.backButton} style={{marginRight: 15}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmark}>
            <MaterialCommunityIcons 
              name={isBookmarked ? "bookmark-off-outline" : "bookmark-outline"} 
              size={22} 
              color={colors.backButton} 
              style={{marginRight: 5}} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
});

export default memo(function CommentsScreen() {
  const postData = JSON.parse(useLocalSearchParams().postData as string) as HN_ITEM_TYPE;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  if (!postData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.primary }]}>
        <Text style={{color: colors.text}}>No post data found</Text>
      </View>
    );
  }

  useEffect(()=>{
    const timeout = setTimeout(() => {
      if (!postData.kids || postData.kids.length <= 2) {
        bottomSheetRef.current?.snapToIndex(8);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {postData.kids && postData.kids.length > 0 ? (
        <Comments postData={postData} bottomSheetRef={bottomSheetRef} />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={{color: colors.text}}>No comments found</Text>
        </View>
      )}

      <BottomSheetBroswer ref={bottomSheetRef} url={postData.url} />
    </View>
  );

});
