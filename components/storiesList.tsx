import { HN_ITEM_TYPE } from "@/utility/definitions";
import { useEffect, useState, useCallback, useRef } from "react";
import StoryTile from "./storyTile";
import { fetchItemsByIdsQuery } from "@/utility/HN_Firebase";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeOut, interpolate, LinearTransition, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTheme } from "@/theme/context";
import { View } from "react-native";
import { FlashList, FlashListProps, ListRenderItemInfo } from "@shopify/flash-list";
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useBookmarks } from "@/utility/bookmarkContext";

const STORY_FETCH_LIMIT = 15;

const AnimatedFlashList = Animated.createAnimatedComponent<FlashListProps<HN_ITEM_TYPE>>(FlashList);

const openInBrowser = async (url: string | undefined) => {
    if (url) await WebBrowser.openBrowserAsync(url);
  };

export default function StoriesList({ postIds, currentSelected }: { postIds: string[], currentSelected: string }) {
    const [lastLoadedIndex, setLastLoadedIndex] = useState(STORY_FETCH_LIMIT);
    const [storiesData, setStoriesData] = useState<HN_ITEM_TYPE[]>([]);
    const { colors } = useTheme();
    const {addBookmark} = useBookmarks();
    const swipeableRefs = useRef<{ [key: string]: SwipeableMethods }>({});

    const renderLeftActions = (progress: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
                progress.value,
                [0, 0.5, 1],
                [0, 0.5, 1]
            );
            return { 
                opacity,
            };
        });
        return (
            <Animated.View style={[{ 
                backgroundColor: colors.primary, 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: 100,
                borderLeftWidth: 1,
                borderColor: colors.border
            }, animatedStyle]}>
                <Feather name="globe" size={24} color={colors.text} />
            </Animated.View>
        );
    }
    
    const renderRightActions = (progress: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
                progress.value,
                [0, 0.5, 1],
                [0, 0.5, 1]
            );
            return { 
                opacity,
            };
        });
        return (
            <Animated.View style={[{ 
                backgroundColor: colors.primary, 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: 100,
                borderRightWidth: 1,
                borderColor: colors.border,
            }, animatedStyle]}>
                <Feather name="bookmark" size={24} color={colors.text} />
            </Animated.View>
        );
    }
    
    const swipeFn = async (direction: string, story: HN_ITEM_TYPE) => {
        if (direction === 'left') {
            await openInBrowser(story?.url);
        } else {
            addBookmark(story);
        } 
        
        // Close the specific swipeable
        const ref = swipeableRefs.current[`swipeable-${story.id}`];
        if (ref) {
            ref.close();
        }
    }

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

    const renderItem = ({ item }: ListRenderItemInfo<HN_ITEM_TYPE>) => (
        <Swipeable 
            ref={(ref) => {
                if (ref) {
                    swipeableRefs.current[`swipeable-${item.id}`] = ref;
                }
            }}
            friction={2}
            leftThreshold={80}
            rightThreshold={80}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableWillOpen={(direction: string) => swipeFn(direction, item)}
            overshootLeft={false}
            overshootRight={false}
            enableTrackpadTwoFingerGesture
        >
            <StoryTile story={item} />
        </Swipeable>
    )

    // Update cleanup effect
    useEffect(() => {
        return () => {
            Object.values(swipeableRefs.current).forEach(ref => {
                ref?.close();
            });
            swipeableRefs.current = {};
        };
    }, []);

    return (
        <View style={{ height: '100%', backgroundColor: colors.primary }}>
            <AnimatedFlashList
                data={storiesData}
                renderItem={renderItem}
                keyExtractor={(item) => `story-${item.id}`} 
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.7}
                contentContainerStyle={{backgroundColor: colors.primary}}
                estimatedItemSize={100}
                // exiting={FadeOut}
                layout={LinearTransition.springify()}
            />
        </View>
    );
}

