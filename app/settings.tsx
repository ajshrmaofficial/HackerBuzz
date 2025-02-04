import React from "react";
import { useTheme } from "@/theme/context";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import app from "../app.json";
import Animated, {
  FadeInRight,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sections = ["Theme", "About"];

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function Settings() {
  const { theme, toggleTheme, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingBottom: insets.bottom,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 15,
    },
    themeOption: {
      padding: 15,
      backgroundColor: colors.buttonBg,
      marginVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    themeOptionText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
    activeThemeOption: {
      borderWidth: 2,
      borderColor: colors.link,
      backgroundColor: colors.primary,
    },
    aboutContainer: {
      marginTop: 15,
      marginHorizontal: -5, // compensate for item padding
      // marginBottom: 40
    },
    aboutItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.buttonBg,
      padding: 8,
      marginHorizontal: 5,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 12,
      marginRight: 12,
    },
    aboutText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
    aboutLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    footer: {
      padding: 20,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.primary,
      height: 100,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <AnimatedSafeAreaView
      style={styles.container}
      entering={FadeInRight.duration(200).springify()}
    >
      <ScrollView>
        {sections.map((section, index) => (
          <AnimatedView
            key={index}
            style={styles.section}
            entering={FadeInRight.delay(index * 50)
              .duration(200)
              .springify()}
            layout={LinearTransition.springify()}
          >
            <Text style={styles.sectionText}>{section}</Text>
            {section === "Theme" && (
              <View>
                {["light", "dark", "system"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.themeOption,
                      theme === option ? styles.activeThemeOption : {},
                    ]}
                    onPress={() =>
                      toggleTheme(option as "light" | "dark" | "system")
                    }
                  >
                    <Text style={styles.themeOptionText}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                    {theme === option && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.link}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {section === "About" && (
              <View style={styles.aboutContainer}>
                {[
                  { icon: "apps", label: "App Name", value: app.expo.name },
                  { icon: "person", label: "Developer", value: app.expo.owner },
                  {
                    icon: "information-circle",
                    label: "Version",
                    value: app.expo.version,
                  },
                  { icon: "mail", label: "Contact", value: app.expo.contact },
                ].map((item, index) => (
                  <Animated.View
                    key={item.label}
                    entering={FadeInRight.delay(index * 100)
                      .duration(300)
                      .springify()}
                    style={styles.aboutItem}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={item.icon as any}
                        size={28}
                        color={colors.text}
                      />
                    </View>
                    <View>
                      <Text style={styles.aboutText}>{item.value}</Text>
                      <Text style={styles.aboutLabel}>{item.label}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </AnimatedView>
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </AnimatedSafeAreaView>
  );
}
