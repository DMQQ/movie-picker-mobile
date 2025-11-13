import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import MovieDetails from '../../screens/MovieDetails';

export default function MovieDetailsScreen() {
  const { params } = useLocalSearchParams();
  const [type, id] = Array.isArray(params) ? params : [params];
  
  // Create navigation object using expo-router
  const navigation = {
    navigate: (routeName: string, params?: any) => router.push({ pathname: routeName, params }),
    goBack: () => router.back(),
    push: (routeName: string, params?: any) => router.push({ pathname: routeName, params }),
    replace: (routeName: string, params?: any) => router.replace({ pathname: routeName, params }),
    pop: () => router.back(),
    popToTop: () => router.dismissAll(),
    addListener: () => () => {},
    removeListener: () => {},
    isFocused: () => true,
    canGoBack: () => router.canGoBack(),
    getId: () => undefined,
    getParent: () => undefined,
    getState: () => ({}),
    setOptions: () => {},
    setParams: () => {},
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MovieDetails
        route={{
          params: {
            type: type || 'movie',
            id: parseInt(id || '0', 10),
            img: '',
          },
        } as any}
        navigation={navigation as any}
      />
    </View>
  );
}