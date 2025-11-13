import { View } from 'react-native';
import GameList from '../../screens/GameList';

export default function GamesTab() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <GameList />
    </View>
  );
}