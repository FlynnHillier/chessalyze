import { AuthPermissions } from "~/constants/auth";

/**
 * Type that mirrors allowed values declared on AuthPermissions enum
 */
export type AuthPermissionsType =
  (typeof AuthPermissions)[keyof typeof AuthPermissions];
