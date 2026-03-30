# Frameworks

- oRPC
- TypeScript
- TurboRepo
- Zod
- Prisma
- Postgres
- React Native
- Tailwind CSS
- pNPM
- Better-Auth
- TanStack (Query, Router, Start)
- Expo (Router, pour mobile)
- Uniwind (pour mobile)

# Direction

App Isomorphique compatible Web et Mobile qui fait attention au SEO ET à l'expérience utilisateur tout en gardant le code le plus lisible possible pour un humain.

# Utilisation

## Monorepo

## OpenAPI

## Prisma

- Create ,CreateMany
- findUnique, findMany
- update, updateMany
- upsert
- delete, deleteMany

## Zod

## React

- State : recharge le DOM sur changement de la data stockée (peut DOS si le fait de recharger le DOM retrigger le useState)
- Effect : recharge une fonction si ses dépendences changent
- DOM : représentation structurée de la page
- DOM Mutation : changement sur la page

Avantages :

- Déclaratif
- Cross-Platform
- Encapsulation
- Testable (car encapsulé nottament)
- Réutilisable, composable
- Isomorphique

## Tailwind

## Routing

File-based routing avec layout et convention de nommage
Web :

- $ pour les paramètres dans l'url

Mobile :

- View
- text
- Pressable
- ScrollView
- FlatList
- TextInput
- Image

- (...) pour ne pas afficher dans le nom de la route. Permet de définir le layout (Stack, Tabs, Modals, ...)


# Bonnes pratiques

## Implémenter des loader et useSuspenseQuery

### exemple :

```typescript
export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient }}) => {
    // Ensure TanStack Query cache contains the required data
    await queryClient.ensureQueryData(orpc.tasks.list.queryOptions())
  },
  component: () => {
    // Won't trigger a refetch, as the data is in the cache
    const tasks = useSuspenseQuery(orpc.tasks.list.queryOptions())
    return (
      <ul>
        {tasks.data?.map(task => <li>{task.title}</li>)}
      </ul>
    )
  },
})
```

Si la data à load n'est pas critique pour le SEO : queryClient.prefetchQuery(orpc.tasks.list).
Commence le data fetching mais ne bloque pas le rendu de la page.

## Path params

### exemple :

```typescript
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    return fetchPost(params.postId)
  },
  component: () => {
    const { postId } = Route.useParams()
    return <div>Post {postId}</div>
  },
})
```

## Metadata

### exemple :

```typescript
export const Route = createFileRoute('/hello-world')({
  head: () => ({
    meta: [
      { title: 'hello world'}
      { name: 'keywords', content: 'hello, world' },
      { name: 'author', content: 'Quentin LURKIN' }
    ],
  }),
  component: () => <p>Hello world</p>,
})
```

## Context

Pour déclarer un état global. Grâce à ça que Tanstack Query fonctionne.

## Tailwind Components

Dans /apps/native/components

## invalidateQueries()

Pour actualiser le cache sur onSuccess

## Update Optimiste

Pour afficher directement le changement dans l'UI avant le onSucces

### exemple

```typescript
const addTask = useMutation(orpc.tasks.create.mutationOptions({
  onMutate: async () {
    queryClient.setQueryData(orpc.tasks.list.queryKey(), (old) => [
      ...(old ?? []),
      { title: text },
    ])
  },
  onSettled: () => {
    queryClient.invalidateQueries()
  }
}))
```

## Suspense

Permet d'afficher un fallback jusqu'à ce que les composants enfants aient finit de charger

### exemple

```typescript
function Users() {
  const users = useSuspenseQuery(
    orpc.users.list.queryOptions()
  );
  return (
    <ul>
      {users.data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
function App() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <Users />
    </Suspense>
  );
}
```

## Faux changements de page

Utiliser history.pushState(state, title, url) pour garder une "savegarde" si le navigateur reload la page.

## Server-Side Rendering (SSR)

Genère full HTML coté server pour améliorer le SEO et le chargement initial

## Isomorphique

MPA pour les SE et SPA pour les utilisateurs, le "meilleur des deux mondes". Possible grâce que fait que le monorepo peut run autant sur le serveur que le client.

## Code le plus court possible (Hooks)

- Hooks commun à Web et Mobile (use... par convention) (dans packages/), pas de duplication de code inutile, ne fait pas plusieurs des requêtes inutiles par exemple -> avoir presque que du "html" dans les fichiers Web et mobile

### exemple :

- Utilisation

```typescript
function TaskList() {
  const tasks = useTasks();
  return (
    <>
      <ul>
        {tasks.data?.map((task) => (
          <li>{task.title}</li>
        ))}
      </ul>
      <input
        value={tasks.newTask}
        onChange={(e) => data.setNewTask(e.target.value)}
      />
      <button onClick={tasks.add}>Add task</button>
    </>
  );
}
```

- Définition :

```typescript
function useTasks(orpc) {
  const [newTask, setNewTask] = useState("");
  const queryClient = useQueryClient();
  const tasks = useQuery(orpc.tasks.list.queryOptions());
  const add = useMutation(
    orpc.tasks.create.mutationOptions({
      onMutate: async () => {
        // Update the query cache optimistically
      },
      // Better: do it automatically!
      onSettled: () => {
        queryClient.invalidateQueries();
      },
    }),
  );
  return {
    newTask,
    setNewTasks,
    data: tasks.data,
    add: () => {
      add.mutate({ input: newTask });
      setNewTask("");
    },
  };
}
```

