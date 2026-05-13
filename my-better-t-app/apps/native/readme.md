




## Mobile


### Native structure

```bash
apps/native/
├── app/                    # Expo Router routes/screens
├── assets/                 # images/icons/splash assets
├── components/             # reusable UI components
├── contexts/               # React contexts like theme
├── lib/                    # auth/client helpers
├── utils/                  # ORPC client, query client, helpers
├── global.css              # shared styling entry
├── metro.config.js         # Metro + Uniwind config
├── app.json                # Expo app config
├── package.json            # native dependencies/scripts
├── tsconfig.json           # TS config + path aliases
├── polyfills.js            # web/runtime polyfills
└── expo-env.d.ts           # Expo types
```




### App folder structure

```bash
app/
├── _layout.tsx             # global shell/providers for the whole app
├── modal.tsx               # modal screen
├── +not-found.tsx          # 404-style fallback
└── (drawer)/
    ├── _layout.tsx         # drawer navigator shell
    ├── index.tsx           # home screen in drawer
    ├── ai.tsx              # AI screen
    ├── todos.tsx           # todos screen
    └── (tabs)/
        ├── _layout.tsx     # tab navigator shell
        ├── index.tsx       # tab home
        └── two.tsx         # another tab
```


### Init & Setup

#### Import hooks to mobile as package
1. add `"@my-better-t-app/hooks": "workspace:*",` inside package.json
2. pnpm install
3. Restart TS server (Command palette)

