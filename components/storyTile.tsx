import { HN_ITEM_TYPE } from "@/utility/definitions";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Router, useRouter } from "expo-router";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@/theme/context";

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

const openStory = async (story: HN_ITEM_TYPE, router: Router) => {
  router.push({pathname: '/comments', params: {postData: JSON.stringify(story)}});
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function StoryTile({ story }: { story: HN_ITEM_TYPE }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
      <AnimatedTouchable
        entering={FadeInUp.springify()}
        layout={LinearTransition.springify()}
        onPress={() => openStory(story, router)}
        activeOpacity={0.8}
      >
        <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.primary }]}>
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
        </View>
      </AnimatedTouchable>
  );
}

