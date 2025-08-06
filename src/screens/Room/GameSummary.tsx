import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";
import useTranslation from "../../service/useTranslation";

export default function GameSummary({ route }: any) {
  const { roomId } = route.params;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const t = useTranslation();

  const {
    room: { matches, likes, users, gameEnded },
    isHost,
    nickname,
  } = useAppSelector((state) => state.room);

  // Find current user's completion status
  const currentUser = users.find((user: any) => user.nickname === nickname || user === nickname);
  const currentUserFinished = currentUser?.finished || false;


  useEffect(() => {
    // Clean up room state when component unmounts
    return () => {
      dispatch(roomActions.reset());
    };
  }, [dispatch]);

  const handleBackToHome = () => {
    dispatch(roomActions.reset());
    navigation.navigate("Landing");
  };

  return (
    <SafeIOSContainer>
      <PageHeading title="Game Summary" />
      
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.roomIdText}>Room: {roomId}</Text>
          
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText, 
              { color: gameEnded ? theme.colors.primary : '#ff4444' }
            ]}>
              {gameEnded ? 'Game Completed' : 'Game Ended by Admin'}
            </Text>
            
            <Text style={[
              styles.userStatusText,
              { color: currentUserFinished ? '#4CAF50' : '#ff4444' }
            ]}>
              You: {currentUserFinished ? 'Finished ✓' : 'Not Finished ✗'}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {users.length}
              </Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {matches.length}
              </Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {likes.length}
              </Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
          </View>

          <View style={styles.playersContainer}>
            <Text style={styles.playersTitle}>Player Status:</Text>
            {users.map((user: any, index: number) => {
              const userNick = user.nickname || user;
              const userFinished = user.finished || false;
              return (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerName}>{userNick}</Text>
                  <Text style={[
                    styles.playerStatus,
                    { color: userFinished ? '#4CAF50' : '#ff4444' }
                  ]}>
                    {userFinished ? '✓' : '✗'}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.placeholder}>
            Game Summary Details Coming Soon...
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleBackToHome}
            style={styles.backButton}
            contentStyle={styles.backButtonContent}
          >
            Back to Home
          </Button>
        </View>
      </View>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  roomIdText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Bebas',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  playersContainer: {
    width: '100%',
    marginBottom: 20,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  playerName: {
    fontSize: 16,
  },
  playerStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 20,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  backButton: {
    borderRadius: 100,
  },
  backButtonContent: {
    paddingVertical: 7.5,
  },
});