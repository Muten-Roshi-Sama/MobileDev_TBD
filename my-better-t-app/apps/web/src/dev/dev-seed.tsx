// dev-seed.tsx
import { authClient } from "@/lib/auth-client"; // DEV ONLY
import { orpc, queryClient, client } from "../utils/orpc";


type ORPC = typeof orpc


const testUsers = [
    { email: "admin@test.com", password: "password123", name: "admin" },
    { email: "alice@test.com", password: "password123", name: "Alice" },
    { email: "bob@test.com", password: "password123", name: "Bob" },
    { email: "charlie@test.com", password: "password123", name: "Charlie" },
];


// =====================================
export async function seedUsers(){
    const created = [];

    for (const user of testUsers) {
        try {
            await authClient.signUp.email({
                email: user.email,
                password: user.password,
                name: user.name,
            });
            created.push({ name: user.name, status: "created" });
        } catch (error: any) {
            const message = error?.error?.message || String(error);
            created.push({
                name: user.name,
                status: message.includes("already exists") ? "already exists" : "error",
                error: message,
            });
        }
    }

    return created;
}


export async function seedConversationsAndMessages() {
    await authClient.signIn.email({
        email: "admin@test.com",
        password: "password123",
    });

    const users = await client.user.getAll();
    const byEmail = new Map(users.map((user) => [user.email, user.id]));

    const adminId = byEmail.get("admin@test.com");
    if (!adminId) throw new Error("Admin user not found");

    const targets = ["alice@test.com", "bob@test.com", "charlie@test.com"];
    const results = [];

    for (const email of targets) {
        const userId = byEmail.get(email);
        if (!userId) continue;

        const conversation = await client.conversation.create({ userIds: [userId] });

        await client.message.send({
        conversationId: conversation.id,
        text: `Hey ${email.split("@")[0]}, welcome!`,
        });

        await client.message.send({
        conversationId: conversation.id,
        text: `This is a seeded chat between admin and ${email.split("@")[0]}.`,
        });

        results.push({ email, conversationId: conversation.id });
    }

    return results;
}

export async function seedAll() {
    const users = await seedUsers();
    const conversations = await seedConversationsAndMessages();
    return { users, conversations };
}













