import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  title: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 5,
  },
  subTitle: {
    height: 8,
    width: '50%',
    borderRadius: 4,
    marginTop: 3,
  },
  misc: {
    height: 8,
    width: '30%',
    borderRadius: 4,
    marginTop: 3,
  },
  animatedBackground: {
    backgroundColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const StoryTileSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.primary }]}>
      <View style={[styles.title, { backgroundColor: colors.border }]} />
      <View style={[styles.subTitle, { backgroundColor: colors.border }]} />
      <View style={[styles.misc, { backgroundColor: colors.border }]} />
    </View>
  );
};

export default StoryTileSkeleton;
