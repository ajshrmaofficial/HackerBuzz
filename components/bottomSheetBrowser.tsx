import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useState, forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import { WebViewProgressEvent } from "react-native-webview/lib/WebViewTypes";
import { useTheme } from "@/theme/context";

const SNAP_POINTS = ['3%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%'];

const BottomSheetBroswer = forwardRef(({url}: {url?: string}, ref: React.Ref<BottomSheet>) => {
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [loadingState, setLoadingState] = useState<"not-started" | "loading" | "loaded">("not-started");
    const { colors } = useTheme();

    const handleSheetChanges = useCallback(async(index: number) => {
        if(index>0 && url && loadProgress !== 1)
            setLoadingState("loading");
      }, []);

    const handleLoadProgress = useCallback((progressEvent: WebViewProgressEvent) => {
        if(loadingState === "loaded") return;
        setLoadProgress(progressEvent.nativeEvent.progress);
        if(progressEvent.nativeEvent.progress === 1){
            setLoadingState("loaded");
        }
    }, [])

    if(!url){
        return null;
    }

    return(
        <BottomSheet
            backgroundStyle={[styles.bottomSheet, {backgroundColor: colors.text}]}
            style={styles.bottomSheet}
            handleIndicatorStyle={{backgroundColor: colors.primary}}
            ref={ref}
            onChange={handleSheetChanges}
            index={0}
            enableDynamicSizing={true}
            snapPoints={SNAP_POINTS}>
                
            <BottomSheetView style={styles.contentContainer}>
                <ProgressLoader progress={loadProgress} />
                {loadingState!=="not-started" && <WebView style={styles.webview} source={{uri: url}} nestedScrollEnabled scrollEnabled={true} onLoadProgress={handleLoadProgress} />}
            </BottomSheetView>
        </BottomSheet>
    )
});

const ProgressLoader = ({progress}: {progress: number}) => {
    return(
        <View style={[styles.progressLoader, {width: `${Math.floor(progress*100)}%`}]}/>
    )
}

const styles = StyleSheet.create({
    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    contentContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    webview: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    progressLoader: {
        backgroundColor: 'blue',
        borderRadius: 3,
        height: 3,
        transitionProperty: 'width',
        transitionDuration: '0.5s',
        transitionTimingFunction: 'ease-in-out',
    },
  });

export default BottomSheetBroswer;
