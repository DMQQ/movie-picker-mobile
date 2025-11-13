import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import VoterMain from '../../screens/Voter/Main';

export default function VoterSession() {
  const { sessionId } = useLocalSearchParams();
  
  const route = {
    params: {
      sessionId: sessionId as string,
    },
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <VoterMain navigation={{} as any} route={route} />
    </View>
  );
}