import { View } from 'react-native';
import QRScanner from '../../screens/Room/QRScanner';

export default function QRScannerTab() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <QRScanner />
    </View>
  );
}