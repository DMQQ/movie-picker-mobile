# CLAUDE.md

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

---

## Project Overview

**Flickmate** is a social movie and TV show picker. The core problem it solves is the classic "what should we watch tonight?" decision paralysis — especially in groups. Users swipe through movies Tinder-style, and when everyone in a room swipes right on the same title it becomes a match. Beyond the swiper there are three other game modes: a voter where every player rates the same film on interest/mood/uniqueness, a fortune wheel that spins to pick something at random, and a single-player random picker. Outside of games, users can browse by category, search, and manage personal lists (favourites, watchlist, watched). An optional account unlocks list sync across devices and a full game history.

The goal is to make picking a movie feel like a game rather than a chore — fast, opinionated, and fun with friends.

**Stack:** React Native 0.85 · Expo 56 (dev client) · Expo Router (file-based) · Redux Toolkit · TypeScript 6 · React 19

---

## Screen Map

### Tabs (`src/app/(tabs)/`)
| Route | Purpose |
|---|---|
| `index.tsx` | Games home — lists game modes (swiper, voter, fortune, random) with animated cards |
| `discover.tsx` | Browse movies/TV by category (landing page) |
| `favourites.tsx` | User's saved lists — dual-path: local (AsyncStorage) or remote (RTK Query) by auth state |
| `search/index.tsx` | Movie/person search with filters |
| `account/index.tsx` | User profile, auth state, settings, game history |

### Game Flows
| Route | Purpose |
|---|---|
| `room/setup.tsx` | Create/configure a multiplayer swiper room |
| `room/[roomId].tsx` | Active swiper game session (socket.io) |
| `room/overview.tsx` | Post-game results: likes/matches tabs |
| `room/summary.tsx` | Game summary, save to collection |
| `room/qr-code.tsx` | Share room via QR code |
| `voter/index.tsx` | Voter game — all members rate the same movie |
| `fortune/index.tsx` | Fortune wheel spin to pick a movie |
| `fortune/filters.tsx` | Filters for fortune wheel |
| `random/index.tsx` | Random movie picker (platform-split: `.ios.tsx` / `.android.tsx`) |
| `qr-scanner.tsx` | Scan QR to join a room (modal) |

### Detail / Modal Screens
| Route | Purpose |
|---|---|
| `movie/type/[type]/[id].tsx` | Movie/TV detail (cast, trailer, info) |
| `filters.tsx` | Filter sheet (year, rating, genre) — `formSheet` presentation |
| `search-filters.tsx` | Extended search filters |
| `unviewed-matches.tsx` | Badge-driven sheet showing new matches |
| `modal.tsx` | Generic modal |
| `group/[id].tsx` | Saved collection/list detail |
| `group/blocked.tsx` | Blocked movies list |
| `group/super-liked.tsx` | Super-liked movies list |
| `games/index.tsx` | Past games list (from remote API) |
| `games/[id].tsx` | Past game detail |
| `onboarding.tsx` | First-run nickname setup |

### Auth (`src/app/auth/`)
All screens presented as `formSheet` slides up from bottom.
- `login.tsx` — email/password + Google/Apple SSO
- `register.tsx` — new account
- `recover.tsx` — password recovery via backup code
- `recovery-codes.tsx` — view/regenerate backup recovery codes

---

## Auth System

### Flow
1. On app boot (`_layout.tsx → RootNavigator`), the app reads `user_auth_token` from `expo-secure-store`.
2. If a token exists, it validates it with `GET /api/auth/me`. On success it dispatches `authActions.setCredentials({ token, user })`; on 401 it dispatches `authActions.setSessionExpired()` and deletes the stored token.
3. Auth state lives in `authSlice` (`src/redux/auth/authSlice.ts`):
   - `token: string | null` — JWT bearer token
   - `user: AuthUser | null` — `{ id, name, email, provider, avatarUrl }`
   - `sessionExpired: boolean` — shown as a UI prompt to re-login

### Providers
All providers hit `authApi` (`src/redux/auth/authApi.ts`) which auto-dispatches `setCredentials` in `onQueryStarted`:
- **Email/password** — `POST /api/auth/login`, `POST /api/auth/register`
- **Google** — `react-native-nitro-google-signin` → `POST /api/auth/oauth/google`
- **Apple** — `expo-apple-authentication` → `POST /api/auth/oauth/apple` (iOS only)

