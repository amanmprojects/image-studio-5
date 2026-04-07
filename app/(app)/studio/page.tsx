import { StudioClient } from "@/components/app/studio-client";
import { getUserCollections, getUserGallery } from "@/lib/image-service";
import { requireSession } from "@/lib/session";

export default async function StudioPage() {
  const session = await requireSession();
  const [collections, images] = await Promise.all([
    getUserCollections(session.user.id),
    getUserGallery(session.user.id),
  ]);

  return (
    <StudioClient
      initialCollections={collections}
      initialRecentImages={images.slice(0, 6)}
    />
  );
}
