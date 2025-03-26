# Auth API with Cloudflare Workers

## Start Project
1. Add env file
    ```bash
    cp .env.example .env
    ```

2. Install Dependencies
    ```bash
    bun install
    ```
3. Create D1 DB
    ```bash
    wrangler d1 create DB_NAME
    ```
4. Add DB info on wrangler.jsonc
5. Generate SQL
    ```bash
    bun db:generate
    ```
6. Migrate SQL
    ```bash
    bun db:migrate
    ```


## Commands
### Dev Run
```bash
bun dev
```

### Deploy
```bash
bun deploy
```

### SQL Generate
```bash
bun db:generate
```

### SQL Migration
```bash
bun db:migrate
```

### SQL Push (Generate + Migration)
```bash
bun db:push
```

### SQL Studio
```bash
bun db:studio
```