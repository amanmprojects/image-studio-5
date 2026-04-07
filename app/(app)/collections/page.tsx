import { CollectionsClient } from "@/components/app/collections-client";
import { getUserCollections, getUserGallery } from "@/lib/image-service";
import { requireSession } from "@/lib/session";

export default async function CollectionsPage() {
  const session = await requireSession();
  const [collections, images] = await Promise.all([
    getUserCollections(session.user.id),
    getUserGallery(session.user.id),
  ]);

  return (
    <CollectionsClient
      initialCollections={collections}
      initialImages={images}
    />
  );
}
