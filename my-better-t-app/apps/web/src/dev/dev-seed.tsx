// dev-seed.tsx
import { authClient } from "@/lib/auth-client"; // DEV ONLY
import { orpc, queryClient, client } from "../utils/orpc";


type ORPC = typeof orpc



// Inherit Types
import type { Prisma } from '../../../../packages/db/prisma/generated/client';
type User = Prisma.UserGetPayload<{ 
    // include:{ conversations: true, messagesSent: true, sessions: true, accounts: true  } 
    select: {
        id: true;
        name: true;
        email: true;
        image: true;
        createdAt: true;
        updatedAt: true;        
    }
}>
type Conversation = Prisma.ConversationGetPayload<{ include:{ participants: true, messages:true } }>
type Message = Prisma.MessageGetPayload<{ include:{ sender: true, conversation: true } }>
type ConversationParticipant = Prisma.ConversationParticipantGetPayload<{ include:{ user: true, conversation: true } }>


// Seed Types
type SeedUser = {
    email: string;
    password: string;
    name: string;
}
type SeedMessage = {
    senderEmail: string;
    text: string;
};
type SeedConversation = {
    participantEmails: string[];
    messages: SeedMessage[];
};



// MOCK Data
const testUsers = [
    { email: "admin@test.com", password: "password123", name: "admin" },
    { email: "alice@test.com", password: "password123", name: "Alice" },
    { email: "bob@test.com", password: "password123", name: "Bob" },
    { email: "charlie@test.com", password: "password123", name: "Charlie" },
    { email: "dana@test.com", password: "password123", name: "Dana" },
    { email: "eric@test.com", password: "password123", name: "Eric" },
    { email: "fiona@test.com", password: "password123", name: "Fiona" },
    { email: "george@test.com", password: "password123", name: "George" },
];
const testConversations: SeedConversation[] = [
  {
    participantEmails: ["alice@test.com"],
    messages: [
      { senderEmail: "admin@test.com", text: "Hey Alice, welcome aboard." },
      { senderEmail: "alice@test.com", text: "Thanks admin, glad to be here." },
      { senderEmail: "admin@test.com", text: "If you need anything, just ask." },
    ],
  },
  {
    participantEmails: ["bob@test.com"],
    messages: [
      { senderEmail: "admin@test.com", text: "Bob, did you finish the task?" },
      { senderEmail: "bob@test.com", text: "Almost done." },
      { senderEmail: "admin@test.com", text: "Cool, send it when ready." },
    ],
  },
  {
    participantEmails: ["charlie@test.com"],
    messages: [
      { senderEmail: "charlie@test.com", text: "I tested the latest changes." },
      { senderEmail: "admin@test.com", text: "Great, any issues so far?" },
      { senderEmail: "charlie@test.com", text: "Everything looks fine." },
    ],
  },
  {
    participantEmails: ["alice@test.com", "bob@test.com"],
    messages: [
      { senderEmail: "admin@test.com", text: "Alice and Bob, this is your shared thread." },
      { senderEmail: "alice@test.com", text: "Understood." },
      { senderEmail: "bob@test.com", text: "Got it." },
      { senderEmail: "admin@test.com", text: "Thanks both." },
    ],
  },
  {
    participantEmails: ["dana@test.com", "eric@test.com"],
    messages: [
      { senderEmail: "admin@test.com", text: "Dana and Eric, please review this." },
      { senderEmail: "dana@test.com", text: "Looks good from my side." },
      { senderEmail: "eric@test.com", text: "Same here." },
      { senderEmail: "admin@test.com", text: "Perfect." },
    ],
  },
  {
    participantEmails: ["fiona@test.com", "george@test.com"],
    messages: [
      { senderEmail: "admin@test.com", text: "Fiona and George, new discussion thread." },
      { senderEmail: "fiona@test.com", text: "Thanks for setting this up." },
      { senderEmail: "george@test.com", text: "Ready to follow along." },
      { senderEmail: "admin@test.com", text: "Nice, let's continue here." },
    ],
  },
];


// ------------- Helpers --------------------
const passwordByEmail: Record<string, string> = Object.fromEntries(
  testUsers.map((user) => [user.email, user.password]),
);
async function signInAs(email: string) {
  const password = passwordByEmail[email];
  if (!password) {
    throw new Error(`No password found for ${email}`);
  }

  await authClient.signIn.email({
    email,
    password,
  });
}
async function getUsersByEmail(): Promise<Map<string, User>> {
  const users = await client.user.getAll();
  return new Map(users.map((user) => [user.email, user]));
}




// ============== SEED =======================
export async function seedUsers() {
  const created: Array<{ email: string; status: string; error?: string }> = [];

  for (const user of testUsers) {
    try {
      await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: user.name,
      });
      created.push({ email: user.email, status: "created" });
    } catch (error: any) {
      const message = error?.error?.message || String(error);
      created.push({
        email: user.email,
        status: message.includes("already exists") ? "already exists" : "error",
        error: message,
      });
    }
  }

  return created;
}

export async function seedConversationsAndMessages() {
  const usersByEmail = await getUsersByEmail();

  const created: Array<{
    participants: string[];
    conversationId: string;
    messages: number;
  }> = [];

  for (const conversationSpec of testConversations) {
    const participantIds = conversationSpec.participantEmails.map((email) => {
      const user = usersByEmail.get(email);
      if (!user) {
        throw new Error(`Missing seeded user: ${email}`);
      }
      return user.id;
    });

    await signInAs("admin@test.com");
    const conversation = await client.conversation.create({ userIds: participantIds });

    for (const message of conversationSpec.messages) {
      await signInAs(message.senderEmail);
      await client.message.send({
        conversationId: conversation.id,
        text: message.text,
      });
    }

    created.push({
      participants: conversationSpec.participantEmails,
      conversationId: conversation.id,
      messages: conversationSpec.messages.length,
    });
  }

  await signInAs("admin@test.com");

  return created;
}

export async function seedAll() {
  const users = await seedUsers();
  const conversations = await seedConversationsAndMessages();

  return { users, conversations };
}











