import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as auth from './schema/auth';
import * as workspace from './schema/workspace';

// const queryClient = postgres(process.env.DATABASE_URL || "");
// export const db = drizzle({ client: queryClient });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/deskdrop';

const client = postgres(connectionString);

export const db = drizzle(client, {
  schema: {
    ...auth,
    ...workspace
  }
});

export { auth, workspace };