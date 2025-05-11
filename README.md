# YONCOM-ORDER 
Mono Repository project for integrated POS System for non-registered Sellers

## Start Project
0. Login to Wrangler
    ```bash
    npx wrangler login
    ```
1. Create D1 DB
    ```bash
    npx wrangler d1 create DB_NAME
    ```
2. Copy and Edit .env file
    ```bash
    cp .env.example .env
    ```
3. Copy and Edit wrangler.jsonc file
    ```bash
    cp apps/api/wrangler.example.jsonc apps/api/wrangler.jsonc
4. Install Dependencies
    ```bash
    pnpm install
    ```
5. Generate & Migration
    1. on Local DB
        ```bash
        pnpm db:generate
        pnpm db:apply:local
        ```
    2. on Cloud DB
        ```bash
        pnpm db:generate
        pnpm db:apply
        ```
6. Run
   1. with Cloud DB
        ```bash
        pnpm dev
        ```
   2. with Local DB
       ```bash
       pnpm dev:local
       ```
