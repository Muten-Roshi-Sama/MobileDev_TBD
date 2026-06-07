import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

import { seedAll, seedConversationsAndMessages, seedUsers } from "@/dev/dev-seed";



// =====================================

export const Route = createFileRoute("/")({
  component: HomeComponent,

  // add SEO tags in the HTML head.
  // on first load :
  //    - search engines can read the metadata immediately
  //    - social previews can work properly
  head: () => ({
    meta: [
      { title: "My Better T App | Simple real-time messaging" },
      {
        name: "description",
        content:
          "A simple real-time messaging app with secure login, fast conversations, and modern chat UX.",
      },
      { property: "og:title", content: "My Better T App" },
      {
        property: "og:description",
        content:
          "A simple real-time messaging app with secure login, fast conversations, and modern chat UX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});





// =====================================

function HomeComponent() {

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center px-4 py-12">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <section className="max-w-xl">
          <p className="mb-4 inline-flex rounded-full border px-3 py-1 text-sm text-muted-foreground">
            Real-time messaging app
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Chat simply, stay connected.
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            A clean messaging app for fast conversations, secure sign-in, and
            live updates.
          </p>

          {/* <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/messaging"
              className="rounded-md bg-primary px-5 py-3 text-primary-foreground"
            >
              Open app
            </Link>

            <Link
              to="/dashboard"
              className="rounded-md border px-5 py-3"
            >
              Dashboard
            </Link>
          </div> */}

          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <li>• Real-time chat</li>
            <li>• Secure auth</li>
            <li>• Optimistic updates</li>
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Preview</p>
              <p className="text-sm text-muted-foreground">
                How your app feels at a glance
              </p>
            </div>
            <div className="rounded-full bg-green-500 px-3 py-1 text-xs text-white">
              Online
            </div>
          </div>

          <div className="space-y-4">
            <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-muted px-4 py-3 text-sm">
              Hey, are you free to talk?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-none bg-primary px-4 py-3 text-sm text-primary-foreground">
              Yes — send me the details.
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-4 text-sm text-muted-foreground">
            Fast, private, and ready for live conversation.
          </div>
        </section>
      </div>
    </main>
  );
}
