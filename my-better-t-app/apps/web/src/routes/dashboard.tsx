import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";
import { orpc, client } from "@/utils/orpc";
import React, { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};




export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Dashboard() {
  const { session } = Route.useRouteContext();
  const privateData = useQuery(orpc.privateData.queryOptions());

  // Load current user info
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    client.message.getCurrentUserInfo().then((user) => {
      if (user) setUser(user);
    });
  }, []);



  return (
    <div>
      <h1>Dashboard</h1>
      {/* <p>Welcome {session?.user.name}</p>
      <p>API: {privateData.data?.message}</p> */}

      {user ? (
        <div className="max-w-md mx-auto bg-grey rounded-lg shadow p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">User Info</h2>
          <div className="space-y-2">
            <div><b>ID:</b> {user.id}</div>
            <div><b>Name:</b> {user.name}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Created At:</b> {user.createdAt.toLocaleString()}</div>
            <div><b>Updated At:</b> {user.updatedAt.toLocaleString()}</div>
            {user.image && (
              <div>
                <b>Image:</b><br />
                <img src={user.image} alt="User" className="w-24 h-24 rounded-full mt-2" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mt-8">Loading user info...</div>
      )}
    </div>
    
  );
}
