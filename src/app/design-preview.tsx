import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../components/Text";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import TouchableRipple from "../components/TouchableRipple";
import Divider from "../components/Divider";
import Surface from "../components/Surface";
import AvatarText from "../components/AvatarText";
import Badge from "../components/Badge";
import Checkbox from "../components/Checkbox";
import Card from "../components/Card";
import Chip from "../components/Chip";
import SegmentedButtons from "../components/SegmentedButtons";
import SearchField from "../components/SearchField";
import TextInput from "../components/TextInput";
import Dialog from "../components/Dialog";
import AppbarAction from "../components/AppbarAction";
import Button from "../components/Button";
import PrimaryButton from "../components/PrimaryButton";
import { colors, fontSize, fontWeight, spacing, typography } from "../constants/design";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export default function DesignPreview() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState("both");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 60 }}
    >
      <Text style={[styles.heading, { fontFamily: "BebasNeue" }]}>Design Preview</Text>
      <Text style={styles.sub}>Custom components — work in progress, not wired into the app</Text>

      <Section title="Text">
        <Text style={{ fontSize: fontSize.display }}>Display — big title</Text>
        <Text style={{ fontSize: fontSize.title }}>Title — section headers</Text>
        <Text style={{ fontSize: fontSize.lg }}>Body large — card titles</Text>
        <Text style={{ fontSize: fontSize.md }}>Body — regular content text</Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.placeholder }}>Caption / muted — secondary info</Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.primary }}>Accent text</Text>
      </Section>

      <Section title="Icon + IconButton">
        <Row>
          <Icon source="heart" size={22} color={colors.primary} />
          <Icon source="movie-open-outline" size={22} color={colors.placeholder} />
          <Icon source="chevron-right" size={22} color={colors.text} />
          <IconButton icon="refresh" />
          <IconButton icon="refresh" iconColor={colors.primary} />
          <IconButton icon="share-variant-outline" size={22} />
          <IconButton icon="delete-outline" disabled />
        </Row>
        <Row>
          <AppbarAction icon="refresh" color={colors.primary} size={22} />
          <AppbarAction icon="close" />
        </Row>
      </Section>

      <Section title="Buttons">
        <Row>
          <Button mode="contained" onPress={() => {}}>Contained</Button>
          <Button mode="outlined" onPress={() => {}}>Outlined</Button>
          <Button mode="text" onPress={() => {}}>Text</Button>
        </Row>
        <Row>
          <PrimaryButton onPress={() => {}}>Primary</PrimaryButton>
          <PrimaryButton loading onPress={() => {}}>Loading</PrimaryButton>
          <PrimaryButton disabled onPress={() => {}}>Disabled</PrimaryButton>
        </Row>
        <Row>
          <Button mode="contained" icon="plus" onPress={() => {}}>With icon</Button>
          <Button mode="outlined" compact onPress={() => {}}>Compact</Button>
        </Row>
      </Section>

      <Section title="TextInput">
        <TextInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          right={
            <TextInput.Icon
              icon="eye"
              onPress={() => {}}
            />
          }
        />
        <TextInput
          label="Email"
          placeholder="you@example.com"
          value=""
          onChangeText={() => {}}
          error
        />
        <TextInput
          label="Note"
          placeholder="Multiline…"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </Section>

      <Section title="SearchField">
        <SearchField
          placeholder="Search movies and TV shows..."
          value={query}
          onChangeText={setQuery}
        />
      </Section>

      <Section title="Chip + SegmentedButtons">
        <Row>
          <Chip>Ready</Chip>
          <Chip icon="clock" style={{ backgroundColor: "#1e88e5" }}>Waiting</Chip>
          <Chip icon="check" onPress={() => {}}>Pressable</Chip>
        </Row>
        <SegmentedButtons
          value={segment}
          onValueChange={setSegment}
          buttons={[
            { value: "both", label: "Both" },
            { value: "movie", label: "Movies" },
            { value: "tv", label: "TV" },
          ]}
          style={styles.segmented}
        />
      </Section>

      <Section title="Card + Surface + TouchableRipple">
        <Card onPress={() => {}} style={styles.demoCard}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold }}>Pressable card</Text>
          <Text style={{ color: colors.placeholder }}>Tap feedback via scale animation</Text>
        </Card>
        <Surface style={styles.demoCard}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold }}>Surface</Text>
          <Text style={{ color: colors.placeholder }}>Flat, hairline border, no shadow</Text>
        </Surface>
        <TouchableRipple onPress={() => {}} style={styles.rippleDemo}>
          <Text>TouchableRipple — dims on press</Text>
        </TouchableRipple>
      </Section>

      <Section title="AvatarText + Badge + Checkbox">
        <Row>
          <AvatarText label="DM" size={48} style={{ backgroundColor: "#7C4DFF" }} />
          <AvatarText label="J" size={36} />
          <AvatarText label="K" size={24} />
          <Badge size={16}>3</Badge>
          <Badge size={20}>12</Badge>
          <Badge />
        </Row>
        <Row>
          <Checkbox status={checked ? "checked" : "unchecked"} onPress={() => setChecked((v) => !v)} color={colors.primary} />
          <Text style={{ fontSize: fontSize.md }}>{checked ? "Checked" : "Unchecked"} — tap it</Text>
        </Row>
      </Section>

      <Section title="Divider">
        <Divider />
        <Divider style={{ marginTop: spacing.md }} />
      </Section>

      <Section title="Dialog">
        <Button mode="outlined" onPress={() => setDialogVisible(true)}>
          Open dialog
        </Button>
      </Section>

      <Dialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        dismissable={false}
      >
        <Dialog.Title>Connection error</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: colors.placeholder }}>
            We couldn't reach the server. Check your connection and try again.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button mode="text" onPress={() => setDialogVisible(false)}>Cancel</Button>
          <Button mode="contained" onPress={() => setDialogVisible(false)}>Retry</Button>
        </Dialog.Actions>
      </Dialog>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  heading: {
    fontSize: typography.bebasSize.empty,
    paddingHorizontal: spacing.lg,
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  segmented: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  demoCard: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  rippleDemo: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
