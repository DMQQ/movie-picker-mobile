import { View } from 'react-native';
import Overview from '../screens/Overview';

export default function OverviewScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Overview navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}