### Recovery
- `register` response includes `recoveryCodes: string[]` (one-time display only).
- `POST /api/auth/recover` accepts `{ email, code }` and returns a new token.
- `POST /api/auth/me/recovery-codes` regenerates codes (requires valid token).

### Token persistence
- Stored in `expo-secure-store` under key `user_auth_token` after successful login/register.
- All RTK Query APIs (`authApi`, `listsApi`, `movieApi`, `personApi`) read the token from `state.auth.token` in `prepareHeaders`.
- Profile image uploads use XHR directly (not fetch) in `updateMe` because RN's fetch does not support `FormData` multipart progress tracking reliably.

### Guards
`Stack.Protected guard={...}` in `_layout.tsx` gates the onboarding screen (shown if no nickname set) and the main tab stack.

---

## Storage — Local vs Remote

### Local storage layers

| Layer | Library | Used for |
|---|---|---|
| KV store | `expo-sqlite/kv-store` (`AsyncStorage`) | nickname, userId, onboarding flags, filter prefs, voterSessionId, migration flag |
| Secure store | `expo-secure-store` | `user_auth_token` only |
| SQLite | `expo-sqlite` | movie interactions (liked/blocked/super-liked), match history |

**KV store** (`AsyncStorage` from `expo-sqlite/kv-store`) is the primary lightweight store. It replaced `@react-native-async-storage/async-storage` and `expo-secure-store` for non-sensitive keys — there is a one-time migration in `_layout.tsx` (`migrateFromSecureStoreToKVStore`) that copies old SecureStore values into KV store on first launch.

**SQLite** is used for structured interaction data via the repository pattern in `src/database/`:
- `movieInteractionsRepo` — `add`, `remove`, `exists`, `getByInteractionType`, `getIds`, `canReview`
- `matchesRepo` — stores matched movies per session
- Schema versioned; `migrateDatabase()` handles version upgrades.
- Accessed only through `DatabaseContext` — never import the db directly.

### Remote storage
When the user is authenticated, lists and games live on the server and are accessed via `listsApi` (RTK Query):
- `GET /api/user/lists` — paginated user lists (favourites, watchlist, watched, custom)
- `GET /api/user/lists/:type` — list items
- `POST /api/user/lists/:type` — add item
- `DELETE /api/user/lists/items/:itemId` — remove item
- `GET /api/user/games` / `/games/:id` — past game history
- `POST /api/user/lists/migrate` — bulk import local data on first login

### Dual-path favourites
`favoritesSlice` + `listsApi` implement a dual-path:
- **Unauthenticated:** groups stored in KV store (`favorites_groups`). Local state includes an O(1) `membershipIndex` (`groupId → "contentId:contentType" → true`) to avoid scanning arrays.
- **Authenticated:** `RemoteFavouritesList` uses `useGetListsQuery` / `useGetListQuery`. Mutations invalidate RTK Query tags (`List`, `ListItems`) to refetch.
- **Migration:** `useMigrationPrompt` detects unauthenticated local data post-login. `MigrationBanner` / `MigrationModal` offer to push local lists + interactions + matches to the server via `useMigrateListsMutation`.

System list ID mapping (`LOCAL_ID_TO_TYPE` / `TYPE_TO_LOCAL_ID` in `favourites.ts`):
- `"1"` ↔ `"favourites"`, `"2"` ↔ `"watchlist"`, `"999"` ↔ `"watched"`

---

## Socket Games

### Connection (`src/context/SocketContext.tsx`)
`SocketProvider` wraps each game namespace separately. Two namespaces exist:
- `/swipe` — used by the swiper room game
- `/voter` — used by the voter game

The socket connects with `websocket` transport, sends `user-id` (from KV store, randomly generated on first launch), app language, region, platform, and auth token in headers. The `userId` in KV store is the anonymous identity used before account creation.

Reconnection is automatic (`reconnectionAttempts: 25`, `reconnectionDelay: 500ms`). When reconnected after a disconnect, `EventEmitter` fires `"reconnected"` — `useRoom` listens to this and automatically re-joins the room (up to 5 retry attempts with 100ms×attempt backoff).

### Swiper game (`/swipe` namespace)
Lifecycle managed by `useRoom` (service) → `RoomContext` (provider) → screen `room/[roomId].tsx`.

