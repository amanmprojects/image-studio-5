import { GalleryClient } from "@/components/app/gallery-client";
import { getUserCollections, getUserGallery } from "@/lib/image-service";
import { requireSession } from "@/lib/session";

export default async function GalleryPage() {
  const session = await requireSession();
  const [collections, images] = await Promise.all([
    getUserCollections(session.user.id),
    getUserGallery(session.user.id),
  ]);

  return (
    <GalleryClient
      initialCollections={collections}
      initialImages={images}
    />
  );
}
