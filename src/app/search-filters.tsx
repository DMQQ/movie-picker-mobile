import { View } from 'react-native';
import SearchFilters from '../screens/SearchFilters';

export default function SearchFiltersScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SearchFilters navigation={{} as any} route={{ params: {} } as any} />
    </View>
  );
}