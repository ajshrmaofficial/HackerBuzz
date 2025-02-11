import { HN_API_ITEM_TYPE } from "@/utility/definitions";
import StoryTile from "./storyTile";
import { fetch } from "@/utility/HN_Firebase";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/theme/context";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Loader from "./loader";

export default function StoriesList({ currentSelectedStoryType }: { currentSelectedStoryType: HN_API_ITEM_TYPE }) {
    const { colors } = useTheme();

    const {data, isLoading} = useQuery({
       queryKey: [currentSelectedStoryType],
       queryFn: () => fetch(currentSelectedStoryType),
       staleTime: 5 * 60 * 1000,
    });

    return (
        <View style={{ height: '100%', backgroundColor: colors.primary }}>
            {isLoading && <Loader />}
            {(!isLoading && data) && <FlashList<number>
                data={data}
                renderItem={({item})=> <StoryTile id={item} />}
                keyExtractor={(item) => `story-${item}`} 
                contentContainerStyle={{backgroundColor: colors.primary}}
                estimatedItemSize={100}
            />}
        </View>
    );
}

