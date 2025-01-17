import { StyleSheet, View, ViewProps } from "react-native";

type THEMED_VIEW_PROPS = ViewProps & {

}

export default function ThemedView(props: THEMED_VIEW_PROPS) {
    return <View {...props} style={styles.container} />
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
})
