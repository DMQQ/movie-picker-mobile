import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { MD2DarkTheme, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CustomSearchBar = ({ value, onChangeText, placeholder = "Search movies and TV shows..." }: SearchBarProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <IconButton icon="arrow-left" size={24} iconColor="#fff" onPress={() => navigation.goBack()} style={styles.backButton} />

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          selectionColor={MD2DarkTheme.colors.primary}
        />

        {value.length > 0 && (
          <IconButton icon="close" size={20} iconColor="#666" onPress={() => onChangeText("")} style={styles.clearButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 100,
    height: 56,
    paddingHorizontal: 10,
  },
  backButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 8,
    height: "100%",
  },
  clearButton: {
    margin: 0,
  },
});

export default CustomSearchBar;
