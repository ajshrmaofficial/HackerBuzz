import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState, memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import HTMLView from 'react-native-htmlview';
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetBroswer } from "@/components/bottomSheetBrowser";
import { fetchItemsByIdsQuery } from "@/utility/HN_Firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { useTheme } from "@/theme/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HN_ITEM_TYPE } from "@/utility/definitions";
import { AntDesign } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, { withRepeat, withSequence, withTiming, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import React from "react";

// const COMMENT_FETCH_LIMIT = 10;

/**
 * TO FIX: 
 * - comment collapse logic
 * - clean out the code
 * - some ui fixes, etc.
 */

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
  const animatedOpacity = useDerivedValue(() => {
    return withRepeat(
      withSequence(
        withTiming(0.3, {duration: 800}),
        withTiming(0.7, {duration: 800})
      ),
      -1
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value
  }));

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
        <Animated.View style={[{ 
          width: 100, 
          height: 16, 
          backgroundColor: colors.border,
          borderRadius: 4 
        }, animatedStyle]} />
        <Animated.View style={[{ 
          width: 50, 
          height: 12, 
          backgroundColor: colors.border,
          borderRadius: 4 
        }, animatedStyle]} />
      </View>
      <Animated.View style={[{ 
        width: '100%', 
        height: 100, 
        backgroundColor: colors.border,
        borderRadius: 4 
      }, animatedStyle]} />
    </View>
  );
});

const CommentSeparator = memo(() => (
  <View style={styles.commentSeparator} />
));

const SingleComment = memo(({ comment, depth, maxDepth, onToggle, isCollapsed }: { 
  comment: HN_ITEM_TYPE, 
  depth: number, 
  maxDepth: number,
  onToggle: () => void,
  isCollapsed: boolean 
}) => {
  const { colors } = useTheme();

  const depthColor = [
    '#FFCDD2',
    '#F8BBD0',
    '#E1BEE7',
  ]

  const htmlViewStyles = StyleSheet.create({
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
  });
  
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
      <HTMLView 
        value={`<div>${comment.text}</div>`} 
        stylesheet={htmlViewStyles} 
        addLineBreaks={false}
        renderNode={(node, index) => {
          // Add custom node rendering optimization if needed
          return undefined;
        }}
      />
      {Array.isArray(comment.kids) && comment.kids?.length > 0 && (
        <Text style={[styles.repliesCount, { color: colors.text }]}>
          {isCollapsed ? '► ' : '▼ '}{comment.kids.length} {comment.kids.length === 1 ? 'reply' : 'replies'}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const Comments = memo(({commentIDs, depth = 0, maxDepth = 3}: {commentIDs: number[], depth: number, maxDepth: number}) => {
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(new Set());
  const { colors } = useTheme();

  const commentQuery = useQuery({
    queryKey: ['comments', commentIDs],
    queryFn: () => fetchItemsByIdsQuery(commentIDs),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const toggleComment = useCallback((commentId: number) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: HN_ITEM_TYPE }) => {
    const isCollapsed = collapsedComments.has(item.id);
    return (
      <>
        <SingleComment
          comment={item}
          depth={depth}
          maxDepth={maxDepth}
          onToggle={() => toggleComment(item.id)}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && item.kids && (
          <Comments
            commentIDs={item.kids}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        )}
      </>
    );
  }, [depth, maxDepth, collapsedComments, toggleComment]);

  if (!commentIDs.length) return null;
  if (commentQuery.isLoading) return <CommentSkeleton />;
  if (commentQuery.isError || !commentQuery.data) {
    return <Text>Error loading comments</Text>;
  }

  return (
    <FlatList
      data={commentQuery.data}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      ItemSeparatorComponent={CommentSeparator}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      initialNumToRender={10}
    />
  );
});

const CommentsScreen = () => {
  const postData = JSON.parse(useLocalSearchParams().postData as string) as HN_ITEM_TYPE;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const router = useRouter();

  if(!postData.kids || postData.kids.length === 0){
    return (
      <View style={styles.centerContainer}>
        <Text>No comments found</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom}}>
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.text }]}>{postData.title}</Text>
        <View style={{flexDirection: 'row', padding: 10}}>
          {[["by", "user"], ["score", "like2"], ["time", "clockcircleo"]].map((key) => (
            <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}} key={key[0]}>
              <AntDesign name={key[1] as "like2" | "user" | "clockcircleo"} size={12} color={colors.text} style={{marginRight: 5}} />
              <Text style={{color: colors.text, fontSize: 12, fontWeight: 'regular'}}>
                {key[0] === "time" ? formatDistanceToNow(fromUnixTime(postData.time)) : postData[key[0] as keyof HN_ITEM_TYPE]}
              </Text>
            </View>
          ))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={() => router.back()} style={{padding: 10}}>
            <Text style={{color: colors.backButton}}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(4)} style={{padding: 10}}>
            <Text style={{color: colors.backButton}}>Open Article</Text>
          </TouchableOpacity>
        </View>
        {/* <ScrollView style={styles.commentList}> */}
          <Comments commentIDs={postData.kids} depth={0} maxDepth={3} />
        {/* </ScrollView> */}
        <BottomSheetBroswer ref={bottomSheetRef} url={postData.url} />
      </View>
    </GestureHandlerRootView>
  );

};

const OptimizedCommentsScreen = React.memo(CommentsScreen);

export default OptimizedCommentsScreen;

