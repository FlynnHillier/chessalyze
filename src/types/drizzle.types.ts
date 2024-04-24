import {
  ExtractTablesWithRelations,
  DBQueryConfig,
  BuildQueryResult,
} from "drizzle-orm";
import * as schema from "@lib/drizzle/schema";

type TSchema = ExtractTablesWithRelations<typeof schema>;
export type QueryConfig<TableName extends keyof TSchema> = DBQueryConfig<
  "one" | "many",
  boolean,
  TSchema,
  TSchema[TableName]
>;

/**
 * Infer the result type of a given query for the table specified.
 */
export type InferQueryResultType<
  TableName extends keyof TSchema,
  QBConfig extends QueryConfig<TableName> | {} = {},
> = BuildQueryResult<TSchema, TSchema[TableName], QBConfig>;
