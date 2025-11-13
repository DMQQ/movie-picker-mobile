import { View } from 'react-native';
import FortuneWheel from '../screens/FortuneWheel';

export default function FortuneScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FortuneWheel navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}