[
  {
    "file": "src/components/QuickActions.tsx",
    "line": 17,
    "summary": "isInGroup type fallback uses title presence instead of first_air_date, always classifying TV shows as 'movie'",
    "failure_scenario": "Movie type is inferred as `props.movie?.title ? \"movie\" : \"tv\"`. TV shows always have title set (it's non-optional on the Movie type), so any TV show without an explicit `type` field resolves to \"movie\". membershipIndex stores the item under \"<id>:tv\" (set correctly by addToGroup which uses `first_air_date` fallback), but isInGroup looks up \"<id>:movie\" — misses every time. Icon never goes active; tapping dispatches a redundant addToGroup instead of removeFromGroup."
  },
  {
    "file": "src/redux/favourites/favourites.ts",
    "line": 98,
    "summary": "membershipIndex built from remote-only items, missing local un-migrated movies merged into groups",
    "failure_scenario": "loadFavorites builds membershipIndex from filteredLists (remote) at lines 98–106, then merges local-only movies into mergedGroups and localOnlyGroups at lines 142–151. Those local movies are never added to membershipIndex. QuickActions.isInGroup returns false for them, so tapping any Quick Action button dispatches addToGroup instead of removeFromGroup — creating a duplicate entry on the server."
  },
  {
    "file": "src/redux/favourites/favourites.ts",
    "line": 272,
    "summary": "removeFromGroup silently no-ops for un-migrated local items that lack remoteItemId",
    "failure_scenario": "Local movies merged into a group via the localOnly path have no remoteItemId. removeFromGroup guards deletion with `if (movie?.remoteItemId)` — so nothing is sent to the server. Redux state is updated, the item visually disappears, but on the next loadFavorites it reappears from local AsyncStorage. User can never remove a pre-migration movie from a list without first migrating."
  },
  {
    "file": "src/hooks/useSuperLikedMovies.ts",
    "line": 133,
    "summary": "removeSuperLike when authenticated no-ops silently for local-only un-migrated super-liked movies",
    "failure_scenario": "removeSuperLike looks up the item in remoteData.items only. If the movie is local-only (not yet migrated), item is undefined, removeItem is skipped, and the early `return` on line 138 prevents the local SQLite/Redux removal path from running. The movie stays in localSuperLikedMovies indefinitely and reappears every session."
  },
  {
    "file": "src/hooks/useBlockedMovies.ts",
    "line": 165,
    "summary": "clearAllBlocked when authenticated only removes remote items, leaving local un-migrated blocked movies in place",
    "failure_scenario": "The authenticated branch removes each remoteData.items entry and returns early, never dispatching clearAllBlockedAction. blockedMovies merges remote + localBlockedMovies (deduped), so local-only blocked items keep appearing as blocked after 'clear all'. The user believes the list is empty but movies remain filtered from recommendations."
  },
  {
    "file": "src/app/(tabs)/favourites.tsx",
    "line": 57,
    "summary": "handleMigrate has no try/catch — a network error leaves the UI stuck with no feedback",
    "failure_scenario": "If migrate(body).unwrap() throws, the exception propagates uncaught out of handleMigrate. setShowMigrationModal(false), setShowMigrationBanner(false), and dispatch(loadFavorites()) are never reached. The isError field from useMigrateListsMutation is available in the hook return but never read. The Sync button stays disabled/loading indefinitely; local data is not cleared; the user has no indication the migration failed."
  },
  {
    "file": "src/hooks/useMigrateLibrary.ts",
    "line": 17,
    "summary": "toSlug is defined identically in both useMigrateLibrary.ts and favourites.ts — silent drift risk",
    "failure_scenario": "createGroup (favourites.ts line 54) and migrateLibrary (useMigrateLibrary.ts line 17) both define toSlug with the same regex. If the server's slug rules change (e.g. allowing dots), one copy gets updated and the other doesn't. Migration then generates slugs that don't match server-side list types, creating duplicate lists instead of appending to existing ones."
  }
]
