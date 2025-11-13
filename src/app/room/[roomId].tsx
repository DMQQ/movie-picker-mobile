import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import QRCodeMain from '../../screens/Room/Main';

export default function RoomSession() {
  const { roomId } = useLocalSearchParams();
  
  const route = {
    params: {
      roomId: roomId as string,
    },
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <QRCodeMain navigation={{} as any} route={route} />
    </View>
  );
}