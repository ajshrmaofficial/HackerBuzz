import { HN_ITEM_TYPE } from "@/utility/definitions";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Router, useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme } from "@/theme/context";
import { fetch } from "@/utility/HN_Firebase";
import { useQuery } from "@tanstack/react-query";
import StoryTileSkeleton from "./StoryTileSkeleton";

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

export default function StoryTile({ id }: { id: number }) {
  const { colors } = useTheme();
  const router = useRouter();

  const { data, isLoading } = useQuery({
       queryKey: [id],
       queryFn: ()=> fetch("item", id.toString()),
       staleTime: 5 * 60 * 1000,
       enabled: !!id,
   });

  if(isLoading) {
    return <StoryTileSkeleton />
  }

  return (
      <AnimatedTouchable
        onPress={() => openStory(data, router)}
        entering={FadeInUp.springify()}
        activeOpacity={0.8}
      >
        <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
        <View>
          <View style={styles.flexRow}>
            <Text style={[styles.subTitleLight, { color: colors.textSecondary }]}>{`>`}</Text>
            <Text style={[styles.subTitleDark, { color: colors.text }]}>{` ${data.by}`}</Text>
            {data.url && (
              <Text style={[styles.url, { color: colors.link, marginLeft: 5 }]}>
                {data.url.length > 50
                  ? data.url.substring(0, 50) + "..."
                  : data.url}
              </Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: "row", columnGap: 10 }}>
          <Text style={[styles.misc, { color: colors.text }]}>▲ {data.score}</Text>
          {data?.kids && data.kids.length > 0 && (
            <Text style={[styles.misc, { color: colors.text }]}>💬 {data.kids.length}</Text>
          )}
        </View>
        </View>
      </AnimatedTouchable>
  );
}

