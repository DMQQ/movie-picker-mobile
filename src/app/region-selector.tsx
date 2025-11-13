import { View } from 'react-native';
import RegionSelectorScreen from '../screens/RegionSelector';

export default function RegionSelector() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <RegionSelectorScreen navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}