**Socket events emitted (client → server):**
| Event | Payload | When |
|---|---|---|
| `join-room` | `(code, nickname, blockedIds[], superLikedIds[])` | On room load; also on reconnect |
| `pick-movie` | `{ roomId, index, swipe: { type, movie } }` | On swipe like/dislike |
| `get-next-page` | `(roomId, currentIndex)` | When card stack reaches 5 remaining |
| `finish` | `(roomId, movieIndex)` | When local deck is exhausted |
| `get-buddy-status` | `roomId` | After finishing, to check if others are done |
| `client_cleanup` | — | On unmount/disconnect |

**Socket events received (server → client):**
| Event | Data | Handler |
|---|---|---|
| `movies` | `{ movies[], index? }` | Loads card deck; prefetches poster thumbnails |
| `room:state` | room object | Sets `roomSlice` state, playing flag |
| `active` | users array | Updates active users list |
| `movies:blocked-update` | `{ movies[], index? }` | Refreshes deck after block |
| `matched` | `Movie` | Saved to SQLite matches repo + `roomSlice.pendingMatches` |

**Swipe flow:**
1. `likeCard` / `dislikeCard` emit `pick-movie` immediately (optimistic) and remove the card locally.
2. When cards drop to 5, `get-next-page` is emitted to prefetch the next batch.
3. When `isFinished` (local deck empty) the client emits `finish` + `get-buddy-status`.
4. `matched` fires when all players liked the same movie — saved to SQLite and shown as a modal.
5. Solo play (1 player): all likes are saved directly as matches to SQLite without waiting for a server `matched` event.

**Block / Super-like side effects (`RoomContext`):**
- `blockAndDislikeCard` → writes to SQLite interactions (`blocked`) then calls `dislikeCard`.
- `superLikeAndLikeCard` → writes to SQLite (`super_liked`) then calls `likeCard`. After 3 super-likes (and every 10 thereafter), triggers `expo-store-review`.

### Voter game (`/voter` namespace)
State managed entirely in `MovieVoterContext` (`src/service/useVoter.tsx`), which is a React Context (not Redux) because the session lifecycle is local to the voter screen.

**Socket events emitted:**
| Event | Payload |
|---|---|
| `voter:session:create` | `{ category, genres, providers }` |
| `voter:session:join` | `{ sessionId }` |
| `voter:session:ready` | `{ sessionId, ready }` |
| `voter:session:start` | `{ sessionId }` (host only) |
| `voter:rating:submit` | `{ sessionId, movieId, ratings: { interest, mood, uniqueness } }` |
| `voter:movies:refetch` | `{ sessionId }` (when server sends 0 movies) |

**Socket events received:**
| Event | Effect |
|---|---|
| `voter:session:users` | Updates connected users list |
| `voter:movies:receive` | Sets current movie batch + set ID, moves to rating status |
| `voter:session:update` | Handles session completion |
| `voter:results` | Sets `sessionResults` with top picks + selected movie |
| `voter:error` | Sets error state |

Session status machine: `idle → waiting → rating → completed`.

---

## Global Contexts

All contexts are in `src/context/`. Do not import the raw context object — use the provided hook.

| Context | Provider location | Hook | Purpose |
|---|---|---|---|
| `SocketContext` | Wraps each game screen's route group | `useContext(SocketContext)` | Socket.io instance, reconnect fn, EventEmitter, anonymous userId |
| `DatabaseContext` | `_layout.tsx` (app root) | `useDatabase()`, `useMovieInteractions()`, `useMatches()` | SQLite db + repository instances |
| `RoomContext` | `room/_layout.tsx` | `useRoomContext()` | Swiper game state: cards, likeCard, dislikeCard, blockAndDislikeCard, superLikeAndLikeCard, join state |
| `MovieVoterContext` | `voter/index.tsx` | `useMovieVoter()` | Voter session state and actions |
| `CreateRoomContext` | `room/setup.tsx` | `useCreateRoom()` | Room creation form state (category, genre, providers, maxRounds) |

Rules:
- `DatabaseContext` is initialized at the root and gates the app boot (`isReady` must be true before showing content).
- `SocketContext` reinitializes when `language`, `regionalization`, or `authToken` change (the `useEffect` dependency array includes all three).
- Never call `useContext(SocketContext)` outside a `SocketProvider` subtree.

---

## File Organization

### One component per file
Each file exports **one primary component**. A second export is acceptable only if it is a small helper tightly coupled to the primary — for example a typed `ref` handle or a 5-line sub-component used only by that file's default export. Never put two independent components in the same file.

