# write code apply in all files in ./drizzle/
# npx wrangler d1 execute yoncom-order-db  --local --file=

for file in ./drizzle/*.sql; do
    npx wrangler d1 execute yoncom-order-db  --local --file=$file
done
