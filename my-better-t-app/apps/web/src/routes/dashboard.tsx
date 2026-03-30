import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";
import { orpc, client } from "@/utils/orpc";
import React, { useState, useEffect } from "react";

import { useUser } from "@my-better-t-app/hooks";


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
  const { currentUserInfo } = useUser(orpc);
  const {user, isLoading, error} = currentUserInfo;

  if (isLoading) {
    return <div className="text-center mt-8">Loading user info...</div>;
  }

  

  if (error) {
    return <div className="text-center mt-8 text-red-500">
      Failed to load user
    </div>;
  }

  if (!user) {
    return <div className="text-center mt-8">Not authenticated</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="max-w-md mx-auto bg-grey rounded-lg shadow p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">User Info</h2>

        <div className="space-y-2">
          <div><b>ID:</b> {user.id}</div>
          <div><b>Name:</b> {user.name}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Created At:</b> {new Date(user.createdAt).toLocaleString()}</div>
          <div><b>Updated At:</b> {new Date(user.updatedAt).toLocaleString()}</div>

          {user.image && (
            <div>
              <b>Image:</b><br />
              <img
                src={user.image}
                alt="User"
                className="w-24 h-24 rounded-full mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

