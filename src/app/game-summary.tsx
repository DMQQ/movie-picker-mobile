import React from 'react';
import { View } from 'react-native';
import GameSummary from '../screens/Room/GameSummary';

export default function GameSummaryPage() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <GameSummary />
    </View>
  );
}