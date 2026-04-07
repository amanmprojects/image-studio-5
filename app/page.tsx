import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/session";
import { CloudIcon, FolderIcon, SparklesIcon } from "lucide-react";
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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Badge variant="outline">AWS-first image generation studio</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Generate images fast with a simple Gemini-first workflow.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Prompt a Google image model, persist the result to S3, store metadata in SQLite,
                and organize everything into collections without a chat-style workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Gemini-first</Badge>
              <Badge variant="secondary">Imagen optional</Badge>
              <Badge variant="secondary">S3 storage</Badge>
              <Badge variant="secondary">Simple endpoint API</Badge>
            </div>
          </div>
          <Card className="overflow-hidden border bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Built for quick delivery</CardTitle>
              <CardDescription>
                Minimal moving parts, production-shaped data flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-background/80 p-4">
                  <SparklesIcon className="mb-3 size-5" />
                  <p className="text-sm font-medium">Generate</p>
                  <p className="mt-1 text-sm text-muted-foreground">Prompt + model + aspect ratio</p>
                </div>
                <div className="rounded-xl border bg-background/80 p-4">
                  <CloudIcon className="mb-3 size-5" />
                  <p className="text-sm font-medium">Store</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upload straight to AWS S3</p>
                </div>
                <div className="rounded-xl border bg-background/80 p-4">
                  <FolderIcon className="mb-3 size-5" />
                  <p className="text-sm font-medium">Organize</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sort results into collections</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border bg-muted">
                <Image
                  alt="Abstract hero artwork"
                  className="h-auto w-full"
                  height={900}
                  priority
                  src="/window.svg"
                  width={1200}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
