import React from 'react';
import { useTheme } from "@/theme/context";
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import app from '../app.json';

const sections = ['Theme', 'About'];

export default function Settings() {
    const { theme, toggleTheme, colors } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },
        header: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        section: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        sectionText: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 15,
        },
        themeOption: {
            padding: 15,
            backgroundColor: colors.buttonBg,
            marginVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        themeOptionText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        activeThemeOption: {
            borderWidth: 2,
            borderColor: colors.link,
            backgroundColor: colors.primary,
        },
        aboutContainer: {
            marginTop: 10,
        },
        aboutItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
        },
        aboutText: {
            color: colors.text,
            fontSize: 16,
            marginLeft: 12,
        },
        aboutLabel: {
            color: colors.textSecondary,
            fontSize: 14,
            marginLeft: 12,
        }
    });

    return (
        <SafeAreaView style={styles.container}>
            {sections.map((section, index) => (
                <View key={index} style={styles.section}>
                    <Text style={styles.sectionText}>{section}</Text>
                    {section === 'Theme' && (
                        <View>
                            {['light', 'dark', 'system'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.themeOption, theme === option ? styles.activeThemeOption : {}]}
                                    onPress={() => toggleTheme(option as 'light' | 'dark' | 'system')}
                                >
                                    <Text style={styles.themeOptionText}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                    {theme === option && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.link} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {section === 'About' && (
                        <View style={styles.aboutContainer}>
                            <View style={styles.aboutItem}>
                                <Ionicons name="apps" size={24} color={colors.text} />
                                <View>
                                    <Text style={styles.aboutText}>{app.expo.name}</Text>
                                    <Text style={styles.aboutLabel}>App Name</Text>
                                </View>
                            </View>
                            <View style={styles.aboutItem}>
                                <Ionicons name="person" size={24} color={colors.text} />
                                <View>
                                    <Text style={styles.aboutText}>{app.expo.owner}</Text>
                                    <Text style={styles.aboutLabel}>Developer</Text>
                                </View>
                            </View>
                            <View style={styles.aboutItem}>
                                <Ionicons name="information-circle" size={24} color={colors.text} />
                                <View>
                                    <Text style={styles.aboutText}>{app.expo.version}</Text>
                                    <Text style={styles.aboutLabel}>Version</Text>
                                </View>
                            </View>
                            <View style={styles.aboutItem}>
                                <Ionicons name="mail" size={24} color={colors.text} />
                                <View>
                                    <Text style={styles.aboutText}>{app.expo.contact}</Text>
                                    <Text style={styles.aboutLabel}>Contact</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            ))}
        </SafeAreaView>
    );
}
