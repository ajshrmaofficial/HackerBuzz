import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState, memo, useCallback, useEffect, useMemo, RefObject } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Share,
} from "react-native";
import HTMLView from "react-native-htmlview";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetBroswer from "@/components/bottomSheetBrowser";
import { fetch } from "@/utility/HN_Firebase";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { useTheme } from "@/theme/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HN_ITEM_TYPE } from "@/utility/definitions";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useBookmarks } from "../utility/bookmarkContext";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { FlashList } from "@shopify/flash-list";

const MAX_COMMENT_DEPTH = 14;
const INDENT_PER_DEPTH = 11;
const MAX_VISUAL_DEPTH = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 8,
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentCard: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  commentMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  repliesHint: {
    marginTop: 6,
    fontSize: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  metaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

function buildVisibleCommentRows(
  rootIds: number[],
  maxDepth: number,
  collapsedIds: ReadonlySet<number>,
  getComment: (id: number) => HN_ITEM_TYPE | null | undefined,
): Array<{ id: number; depth: number }> {
  const rows: Array<{ id: number; depth: number }> = [];
  const walk = (ids: number[], depth: number) => {
    if (depth > maxDepth) return;
    for (const id of ids) {
      rows.push({ id, depth });
      if (collapsedIds.has(id)) continue;
      const c = getComment(id);
      if (c?.kids?.length && depth < maxDepth) {
        walk(c.kids, depth + 1);
      }
    }
  };
  walk(rootIds, 0);
  return rows;
}

const CommentSkeleton = memo(({ depth }: { depth: number }) => {
  const { colors } = useTheme();
  const indent = Math.min(depth, MAX_VISUAL_DEPTH) * INDENT_PER_DEPTH;

  return (
    <View
      style={[
        styles.commentCard,
        {
          marginLeft: 12 + indent,
          marginVertical: 4,
          borderColor: colors.commentBorder,
          backgroundColor: colors.secondary,
        },
      ]}
    >
      <View style={styles.commentHeader}>
        <View
          style={{
            width: 100,
            height: 14,
            backgroundColor: colors.border,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 56,
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 4,
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          height: 72,
          backgroundColor: colors.border,
          borderRadius: 4,
        }}
      />
    </View>
  );
});

const HTMLViewer = memo(({ content }: { content: string | undefined }) => {
  const { colors } = useTheme();

  if (!content) return null;

  const htmlViewStyles = useMemo(
    () =>
      StyleSheet.create({
        p: {
          marginVertical: 0,
          fontSize: 14,
          lineHeight: 20,
          color: colors.text,
        },
        a: {
          color: colors.link,
          textDecorationLine: "underline" as const,
        },
        pre: {
          backgroundColor: colors.secondary,
          padding: 8,
          borderRadius: 4,
          color: colors.text,
        },
        code: {
          fontFamily: "monospace",
          backgroundColor: colors.secondary,
          color: colors.text,
        },
        blockquote: {
          borderLeftWidth: 3,
          borderLeftColor: colors.border,
          paddingLeft: 8,
          color: colors.textSecondary,
        },
        ul: { marginVertical: 6, paddingLeft: 18, color: colors.text },
        ol: { marginVertical: 6, paddingLeft: 18, color: colors.text },
        li: { marginVertical: 2, color: colors.text },
        h1: {
          fontSize: 18,
          fontWeight: "600",
          marginVertical: 6,
          color: colors.text,
        },
        h2: {
          fontSize: 16,
          fontWeight: "600",
          marginVertical: 6,
          color: colors.text,
        },
        h3: {
          fontSize: 15,
          fontWeight: "600",
          marginVertical: 6,
          color: colors.text,
        },
        h4: {
          fontSize: 14,
          fontWeight: "600",
          marginVertical: 4,
          color: colors.text,
        },
        h5: {
          fontSize: 13,
          fontWeight: "600",
          marginVertical: 4,
          color: colors.text,
        },
        h6: {
          fontSize: 12,
          fontWeight: "600",
          marginVertical: 4,
          color: colors.text,
        },
        strong: { fontWeight: "600", color: colors.text },
        em: { fontStyle: "italic", color: colors.text },
        i: { fontStyle: "italic", color: colors.text },
        b: { fontWeight: "600", color: colors.text },
        div: { color: colors.text },
      }),
    [colors],
  );

  return (
    <HTMLView
      value={`<div>${content}</div>`}
      stylesheet={htmlViewStyles}
      addLineBreaks={false}
    />
  );
});

type CommentRowProps = {
  id: number;
  depth: number;
  maxDepth: number;
  collapsedIds: ReadonlySet<number>;
  onToggleCollapsed: (commentId: number) => void;
};

const CommentRow = memo(function CommentRow({
  id,
  depth,
  maxDepth,
  collapsedIds,
  onToggleCollapsed,
}: CommentRowProps) {
  const { colors } = useTheme();
  const indent = Math.min(depth, MAX_VISUAL_DEPTH) * INDENT_PER_DEPTH;

  const { data, isLoading, isError } = useQuery({
    queryKey: [id],
    queryFn: () => fetch("item", id),
    staleTime: 5 * 60 * 1000,
  });

  const hasReplies =
    !!data?.kids &&
    data.kids.length > 0 &&
    depth < maxDepth &&
    !data.deleted &&
    !data.dead;

  const collapsed = data ? collapsedIds.has(data.id) : false;

  const toggleHeader = useCallback(() => {
    if (!data || !hasReplies) return;
    onToggleCollapsed(data.id);
  }, [data, hasReplies, onToggleCollapsed]);

  if (isLoading && !data) {
    return <CommentSkeleton depth={depth} />;
  }

  if (isError || !data) {
    return (
      <View
        style={[
          styles.commentCard,
          {
            marginLeft: 12 + indent,
            marginVertical: 4,
            borderColor: colors.commentBorder,
            backgroundColor: colors.errorBackground,
          },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.errorText }]}>
          Could not load this comment.
        </Text>
      </View>
    );
  }

  if (data.deleted || data.dead) {
    return (
      <View
        style={[
          styles.commentCard,
          {
            marginLeft: 12 + indent,
            marginVertical: 4,
            borderColor: colors.commentBorder,
            backgroundColor: colors.secondary,
          },
        ]}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          [Comment removed]
        </Text>
      </View>
    );
  }

  const replyCount = data.kids?.length ?? 0;

  return (
    <View
      style={[
        styles.commentCard,
        {
          marginLeft: 12 + indent,
          marginVertical: 4,
          borderColor: colors.commentBorder,
          backgroundColor: depth === 0 ? colors.primary : colors.secondary,
        },
      ]}
    >
      <Pressable
        onPress={toggleHeader}
        disabled={!hasReplies}
        accessibilityRole={hasReplies ? "button" : undefined}
        accessibilityLabel={
          hasReplies
            ? collapsed
              ? `Expand ${replyCount} replies`
              : `Collapse ${replyCount} replies`
            : undefined
        }
        style={({ pressed }) => [
          styles.commentHeader,
          hasReplies && pressed ? { opacity: 0.75 } : null,
        ]}
      >
        {hasReplies ? (
          <MaterialCommunityIcons
            name={collapsed ? "chevron-right" : "chevron-down"}
            size={22}
            color={colors.textSecondary}
          />
        ) : (
          <View style={{ width: 22 }} />
        )}
        <View style={styles.commentMeta}>
          <Text
            style={[styles.username, { color: colors.commentUsername }]}
            numberOfLines={1}
          >
            {data.by ?? "unknown"}
          </Text>
          <Text style={[styles.timestamp, { color: colors.commentTimestamp }]}>
            {formatDistanceToNow(fromUnixTime(data.time), { addSuffix: true })}
          </Text>
        </View>
      </Pressable>

      <View>
        <HTMLViewer content={data.text} />
      </View>

      {hasReplies && (
        <View style={styles.repliesHint}>
          <MaterialCommunityIcons
            name="reply-outline"
            size={14}
            color={colors.commentReplies}
          />
          <Text style={{ color: colors.commentReplies }}>
            {collapsed
              ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"} hidden`
              : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
          </Text>
        </View>
      )}
    </View>
  );
});

const Header = memo(
  ({
    postData,
    bottomSheetRef,
  }: {
    postData: HN_ITEM_TYPE;
    bottomSheetRef: RefObject<BottomSheetMethods>;
  }) => {
    const { colors } = useTheme();
    return (
      <View style={{ paddingBottom: 8 }}>
        <Text style={[styles.title, { color: colors.text }]}>
          {postData.title}
        </Text>

        <HeaderActions postData={postData} bottomSheetRef={bottomSheetRef} />

        {postData.text ? (
          <View
            style={[
              styles.headerCard,
              { borderColor: colors.border, backgroundColor: colors.secondary },
            ]}
          >
            <HTMLViewer content={postData.text} />
          </View>
        ) : null}
      </View>
    );
  },
);

const CommentsList = memo(
  ({
    postData,
    bottomSheetRef,
  }: {
    postData: HN_ITEM_TYPE;
    bottomSheetRef: RefObject<BottomSheetMethods>;
  }) => {
    const queryClient = useQueryClient();
    const { colors } = useTheme();
    const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set());

    const toggleCollapsed = useCallback((commentId: number) => {
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(commentId)) next.delete(commentId);
        else next.add(commentId);
        return next;
      });
    }, []);

    const rootIds = postData.kids ?? [];

    const getComment = useCallback(
      (id: number) => queryClient.getQueryData<HN_ITEM_TYPE>([id]),
      [queryClient],
    );

    const visibleRows = buildVisibleCommentRows(
      rootIds,
      MAX_COMMENT_DEPTH,
      collapsedIds,
      getComment,
    );

    useQueries({
      queries: visibleRows.map(({ id }) => ({
        queryKey: [id],
        queryFn: () => fetch("item", id),
        staleTime: 5 * 60 * 1000,
      })),
    });

    const collapseSignature = [...collapsedIds]
      .sort((a, b) => a - b)
      .join(",");

    const listHeader = useMemo(
      () => <Header postData={postData} bottomSheetRef={bottomSheetRef} />,
      [postData, bottomSheetRef],
    );

    const renderItem = useCallback(
      ({ item }: { item: { id: number; depth: number } }) => (
        <CommentRow
          id={item.id}
          depth={item.depth}
          maxDepth={MAX_COMMENT_DEPTH}
          collapsedIds={collapsedIds}
          onToggleCollapsed={toggleCollapsed}
        />
      ),
      [collapsedIds, toggleCollapsed],
    );

    const keyExtractor = useCallback((item: { id: number; depth: number }) => {
      return `c-${item.id}-${item.depth}`;
    }, []);

    const emptyComponent = useMemo(
      () => (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={40}
            color={colors.textSecondary}
            style={{ marginBottom: 8 }}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
            No comments yet.
          </Text>
        </View>
      ),
      [colors.textSecondary],
    );

    if (!rootIds.length) {
      return (
        <View style={[styles.listWrap, { backgroundColor: colors.primary }]}>
          {listHeader}
          {emptyComponent}
        </View>
      );
    }

    return (
      <View style={[styles.listWrap, { backgroundColor: colors.primary }]}>
        <FlashList
          data={visibleRows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          estimatedItemSize={132}
          extraData={collapseSignature}
          contentContainerStyle={{
            paddingBottom: 16,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    );
  },
);

const HeaderActions = memo(
  ({
    postData,
    bottomSheetRef,
  }: {
    postData: HN_ITEM_TYPE;
    bottomSheetRef: React.RefObject<BottomSheet>;
  }) => {
    const { colors } = useTheme();
    const { addBookmark, removeBookmark, checkIsBookmark } = useBookmarks();
    const router = useRouter();
    const isBookmarked = checkIsBookmark?.(postData.id) ?? false;

    const handleShare = useCallback(async () => {
      const hnUrl = `https://news.ycombinator.com/item?id=${postData.id}`;
      const shareObject = {
        message: postData.url
          ? `${postData.title}\n\nArticle: ${postData.url}\n\nDiscussion: ${hnUrl}`
          : `${postData.title}\n\n${hnUrl}`,
        url: undefined,
        title: postData.title,
      };
      try {
        await Share.share(shareObject);
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
      <View
        style={[
          styles.headerCard,
          { borderColor: colors.border, backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.headerActionsRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingVertical: 8, paddingHorizontal: 4 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.backButton, fontWeight: "600" }}>
              Back
            </Text>
          </TouchableOpacity>
          {postData.url ? (
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.snapToIndex(4)}
              style={{ paddingVertical: 8, paddingHorizontal: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: colors.backButton, fontWeight: "600" }}>
                Open article
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.headerMetaRow}>
          <View style={styles.metaChips}>
            {[
              ["by", "user", postData.by ?? "—"],
              ["score", "like2", String(postData.score ?? "—")],
              [
                "time",
                "clockcircleo",
                formatDistanceToNow(fromUnixTime(postData.time), {
                  addSuffix: true,
                }),
              ],
            ].map(([key, icon, label]) => (
              <View style={styles.iconRow} key={key as string}>
                <AntDesign
                  name={icon as "like2" | "user" | "clockcircleo"}
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 13,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={[styles.iconRow, { gap: 12 }]}>
            <TouchableOpacity
              onPress={handleShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Share"
            >
              <AntDesign name="sharealt" size={20} color={colors.backButton} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBookmark}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={
                isBookmarked ? "Remove bookmark" : "Add bookmark"
              }
            >
              <MaterialCommunityIcons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={colors.backButton}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

export default memo(function CommentsScreen() {
  const postData = JSON.parse(
    useLocalSearchParams().postData as string,
  ) as HN_ITEM_TYPE;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!postData.kids || postData.kids.length <= 2) {
        bottomSheetRef.current?.snapToIndex(8);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [postData.kids]);

  if (!postData) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: colors.text }}>No post data found</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <CommentsList postData={postData} bottomSheetRef={bottomSheetRef} />
      <BottomSheetBroswer ref={bottomSheetRef} url={postData.url} />
    </View>
  );
});
