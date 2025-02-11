import StoriesList from "@/components/storiesList";
import { useMemo, useState } from "react";
import { HN_API_ITEM_TYPE } from "@/utility/definitions";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme/context";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const storyTypeArr = ["beststories", "newstories", "topstories",  "askstories", "showstories", "jobstories"];

function StoryTypeSelector({ types, onSelect, currentSelected }: { types: string[], onSelect: (type: HN_API_ITEM_TYPE) => void, currentSelected?: HN_API_ITEM_TYPE }) {
  const { colors } = useTheme();

  const styles = useMemo(()=>StyleSheet.create({
    selectorContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.primary,
      zIndex: 1,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.buttonBg,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      color: colors.text,
      fontSize: 12,
    },
    activeTag: {
      borderWidth: 1,
      borderColor: colors.text,
    }
  }), [colors])

  return (
    <View style={styles.selectorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {types.map((type) => (
        <TouchableOpacity key={type} onPress={() => onSelect(type as HN_API_ITEM_TYPE)} style={[styles.tag, currentSelected === type ? styles.activeTag : {}]}>
          <Text style={styles.tagText}>{type}</Text>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );
}

export default function Home() {
  const [selectedStoryType, setSelectedStoryType] = useState<HN_API_ITEM_TYPE>("beststories");
  const insets = useSafeAreaInsets();

  return (
    <View style={{paddingBottom: insets.bottom, flex: 1, }}>
      <StoryTypeSelector types={storyTypeArr} currentSelected={selectedStoryType} onSelect={setSelectedStoryType} />
      <StoriesList currentSelectedStoryType={selectedStoryType} />
    </View>
  );
}

