import { View } from 'react-native';
import QRScanner from '../../screens/Room/QRScanner';

export default function QRScannerScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <QRScanner />
    </View>
  );
}