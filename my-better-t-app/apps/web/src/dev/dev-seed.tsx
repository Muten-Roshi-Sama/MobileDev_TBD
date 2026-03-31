// dev-seed.tsx
import { authClient } from "@/lib/auth-client"; // DEV ONLY
import { orpc, queryClient } from "../utils/orpc";


type ORPC = typeof orpc

export async function seedUsers(){
    const created = [];
    const testUsers = [
        { email: "admin@test.com", password: "password123", name: "admin" },
        { email: "alice@test.com", password: "password123", name: "Alice" },
        { email: "bob@test.com", password: "password123", name: "Bob" },
        { email: "charlie@test.com", password: "password123", name: "Charlie" },
    ];

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






