import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/studio");
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="flex flex-col items-center text-center">
          <div className="space-y-6">
            <Badge variant="outline">Image generation studio</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Generate images fast with a simple Gemini-first workflow.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Prompt a Google image model, generate stunning images,
                store metadata in Aurora DSQL, and organize everything into collections.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/sign-up">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Gemini-first</Badge>
              <Badge variant="secondary">Imagen optional</Badge>
              <Badge variant="secondary">Cloud storage</Badge>
              <Badge variant="secondary">Simple endpoint API</Badge>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