### Exemple useORPC (très important)

```typescript
import { createContext, useContext, type ReactNode } from "react";
import type { AppRouterClient } from "@musicAll/api/routers/index";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Type helper — extracts the exact TanStack Query utils type for our router.
// This function is exported for type inference only and is never called at runtime.
export function _createORPCUtils(client: AppRouterClient) {
  return createTanstackQueryUtils(client);
}
export type ORPCUtils = ReturnType<typeof _createORPCUtils>;

interface ORPCContextValue {
  client: AppRouterClient;
  orpc: ORPCUtils;
}

const ORPCContext = createContext<ORPCContextValue | null>(null);

export function ORPCProvider({
  client,
  orpc,
  children,
}: ORPCContextValue & { children: ReactNode }) {
  return (
    <ORPCContext.Provider value={{ client, orpc }}>
      {children}
    </ORPCContext.Provider>
  );
}

export function useORPC(): ORPCContextValue {
  const ctx = useContext(ORPCContext);
  if (!ctx) throw new Error("useORPC must be used within ORPCProvider");
  return ctx;
}

/* Exemple d'utilisation dans une page ou un composant :

import { useQuery } from "@tanstack/react-query";
import { useORPC } from "@musicAll/hooks";

function RoomScreen({ code }: { code: string }) {
  const { orpc } = useORPC();

  // orpc génère automatiquement la queryKey + queryFn
  const { data: room } = useQuery(
    orpc.room.getByCode.queryOptions({ input: { code } })
  );

  return <Text>{room?.name}</Text>;
}
*/
```

- Attention aux normal, dev ou peer dependencies (certaines librairies comme React ou Tanstack-query doivent être dans peer pour éviter d'avoir plusieurs version en parralèle)

exemple :

```json
// packages/hooks/package.json
{
  "name": "hooks",
  "main": "src/index.ts",
  "packageManager": "pnpm@10.28.0",
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "@tanstack/react-query": "*"
  },
  "devDependencies": {
    "@types/react": "^19.2.14"
  }
}
```

```json
// Pour forcer d'avoir qu'une seule version des librairies
"pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "react-native": "0.81.5",
      "@tanstack/react-query": "5.80.6"
    }
  }
```

# Grille de correction (\* pour ce qui est vraiment mandataire pour réussir l'exam)

## Assessment (Web)

### User Experience /2

- Appearance
- Mobile-first, responsive design\*
- Reloading keeps the state as much as possible
- Interactive\*

### Project scope and complexity /4

### Data fetching /4

- Race conditions
- Loading state and errors boundaries
- Caching, deduping, and invalidation
- Optimistic updates when appropriate

### Code quality and DX /4

- Client/server communications are typesafe\*
- Queries to the DB should be typesafe
- Codebase is type safe
- Use consistent conventions
- Good use of the Component architecture
- Good use of React hooks

### Deployment /2

- The database can run via Docker or equivalent
- Web server runs via Docker or equivalent\*
- Basic orchestration (e.g. via docker-compose)
- Serves a production bundle

### Security /2

- Authentication
- Client/Server communications are validated\*
- Authenticated routes and API are protected\*
- Secrets are not exposed

### SEO /2

- Crucial pages can be rendered on the server\*
- Crucial data present on first render
- Less crucial data is deferred
- Waterfalls are avoided

## Assessment (Mobile)

### User Experience /2

- Appearance
- Mobile-first, responsive design\*
- Interactive\*

### Project scope and complexity /4

### Data fetching /4

- Race conditions
- Loading state and errors boundaries
- Caching, deduping, and invalidation
- Optimistic updates when appropriate

### Code quality and DX /4

- Client/server communications are typesafe\*
- Codebase is type safe
- Use consistent conventions
- Good use of the Component architecture
- Good use of React hooks

### Security /2

- Authentication
- Client/Server communications are validated\*
- Authenticated routes and API are protected\*
- Secrets are not exposed

### Mobile feature /4

# Questions examen

## oRPC

Wrapper pour API http pour pouvoir utiliser des appels de fonctions entre le client et le serveur. Typesafe

## REACT

Librairie JS pour décrire de manière déclarative la composition du DOM.
Avantages :

- Déclaratif
- Cross-Platform
- Encapsulation
- Testable (car encapsulé nottament)
- Réutilisable, composable
- Isomorphique

## Tanstack Query

Simplifier les data fetching via un cache central pour éviter de fetch inutilement la même ressource plusieurs fois et pouvoir facilement invalider une ressource pour tous les components qui en ont besoin.

## Router

Différence entre mobile et web : le mobile possède déjà toute l'app, le web la demande au fur et à mesure du surf.
De plus le web doit faire attention au SEO.

## Isomorphe

Peut tourner autant sur le client que le server au besoin.

## Tanstack Start

Pour les apps isomorphes; pour que le routing et les queries marchent aussi coté server si besoin.

1. Client -> server
2. Le server build l'app en local et attend les données cruciales. Il les envoye ensuite au client puis stream les données suivantes. (MPA)
3. Les prefetch arrivent et l'app se transforme en SPA

# Tips Exam

## Attention aux cookies (secure) et au hashage+salage des mots de passe.
