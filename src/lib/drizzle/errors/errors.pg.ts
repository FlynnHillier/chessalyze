/**
 * Maps between pg error codes and there causes
 *
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export enum DatabaseErrorCode {
  ForeignKeyViolation = "23503",
  UniqueViolation = "23505",
}