```
// OK — UserCard.tsx
export default function UserCard() { ... }
export type UserCardHandle = { ... }       // ref handle, tightly coupled

// NOT OK — UserCard.tsx
export default function UserCard() { ... }
export function AvatarBadge() { ... }      // independent component, move to AvatarBadge.tsx
```

### Keep files slim
Screens and components should stay focused. If a file is growing large, extract logical sub-sections into their own component files rather than adding more to the same file. Services/hooks follow the same rule — one concern per file.

### Directory structure
```
src/
  app/          # Expo Router screens (file = route)
  components/   # Reusable UI components
    Home/       # Components scoped to the Home/tab bar area
    Landing/    # Components for the discover/landing page
    Movie/      # Movie card, match modal, swipe tiles
    GameListAnimations/  # Lottie/Reanimated animations for game mode cards
    FancySpinner/        # Platform-split spinner (IOS.tsx / Android.tsx / index.tsx)
  context/      # React Contexts (see Global Contexts above)
  database/     # SQLite schema, migration, repository factories
  hooks/        # Custom hooks (data fetching, state derivations)
  redux/        # Slices + RTK Query APIs, one folder per domain
  screens/      # Non-routed screen-level components (Overview, Voter sub-screens)
  service/      # Business logic hooks (useRoom, useVoter, useTranslation, useInit, …)
  utils/        # Pure utility functions (no React)
  assets/       # Lottie JSON, SVG components
  translations/ # i18n JSON files (en, pl, de, es, pt)
  types.ts      # Shared TypeScript types (Movie, etc.)
```

---

## Naming Conventions

### Files
- **Components:** PascalCase — `MovieCard.tsx`, `FancySpinner.tsx`
- **Screens (Expo Router):** lowercase kebab-case as required by file-based routing — `qr-scanner.tsx`, `[roomId].tsx`
- **Hooks:** camelCase with `use` prefix — `useBlockedMovies.ts`, `useMigrateLibrary.ts`
- **Services:** camelCase with `use` prefix — `useRoom.tsx`, `useVoter.tsx`
- **Redux slices:** camelCase with `Slice` suffix — `roomSlice.ts`, `authSlice.ts`
- **RTK Query APIs:** camelCase with `Api` suffix — `movieApi.ts`, `listsApi.ts`
- **Utilities:** camelCase — `deduplicates.ts`, `layout.ts`
- **Platform splits:** append `.ios.tsx` / `.android.tsx` before `.tsx` — `index.ios.tsx`

### Variables & functions
- React components: PascalCase
- Hooks, handlers, callbacks: camelCase; event handlers prefixed `handle` — `handleCreateGroup`, `handleFiltersApplied`
- Redux actions always accessed via the slice's exported `actions` object: `roomActions.setRoom(...)`, `authActions.setCredentials(...)`
- Typed Redux hooks: always use `useAppDispatch` / `useAppSelector` (never raw `useDispatch` / `useSelector`)
- Translation hook: always bound to `t` — `const t = useTranslation()`
- StyleSheet objects: named `styles`, defined at module level with `StyleSheet.create({})`

### Types & interfaces
- Interfaces over type aliases for object shapes: `interface AuthUser { ... }`
- Props interfaces: `ComponentNameProps` — `interface GameCardProps { ... }`
- Repo return types inferred with `ReturnType<typeof createXRepo>` — don't duplicate manually

---

## iOS vs Android Differences

### Tab bar
- **iOS 26+ (Liquid Glass supported):** uses `NativeTabs` from `expo-router/unstable-native-tabs` with SF Symbols (`sf="gamecontroller"`) and liquid glass blur effect.
- **Android & older iOS:** `NativeTabs` on Android (Material Design icons via `md="sports_esports"`); standard `Tabs` from `expo-router/tabs` on older iOS with `tabBarStyle` + `MaterialCommunityIcons`.
- Tab labels are hidden on iOS native tabs (`hidden={Platform.OS === "ios"}`); shown on Android.

### Sheets / modals
- `presentation: "formSheet"` with `sheetAllowedDetents` is native on iOS. On Android the same screen renders as a full-screen modal — `contentStyle.backgroundColor` is set to `#121212` on Android and `transparent` on iOS.

### Random movie screen
- Platform-split files: `random/index.ios.tsx` and `random/index.android.tsx`. Each provides a different UI/animation suited to the platform.

