import { View } from 'react-native';
import RoomSetup from '../../screens/Room/RoomSetup';

export default function RoomSetupScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <RoomSetup navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}