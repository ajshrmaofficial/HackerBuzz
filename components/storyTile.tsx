import { HN_ITEM_TYPE } from "@/utility/definitions";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import React, { useRef } from "react";
import { Router, useRouter } from "expo-router";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from "@/theme/context";
import Feather from '@expo/vector-icons/Feather';
import { useBookmarks } from "@/app/bookmarks";
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    margin: 5,
    borderRadius: 5,
  },
  flexRow: {  
    flexDirection: "row",
  },
  title: {
    fontSize: 15,
    fontWeight: "semibold",
  },
  subTitleDark: {
    fontSize: 10,
  },
  subTitleLight: {
    fontSize: 10,
  },
  url: {
    fontSize: 10,
  },
  misc: {
    fontSize: 10,
  },
});

const openInBrowser = async (url: string | undefined) => {
  if (url) await WebBrowser.openBrowserAsync(url);
};

const openStory = async (story: HN_ITEM_TYPE, router: Router) => {
  router.push({pathname: '/comments', params: {postData: JSON.stringify(story)}});
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function StoryTile({ story }: { story: HN_ITEM_TYPE }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { addBookmark } = useBookmarks();
  const swipeableRef = useRef<SwipeableMethods>(null);

  const renderLeftActions = () => {
    return (
      <View style={{ backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', width: 90 }}>
        <Feather name="globe" size={24} color={colors.text} />
      </View>
    );
  }

  const renderRightActions = () => {
    return (
      <View style={{ backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', width: 90 }}>
        <Feather name="bookmark" size={24} color={colors.text} />
      </View>
    );
  }

  const swipeFn = (direction: string) => {
    if (direction === 'left') {
      openInBrowser(story?.url);
    } else {
      addBookmark(story);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);  
    swipeableRef.current?.close();
  }

  return (
    <Swipeable ref={swipeableRef} friction={2} leftThreshold={100} rightThreshold={100} renderLeftActions={renderLeftActions} renderRightActions={renderRightActions} onSwipeableOpen={swipeFn}>
      <AnimatedTouchable
        entering={FadeInUp}
        layout={LinearTransition.springify()}
        onPress={() => openStory(story, router)}
        activeOpacity={0.8}
        style={[styles.container, { borderColor: colors.border, backgroundColor: colors.primary }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{story.title}</Text>
        <View>
          <View style={styles.flexRow}>
            <Text style={[styles.subTitleLight, { color: colors.textSecondary }]}>{`>`}</Text>
            <Text style={[styles.subTitleDark, { color: colors.text }]}>{` ${story.by}`}</Text>
            {story.url && (
              <Text style={[styles.url, { color: colors.link, marginLeft: 5 }]}>
                {story.url.length > 50
                  ? story.url.substring(0, 50) + "..."
                  : story.url}
              </Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", columnGap: 10 }}>
          <Text style={[styles.misc, { color: colors.text }]}>▲ {story.score}</Text>
          {story?.kids && story.kids.length > 0 && (
            <Text style={[styles.misc, { color: colors.text }]}>💬 {story.kids.length}</Text>
          )}
        </View>
      </AnimatedTouchable>
    </Swipeable>
  );
}
