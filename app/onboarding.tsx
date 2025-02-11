import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/context';

const { width } = Dimensions.get('window');

type slide_type = {
  id: number,
  title: string,
  description: string,
  image: any
}

const slides: slide_type[] = [
  {
    id: 1,
    title: 'Browse Stories',
    description: 'Swipe left to open in browser, right to bookmark',
    image: require('../assets/images/hacker-news.jpg')
  },
  {
    id: 2,
    title: 'Dark Mode',
    description: 'Switch between light and dark themes',
    image: require('../assets/images/hacker-news.jpg')
  },
  {
    id: 3,
    title: 'Get Started',
    description: 'Start exploring HackerBuzz',
    image: require('../assets/images/hacker-news.jpg')
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const router = useRouter();

  const onComplete = async () => {
    await AsyncStorage.setItem('userOnboarded', 'true');
    router.replace('/');
  };

  const renderSlide = ({ item, index }: { item: slide_type, index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    return (
      <View style={[styles.slide, { backgroundColor: colors.primary }]}>
        <Animated.Image
          source={item.image}
          style={[styles.image, { opacity }]}
        />
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.link : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {currentIndex === slides.length - 1 && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.link }]}
          onPress={onComplete}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Get Started
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});