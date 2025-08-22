// src/screens/Room/RoomSetup/components/Section.tsx
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type SectionProps = {
  title: string;
  description?: string;
  disabled?: boolean;
};

const Section = ({ title, description, disabled = false, children }: PropsWithChildren<SectionProps>) => (
  <View style={[styles.sectionContainer, disabled && styles.disabled]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description && <Text style={styles.sectionDescription}>{description}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: "Bebas",
    marginBottom: 10,
    color: "#fff",
  },
  sectionDescription: {
    color: "gray",
    marginBottom: 15,
    fontSize: 12,
  },
});

export default Section;
