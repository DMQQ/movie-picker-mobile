import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useGetListQuery, useRemoveItemMutation, usePatchItemMutation } from "../redux/lists/listsApi";
import { removeFromGroup, rateInGroup } from "../redux/favourites/favourites";

interface RemoteGroupMeta {
  id: string;
  type: string;
  name: string;
}

export interface GroupMovie {
  id: number;
  imageUrl: string;
  type: string;
  title?: string;
  rating?: number | null;
  review?: string | null;
}

export interface RatePayload {
  rating?: number | null;
  review?: string | null;
}

export function useGroupData() {
  const params = useLocalSearchParams<{ id: string; group?: string }>();
  const groups = useAppSelector((st) => st.favourite.groups);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  const remoteGroupMeta = useMemo<RemoteGroupMeta | null>(() => {
    if (!params.group) return null;
    try {
      return JSON.parse(params.group) as RemoteGroupMeta;
    } catch {
      return null;
    }
  }, [params.group]);

  const isRemote = !!user && user.provider !== "anonymous" && !!remoteGroupMeta;
  const listType = remoteGroupMeta?.type ?? null;

  const { data: remoteListData, isLoading: isListLoading } = useGetListQuery(
    listType ?? "",
    { skip: !isRemote || !listType },
  );
  const [removeItem] = useRemoveItemMutation();
  const [patchItem] = usePatchItemMutation();

  const itemIdMap = useMemo(() => {
    if (!remoteListData) return new Map<number, string>();
    return new Map(remoteListData.items.map((item) => [item.contentId, item.id]));
  }, [remoteListData]);

  const data = useMemo(() => {
    if (isRemote) {
      return {
        id: params.id,
        name: groups.find((g) => g.id === params.id)?.name ?? remoteGroupMeta!.name,
        movies: remoteListData
          ? remoteListData.items.map((item) => ({
              id: item.contentId,
              imageUrl: item.content?.poster_path ?? "",
              type: item.contentType,
              title: item.content?.title,
              rating: item.rating,
              review: item.review,
            }))
          : [],
      };
    }
    const localGroup = groups.find((g) => g.id === params.id);
    if (!localGroup) return undefined;
    return {
      ...localGroup,
      movies: localGroup.movies.map((m) => ({
        id: m.id,
        imageUrl: m.imageUrl,
        type: m.type,
        title: undefined,
        rating: m.rating,
        review: m.review,
      })),
    };
  }, [isRemote, remoteListData, remoteGroupMeta, groups, params.id]);

  const handleRemoveItem = (movieId: number) => {
    const remoteItemId = itemIdMap.get(movieId);
    if (isRemote && remoteItemId) {
      removeItem({ itemId: remoteItemId, listType: listType ?? undefined });
    } else {
      dispatch(removeFromGroup({ groupId: data?.id!, movieId }));
    }
  };

  const handleRateItem = (movieId: number, payload: RatePayload) => {
    const remoteItemId = itemIdMap.get(movieId);
    if (isRemote && remoteItemId) {
      patchItem({ itemId: remoteItemId, listType: listType ?? undefined, ...payload });
    } else {
      dispatch(rateInGroup({ groupId: data?.id!, movieId, ...payload }));
    }
  };

  return { data, isListLoading, isRemote, handleRemoveItem, handleRateItem, itemIdMap, listType };
}
