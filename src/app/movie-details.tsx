import React from 'react';
import { View } from 'react-native';
import MovieDetailsScreen from '../screens/MovieDetails';

export default function MovieDetailsPage() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MovieDetailsScreen />
    </View>
  );
}