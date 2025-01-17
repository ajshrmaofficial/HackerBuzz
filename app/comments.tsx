import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HTMLView from 'react-native-htmlview';
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetBroswer } from "@/components/bottomSheetBrowser";
import { CommentLoader } from "@/utility/HN_Firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { useTheme } from "@/theme/context";

interface CommentTreeNode {
    id: number;
    by: string;
    text?: string;
    time: number;
    type: "comment";
    children: CommentTreeNode[];
    dead?: boolean;
    deleted?: boolean;
  }

interface CommentProps {
    comment: CommentTreeNode;
    depth?: number;
    maxDepth?: number;
    onPress?: (comment: CommentTreeNode) => void;
  }
  
  interface CommentsViewerProps {
    parentId: number;
    onError?: (error: Error) => void;
    initialMaxDepth?: number;
    onCommentPress?: (comment: CommentTreeNode) => void;
  }

const Comment: React.FC<CommentProps> = ({ 
    comment, 
    depth = 0, 
    maxDepth = 8,
    onPress 
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(depth > 3);
    const { colors } = useTheme();
  
    const handlePress = () => {
      if (onPress) {
        onPress(comment);
      } else {
        setIsCollapsed(!isCollapsed);
      }
    };
  
    const formatDate = (timestamp: number): string => {
      return formatDistanceToNow(fromUnixTime(timestamp), { addSuffix: true });
    };
  
    const htmlViewStyles = {
      p: { marginVertical: 0, fontSize: 14, lineHeight: 20, color: colors.text },
      a: { color: colors.link },
      pre: { backgroundColor: colors.secondary, padding: 8, borderRadius: 4 },
      code: { fontFamily: 'monospace', backgroundColor: colors.secondary },
    };
  
    if (comment.deleted || comment.dead) {
      return null;
    }
  
    const backgroundColor = depth % 2 === 0 ? colors.secondary : colors.primary;
  
    if (depth > maxDepth) {
      return (
        <TouchableOpacity 
          style={[styles.commentContainer, { backgroundColor }]}
          onPress={handlePress}
        >
          <Text style={[styles.moreReplies, { color: colors.link }]}>
            View more replies...
          </Text>
        </TouchableOpacity>
      );
    }
  
    return (
      <View style={{ marginLeft: depth * 12 }}>
        <TouchableOpacity 
          style={[styles.commentContainer, { backgroundColor }]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.commentHeader}>
            <Text style={[styles.username, { color: colors.link }]}>{comment.by}</Text>
            <Text style={[styles.timestamp, { color: colors.text }]}>{formatDate(comment.time)}</Text>
          </View>
          
          {!isCollapsed && comment.text && (
            <HTMLView
              value={comment.text}
              stylesheet={htmlViewStyles}
              addLineBreaks={false}
            />
          )}
  
          {comment.children?.length > 0 && (
            <Text style={[styles.repliesCount, { color: colors.text }]}>
              {isCollapsed ? '► ' : '▼ '}
              {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
            </Text>
          )}
        </TouchableOpacity>
  
        {!isCollapsed && comment.children?.map((child) => (
          <Comment 
            key={child.id} 
            comment={child} 
            depth={depth + 1}
            maxDepth={maxDepth}
            onPress={onPress}
          />
        ))}
      </View>
    );
  };
  
  // Main Comments Viewer Component
  const CommentsViewer: React.FC<CommentsViewerProps> = ({ 
    parentId,
    onError,
    initialMaxDepth = 8,
    onCommentPress
  }) => {
    const [comments, setComments] = useState<CommentTreeNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
  
    const loadComments = async () => {
      try {
        setLoading(true);
        const loader = new CommentLoader();
        const commentTree = await loader.getFormattedCommentTree(parentId);
        setComments(commentTree);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadComments();
    }, [parentId]);
  
    const onRefresh = async () => {
      setRefreshing(true);
      await loadComments();
      setRefreshing(false);
    };
  
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
          <Text style={[styles.errorText, { color: colors.errorText }]}>Error loading comments: {error.message}</Text>
        </View>
      );
    }
  
    if (!comments) {
      return (
        <View style={styles.centerContainer}>
          <Text>No comments found</Text>
        </View>
      );
    }
  
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <Comment 
            comment={comments} 
            maxDepth={initialMaxDepth}
            onPress={onCommentPress}
          />
        </ScrollView>
      </SafeAreaView>
    );
  };
  
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
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
      borderLeftWidth: 1,
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
    }
  });
  
export default function Comments() {
    const commentIds = (useLocalSearchParams().commentIds as string).split(',');
    const storyURL = useLocalSearchParams().storyURL as string;
    const title = useLocalSearchParams().title as string;
    const bottomSheetRef = useRef<BottomSheet>(null);

    const router = useRouter();
    const { colors } = useTheme();
  
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <View style={[styles.container, { backgroundColor: colors.primary }]}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={() => router.back()} style={{padding: 10}}>
                        <Text style={{color: colors.backButton}}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(4)} style={{padding: 10}}>
                        <Text style={{color: colors.backButton}}>Open Article</Text>
                    </TouchableOpacity>
                 </View>
                <CommentsViewer 
                    parentId={Number(commentIds[0])}
                    onError={(error) => console.error(error)}
                    initialMaxDepth={8}
                />
                <BottomSheetBroswer ref={bottomSheetRef} url={storyURL} />
            </View>
        </GestureHandlerRootView>
    );
}
