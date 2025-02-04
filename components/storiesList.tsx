import { HN_ITEM_TYPE } from "@/utility/definitions";
import { useEffect, useState, useCallback } from "react";
import StoryTile from "./storyTile";
import { fetchItemsByIdsQuery } from "@/utility/HN_Firebase";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@/theme/context";

const STORY_FETCH_LIMIT = 15;

export default function StoriesList({ postIds, currentSelected }: { postIds: string[], currentSelected: string }) {
    const [lastLoadedIndex, setLastLoadedIndex] = useState(STORY_FETCH_LIMIT);
    const [storiesData, setStoriesData] = useState<HN_ITEM_TYPE[]>([]);
    const { colors } = useTheme();

    const { data: newStories, isLoading } = useQuery({
        queryKey: ['stories', postIds.map(Number), lastLoadedIndex, STORY_FETCH_LIMIT],
        queryFn: ()=> fetchItemsByIdsQuery(postIds.map(Number), lastLoadedIndex, STORY_FETCH_LIMIT),
    });

    useEffect(() => {
        setLastLoadedIndex(STORY_FETCH_LIMIT);
        setStoriesData([]);
    }, [currentSelected]);

    useEffect(() => {
        if (newStories && newStories.length !== 0) {
            setStoriesData(prevStories => [...prevStories, ...newStories]);
        }
    }, [newStories]);

    const handleEndReached = useCallback(() => {
        if (!isLoading) {
            setLastLoadedIndex(prev => prev + STORY_FETCH_LIMIT);
        }
    }, [isLoading]);

    const renderItem = useCallback(({ item }: { item: HN_ITEM_TYPE }) => <StoryTile story={item} />, []);

    return (
        <Animated.View style={{ height: '100%', backgroundColor: colors.primary }} layout={LinearTransition.springify()}>
            <Animated.FlatList
                data={storiesData}
                renderItem={renderItem}
                keyExtractor={(item) => `story-${item.id}`} 
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.7}
                style={{backgroundColor: colors.primary}}
                exiting={FadeOut}
                layout={LinearTransition.springify()}
                itemLayoutAnimation={LinearTransition.springify()}
            />
        </Animated.View>
    );
}