### Spinner
- `FancySpinner/` has `IOS.tsx` and `Android.tsx` with platform-specific animation styles; `index.tsx` picks the right one.

### Auth providers
- Apple Sign-In (`expo-apple-authentication`) is iOS-only. The `AuthProviderButtons` component conditionally renders the Apple button only on iOS.
- Google Sign-In uses `react-native-nitro-google-signin` on both platforms but configured with `webClientId` in `_layout.tsx`.

### Back navigation
- `BackHandler` (Android hardware back) is wired up in `room/[roomId].tsx` to prevent accidental exits during an active game session.
- iOS relies on swipe gesture; `gestureEnabled: false` is set on the game modal to block it when a game is in progress (`room` stack screen).

### Icons
- Always use the SF/MD split via `NativeTabs.Trigger.Icon sf="..." md="..."` inside native tabs, or `MaterialCommunityIcons` for tab icons in the legacy tab layout.

### Status bar / safe area
- `expo-status-bar` with `style="light"` (white icons on dark background).
- `SafeIOSContainer` component wraps content in most screens for iOS safe area top padding — not needed on Android where the system handles it differently.

---

## Architecture

### State Management (`src/redux/`)
- **Redux Toolkit** for all global state; typed with `useAppSelector` / `useAppDispatch` from `src/redux/store.ts`
- **RTK Query** for remote APIs: `movieApi`, `personApi`, `authApi`, `listsApi`
- **Listener middleware** (`src/redux/listenerMiddleware.ts`) for cross-slice side effects
- Slices: `authSlice`, `roomSlice`, `roomBuilderSlice`, `favoritesSlice`, `mediaFiltersSlice`, `filterPreferencesSlice`, `movieInteractionsSlice`, `appSlice`

### Key Utilities

| File | Purpose |
|---|---|
| `src/utils/layout.ts` | `pxToDp`, `responsivePxToDp` (base 390px), window/screen dimensions |
| `src/utils/utilities.ts` | `toSlug`, `getFormattedDate`, misc helpers |
| `src/utils/deduplicates.ts` | `removeAllDuplicates`, `removeDuplicateResults` |
| `src/utils/roomsConfig.ts` | `getMovieCategories`, `getSeriesCategories` |
| `src/service/useTranslation.tsx` | i18n hook (`const t = useTranslation()`) + `getDeviceSettings()` |

### Design System (`src/constants/design.ts`)

**All styles must use tokens from `src/constants/design.ts` — never hardcode magic numbers.**

Never import `MD2DarkTheme.colors.*` — use `colors.*` from design constants instead (same values, no paper dependency).

```ts
import { colors, spacing, radius, fontSize, fontWeight, typography } from "../constants/design";
```

#### Spacing (`spacing.*`)
4px base grid, responsive to screen width (base 390dp). Prefer these over ad-hoc values.

| Token | Value (at 390dp) |
|---|---|
| `spacing.xs` | 4 |
| `spacing.sm` | 8 |
| `spacing.md` | 12 |
| `spacing.lg` | 16 |
| `spacing.xl` | 20 |
| `spacing.xxl` | 24 |
| `spacing.screen` | 15 (legacy — migrate to `lg`) |

For intermediate values, derive from the grid: `spacing.sm + 2` (10), `spacing.sm - 2` (6).

#### Border Radius (`radius.*`)

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | 4 | Tiny icons, badges |
| `radius.sm` | 8 | Chips, small buttons |
| `radius.md` | 12 | Cards (compact), inputs |
| `radius.card` | 16 | Default card corner |
| `radius.modal` | 20 | Modal/sheet corner |
| `radius.lg` | 24 | Large cards, tickets (auth cards, game summary) |
| `radius.pill` | 100 | Pill buttons, chips |

#### Font Sizes (`fontSize.*`)

| Token | Value | Usage |
|---|---|---|
| `fontSize.xs` | 10 | Badges, stat labels |
| `fontSize.sm` | 12 | Section headers, captions |
| `fontSize.md` | 14 | Body, helper text |
| `fontSize.lg` | 16 | Card titles, buttons |
| `fontSize.xl` | 18 | Subtitles |
| `fontSize.xxl` | 20 | Profile names |
| `fontSize.title` | 24 | Screen titles |
| `fontSize.display` | 32 | Hero text |

