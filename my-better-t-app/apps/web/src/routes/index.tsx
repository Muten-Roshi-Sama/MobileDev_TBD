import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

import { seedAll, seedConversationsAndMessages, seedUsers } from "@/dev/dev-seed";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = `
  ██████╗ ███████╗████████╗████████╗███████╗██████╗       ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
  ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗      ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
  ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝         ██║       ███████╗   ██║   ███████║██║     █████╔╝
  ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗         ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
  ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║         ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
  ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝         ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
  `;



function SeedLayout(){
  const [seedState, setSeedState] = useState("");

  const handleSeedUsers = async () => {
    setSeedState("Seeding users...");
    const result = await seedUsers();
    setSeedState(JSON.stringify(result, null, 2));
  };

  const handleSeedConversations = async () => {
    setSeedState("Seeding conversations and messages...");
    const result = await seedConversationsAndMessages();
    setSeedState(JSON.stringify(result, null, 2));
  };

  const handleSeedAll = async () => {
    setSeedState("Seeding everything...");
    const result = await seedAll();
    setSeedState(JSON.stringify(result, null, 2));
  };

  return (
    <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Dev Tools</h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedUsers}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Seed test users
          </button>

          <button
            onClick={handleSeedConversations}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Seed conversations + messages
          </button>

          <button
            onClick={handleSeedAll}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Seed all
          </button>
        </div>

        {seedState ? (
          <pre className="mt-4 whitespace-pre-wrap rounded bg-muted p-3 text-sm">
            {seedState}
          </pre>
        ) : null}
      </section>
  )


}

// =====================================

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  // DEV
  // ----------------------------
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            {/* <pre>orpc.healthCheck</pre> */}
            <span className="text-muted-foreground text-sm">
              {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data
                  ? "Connected"
                  : "Disconnected"}
            </span>
          </div>
          
        </section>

        {/* <SeedLayout>
        </SeedLayout> */}

      </div>
    </div>
  );
}
