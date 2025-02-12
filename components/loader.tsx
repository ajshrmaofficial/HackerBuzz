import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/context";

const Loader = () => {
    const { colors } = useTheme();
    const styles = StyleSheet.create({
        container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary
        }
    });
    return <View style={styles.container}>
        <ActivityIndicator size='large' color={colors.text} />
    </View>
}

export default Loader;
