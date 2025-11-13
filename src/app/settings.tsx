import { View } from 'react-native';
import SettingsScreen from '../screens/Settings';

export default function Settings() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SettingsScreen navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}