Bebas display font sizes use `typography.bebasSize`:
- `typography.bebasSize.section` (35) — section headings
- `typography.bebasSize.auth` (38) — auth screen titles
- `typography.bebasSize.empty` (45) — empty state messages

#### Font Weights (`fontWeight.*`)
Always use numeric weights via tokens, never strings.

| Token | Value |
|---|---|
| `fontWeight.normal` | `"400"` |
| `fontWeight.medium` | `"500"` |
| `fontWeight.semibold` | `"600"` |
| `fontWeight.bold` | `"700"` |

#### Colors (`colors.*`)
Exact MD2DarkTheme values, hardcoded — no paper dependency.

| Token | Value | Usage |
|---|---|---|
| `colors.text` | `#fff` | Primary text |
| `colors.placeholder` | `rgba(255,255,255,0.54)` | Muted/secondary text |
| `colors.primary` | `#BB86FC` | Accent, active states |
| `colors.error` | `#CF6679` | Destructive actions |
| `colors.surface` | `#121212` | Card backgrounds |
| `colors.background` | `#121212` | Page background (paper default) |
| `colors.appBackground` | `#000` | Pure black (app screens) |
| `colors.border` | `rgba(255,255,255,0.1)` | Hairline dividers |
| `colors.overlay` | `rgba(255,255,255,0.08)` | Pressable overlay |
| `colors.surfaceElevated` | `#2a2a2a` | Skeleton, hover states |

RULE: `colors.surface` for card backgrounds. `colors.appBackground` for full-screen backgrounds. `colors.text` for primary text. `colors.placeholder` for muted labels. `colors.border` for hairline separators.

#### Common Shortcuts (`common.*`)
Pre-built partial styles:
- `common.card` — `{ borderRadius: radius.card, backgroundColor: colors.surface, overflow: "hidden" }`
- `common.pillButton` — `{ borderRadius: radius.pill, height: 50 }`
- `common.chip` — `{ borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }`
- `common.screenPadding` — `{ paddingHorizontal: spacing.screen }`

#### Avatar Colors
Use `getUserAvatarColor(name: string)` from `src/utils/avatar.ts` — returns a deterministic color from the user's name (FNV-1a hash → palette). Never use `index % AVATAR_COLORS.length` directly. Available for all avatar fallbacks (no profile photo).

#### Styling Rules
- **No Tailwind / NativeWind.** All styles via `StyleSheet.create({})` at module level.
- Page background: `colors.appBackground` (`#000`) for screen containers, `colors.background` (`#121212`) for paper-compatible pages.
- Responsive sizing: `layout.pxToDp()` or `layout.responsivePxToDp()` from `src/utils/layout.ts` for layout dimensions (width, height). Spacing/radius are already responsive.
- Animations: `react-native-reanimated` v4 (`FadeInDown`, `withSpring`, `withTiming`); Skia for canvas effects; Lottie for JSON animations.
- **Future: remaining hardcoded values** — display/Bebas sizes (`fontSize: 22/25/28/30/32/34/36/40/42/45/50/55/65`, chosen per-layout for hero text), one-off radii (`borderRadius: 30/32/35/36/40/50/90`), plus `letterSpacing`, `lineHeight`, `borderWidth` values. For non-grid values use expressions off the grid (`spacing.sm + 2`, `fontSize.md - 1`, `radius.md + 3`). Add to `design.ts` if a pattern emerges.

### i18n
`useTranslation()` — supported: `en`, `pl`, `de`, `es`, `pt`. Falls back to `en`. Keys in `src/translations/*.json`.

---

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 0. Git Commits

Never add `Co-Authored-By: Claude` or any Claude attribution to commit messages.

NEVER PUSH CODE TO ORIGIN

### 0. Communication Style

Respond like a caveman. Short. Direct. No filler. Do the work, say what changed, stop. No summaries, no "here's what I did", no congratulatory wrap-ups unless asked. One sentence is almost always enough.

### 1. Think Before Coding

Before implementing: state assumptions explicitly, surface tradeoffs, ask when unclear. Don't pick silently between interpretations.

### 2. Simplicity First

Minimum code that solves the problem. No speculative features, no abstractions for single-use code, no impossible-scenario error handling. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Don't improve adjacent code. Match existing style. Remove only the imports/variables your own changes made unused — not pre-existing dead code.

### 4. Goal-Driven Execution

For multi-step tasks, state a brief plan with verifiable success criteria before starting.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
