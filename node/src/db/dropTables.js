import { client } from "../../index.js";

export async function dropTables() {
  await client.query("BEGIN");
  await client.query(`
    DROP TABLE IF EXISTS public.Comments CASCADE;
  `);
  await client.query(`
    DROP TABLE IF EXISTS public.Movies CASCADE;
  `);
  await client.query(`
    DROP TABLE IF EXISTS public.Users CASCADE;
  `);
  await client.query("COMMIT");
  console.log("Dropped tables");
}
