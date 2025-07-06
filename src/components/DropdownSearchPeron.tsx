import React, { useState, useEffect, useRef, useTransition } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Animated, ListRenderItem, Image } from "react-native";
import { Text, TextInput, TouchableRipple, Surface, ActivityIndicator, MD2DarkTheme, Chip, Avatar } from "react-native-paper";
import { useLazySearchPeopleQuery } from "../redux/person/personApi";
import useTranslation from "../service/useTranslation";

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for?: Array<{
    id: number;
    title?: string;
    name?: string;
  }>;
}

interface DropdownPersonSearchProps {
  onSelectPerson?: (people: Person[]) => void;
  maxSelections?: number;
  label?: string;
  placeholder?: string;
}

const DropdownPersonSearch: React.FC<DropdownPersonSearchProps> = ({
  onSelectPerson,
  maxSelections = 3,
  label = "Search actors, directors...",
  placeholder = "Type to search...",
}) => {
  const [query, setQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [search, { data, isLoading }] = useLazySearchPeopleQuery();
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  const t = useTranslation();

  // Handle search with debounce
  useEffect(() => {
    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        search({ query, page: 1, language: "en-US" });
        showDropdown();
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      hideDropdown();
    }
  }, [query, search]);

  const showDropdown = (): void => {
    setDropdownVisible(true);
    Animated.timing(dropdownOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideDropdown = (): void => {
    Animated.timing(dropdownOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDropdownVisible(false);
    });
  };

  const handleSelectPerson = (person: Person): void => {
    if (!selectedPeople.some((p) => p.id === person.id) && selectedPeople.length < maxSelections) {
      const newSelection = [...selectedPeople, person];
      setSelectedPeople(newSelection);
      onSelectPerson?.(newSelection);
    }
    setQuery("");
    hideDropdown();
  };

  const handleRemovePerson = (personId: number): void => {
    const newSelection = selectedPeople.filter((p) => p.id !== personId);
    setSelectedPeople(newSelection);
    onSelectPerson?.(newSelection);
  };

  const handleClearSearch = (): void => {
    setQuery("");
    hideDropdown();
  };

  const renderPersonItem: ListRenderItem<Person> = ({ item }) => (
    <TouchableRipple onPress={() => handleSelectPerson(item)} style={styles.personItem}>
      <View style={styles.personContent}>
        {item.profile_path ? (
          <Image source={{ uri: `https://image.tmdb.org/t/p/w92${item.profile_path}` }} style={styles.personImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.personInfo}>
          <Text numberOfLines={1} style={styles.personName}>
            {item.name}
          </Text>
          <Text style={styles.department}>{item.known_for_department}</Text>
        </View>
      </View>
    </TouchableRipple>
  );

  const renderSelectedPerson: ListRenderItem<Person> = ({ item }) => (
    <Surface style={styles.selectedPerson}>
      <View style={styles.selectedPersonInner}>
        {item.profile_path ? (
          <Image source={{ uri: `https://image.tmdb.org/t/p/w92${item.profile_path}` }} style={styles.selectedPersonImage} />
        ) : (
          <Avatar.Text
            size={36}
            label={item.name.charAt(0).toUpperCase()}
            style={styles.selectedPersonAvatar}
            labelStyle={styles.selectedPersonAvatarLabel}
          />
        )}
        <Text numberOfLines={1} style={styles.selectedPersonName}>
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => handleRemovePerson(item.id)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("cast.heading")}</Text>

      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          mode="outlined"
          label={label}
          placeholder={placeholder}
          right={<TextInput.Icon icon={query ? "close" : "magnify"} onPress={query ? handleClearSearch : undefined} />}
        />

        {dropdownVisible && (
          <Animated.View style={[styles.dropdown, { opacity: dropdownOpacity }]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating size="small" />
                <Text style={styles.dropdownMessage}>Searching...</Text>
              </View>
            ) : !data?.results?.length ? (
              <Text style={styles.dropdownMessage}>No results found</Text>
            ) : (
              <FlatList
                data={data.results.slice(0, 10)} // Limit to 10 results
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPersonItem}
                style={styles.resultsList}
                contentContainerStyle={styles.resultsContent}
                scrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={() => (
                  <View style={styles.resultsHeaderContainer}>
                    <Text style={styles.resultsHeader}>
                      {t("search.query-for")} "{query}"
                    </Text>
                    <TouchableOpacity onPress={hideDropdown}>
                      <Text style={styles.closeText}>{t("search.close")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </Animated.View>
        )}
      </View>

      {selectedPeople.length > 0 && (
        <View style={styles.selectedContainer}>
          <FlatList
            data={selectedPeople}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderSelectedPerson}
            contentContainerStyle={styles.selectedContent}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 30,
    lineHeight: 30,
    fontFamily: "Bebas",
    marginBottom: 15,
  },
  searchContainer: {
    position: "relative",
    zIndex: 10,
  },
  input: {
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 8,
    marginTop: 4,
    elevation: 5,
    maxHeight: 350,
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  dropdownMessage: {
    padding: 16,
    color: "#aaa",
    textAlign: "center",
  },
  resultsList: {
    maxHeight: 350,
  },
  resultsContent: {
    paddingVertical: 8,
  },
  resultsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  resultsHeader: {
    fontSize: 14,
    color: "#888",
  },
  closeText: {
    fontSize: 14,
    color: "#007AFF",
  },
  personItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  personContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  personImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  personInfo: {
    marginLeft: 12,
    flex: 1,
  },
  personName: {
    fontSize: 16,
    color: "#fff",
  },
  department: {
    fontSize: 12,
    color: "#aaa",
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedContent: {
    paddingVertical: 5,
  },
  selectedPerson: {
    marginRight: 12,
    marginVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  selectedPersonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  selectedPersonImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  selectedPersonAvatar: {
    marginRight: 8,
    backgroundColor: "#007AFF",
  },
  selectedPersonAvatarLabel: {
    fontSize: 16,
  },
  selectedPersonName: {
    fontSize: 14,
    color: "#fff",
    marginRight: 6,
    maxWidth: 120,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },
});

export default DropdownPersonSearch;
