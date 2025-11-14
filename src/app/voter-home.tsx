import React from 'react';
import { View } from 'react-native';
import Home from '../screens/Voter/Home';

export default function VoterHomePage() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Home />
    </View>
  );
}