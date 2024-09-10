import { DatabaseError } from "pg";
import { log } from "~/lib/logging/logger.winston";
import { ExactlyOneKey } from "~/types/util/util.types";

type ExtractTransactionResultErrorType<T> =
  T extends TransactionResult<infer E> ? E : never;

/**
 * To Describe the result of a database transaction
 */
export abstract class TransactionResult<
  E extends string,
  T extends {} = {},
  EC extends Partial<Record<`is${Capitalize<Exclude<E, "">>}`, true>> = Partial<
    Record<`is${Capitalize<Exclude<E, "">>}`, true>
  >,
> {
  public success: boolean;
  public message?: string;
  public error?: EC;
  public meta?: T;

  constructor(
    success: boolean,
    { message, meta }: Partial<{ message: string; meta: T }> = {},
  ) {
    this.success = success;
    this.message = message;
    this.meta = meta;
  }
}

export abstract class TransactionErrorResult<
  T extends TransactionResult<string>,
  E extends
    ExtractTransactionResultErrorType<T> = ExtractTransactionResultErrorType<T>,
> extends TransactionResult<E> {
  public error: ExactlyOneKey<
    Partial<Record<`is${Capitalize<Exclude<E, "">>}`, true>>
  >;

  constructor(
    cause: `is${Capitalize<Exclude<E, "">>}`,
    { message, meta }: Partial<{ message: string; meta: T }> = {},
  ) {
    super(false, { message, meta });

    this.error = {
      [cause]: true,
    } as ExactlyOneKey<
      Partial<Record<`is${Capitalize<Exclude<E, "">>}`, true>>
    >;
  }

  /**
   *
   * @param e a DatabaseError that has occured
   * @returns true if this database error
   */
  static isErrorCause(e: DatabaseError): boolean {
    log("general").error(
      `isErrorCause was not over-written in TransactionErrorResult child '${this.constructor.name}' in file '${__filename}'`,
    );
    return false;
  }
}
