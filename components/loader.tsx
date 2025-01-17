import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/context";

export default function Loader() {
    const { colors } = useTheme();
    return <View style={styles.container}>
        <ActivityIndicator size='large' color={colors.text} />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

