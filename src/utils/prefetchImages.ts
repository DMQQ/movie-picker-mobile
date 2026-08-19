import { prefetchThumbnail } from "../components/Thumbnail";
import { ThumbnailSizes } from "../components/Thumbnail";

type SizeKey = keyof typeof ThumbnailSizes.poster;

export async function prefetchThumbnails(
  paths: string[],
  sizes: SizeKey | SizeKey[]
) {
  if (!paths.length) return;

  const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
  const promises: Promise<void>[] = [];

  for (const path of paths) {
    for (const sizeKey of sizeArray) {
      const size = ThumbnailSizes.poster[sizeKey];
      if (typeof size === "number") {
        promises.push(prefetchThumbnail(path, size));
      }
    }
  }

  await Promise.all(promises);
}
