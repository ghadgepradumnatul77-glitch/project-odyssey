
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Department
 * 
 */
export type Department = $Result.DefaultSelection<Prisma.$DepartmentPayload>
/**
 * Model Jurisdiction
 * 
 */
export type Jurisdiction = $Result.DefaultSelection<Prisma.$JurisdictionPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Asset
 * 
 */
export type Asset = $Result.DefaultSelection<Prisma.$AssetPayload>
/**
 * Model Case
 * 
 */
export type Case = $Result.DefaultSelection<Prisma.$CasePayload>
/**
 * Model Inspection
 * 
 */
export type Inspection = $Result.DefaultSelection<Prisma.$InspectionPayload>
/**
 * Model RiskAssessment
 * 
 */
export type RiskAssessment = $Result.DefaultSelection<Prisma.$RiskAssessmentPayload>
/**
 * Model OperationalResponsePlan
 * 
 */
export type OperationalResponsePlan = $Result.DefaultSelection<Prisma.$OperationalResponsePlanPayload>
/**
 * Model ApprovalAuthority
 * 
 */
export type ApprovalAuthority = $Result.DefaultSelection<Prisma.$ApprovalAuthorityPayload>
/**
 * Model OrpDecision
 * 
 */
export type OrpDecision = $Result.DefaultSelection<Prisma.$OrpDecisionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const SystemRole: {
  OFFICER: 'OFFICER',
  POLICY_ADMIN: 'POLICY_ADMIN',
  AUDITOR: 'AUDITOR',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
};

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole]


export const AssetType: {
  BRIDGE: 'BRIDGE',
  ROAD: 'ROAD',
  FLYOVER: 'FLYOVER'
};

export type AssetType = (typeof AssetType)[keyof typeof AssetType]


export const CaseStatus: {
  NEW: 'NEW',
  INSPECTION_REQUIRED: 'INSPECTION_REQUIRED',
  INSPECTION_IN_PROGRESS: 'INSPECTION_IN_PROGRESS',
  UNDER_ANALYSIS: 'UNDER_ANALYSIS',
  ORP_READY: 'ORP_READY',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  EXECUTION: 'EXECUTION',
  VERIFICATION: 'VERIFICATION',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus]


export const RiskLevel: {
  VERY_LOW: 'VERY_LOW',
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
  CRITICAL: 'CRITICAL'
};

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel]


export const PriorityLevel: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
  CRITICAL: 'CRITICAL'
};

export type PriorityLevel = (typeof PriorityLevel)[keyof typeof PriorityLevel]


export const OrpDecisionType: {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MODIFICATION_REQUESTED: 'MODIFICATION_REQUESTED',
  REINSPECTION_REQUESTED: 'REINSPECTION_REQUESTED',
  ESCALATED: 'ESCALATED'
};

export type OrpDecisionType = (typeof OrpDecisionType)[keyof typeof OrpDecisionType]

}

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

export type SystemRole = $Enums.SystemRole

export const SystemRole: typeof $Enums.SystemRole

export type AssetType = $Enums.AssetType

export const AssetType: typeof $Enums.AssetType

export type CaseStatus = $Enums.CaseStatus

export const CaseStatus: typeof $Enums.CaseStatus

export type RiskLevel = $Enums.RiskLevel

export const RiskLevel: typeof $Enums.RiskLevel

export type PriorityLevel = $Enums.PriorityLevel

export const PriorityLevel: typeof $Enums.PriorityLevel

export type OrpDecisionType = $Enums.OrpDecisionType

export const OrpDecisionType: typeof $Enums.OrpDecisionType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Departments
 * const departments = await prisma.department.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Departments
   * const departments = await prisma.department.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.department`: Exposes CRUD operations for the **Department** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Departments
    * const departments = await prisma.department.findMany()
    * ```
    */
  get department(): Prisma.DepartmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.jurisdiction`: Exposes CRUD operations for the **Jurisdiction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Jurisdictions
    * const jurisdictions = await prisma.jurisdiction.findMany()
    * ```
    */
  get jurisdiction(): Prisma.JurisdictionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.asset`: Exposes CRUD operations for the **Asset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assets
    * const assets = await prisma.asset.findMany()
    * ```
    */
  get asset(): Prisma.AssetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.case`: Exposes CRUD operations for the **Case** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cases
    * const cases = await prisma.case.findMany()
    * ```
    */
  get case(): Prisma.CaseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inspection`: Exposes CRUD operations for the **Inspection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inspections
    * const inspections = await prisma.inspection.findMany()
    * ```
    */
  get inspection(): Prisma.InspectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.riskAssessment`: Exposes CRUD operations for the **RiskAssessment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RiskAssessments
    * const riskAssessments = await prisma.riskAssessment.findMany()
    * ```
    */
  get riskAssessment(): Prisma.RiskAssessmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.operationalResponsePlan`: Exposes CRUD operations for the **OperationalResponsePlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OperationalResponsePlans
    * const operationalResponsePlans = await prisma.operationalResponsePlan.findMany()
    * ```
    */
  get operationalResponsePlan(): Prisma.OperationalResponsePlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.approvalAuthority`: Exposes CRUD operations for the **ApprovalAuthority** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApprovalAuthorities
    * const approvalAuthorities = await prisma.approvalAuthority.findMany()
    * ```
    */
  get approvalAuthority(): Prisma.ApprovalAuthorityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orpDecision`: Exposes CRUD operations for the **OrpDecision** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrpDecisions
    * const orpDecisions = await prisma.orpDecision.findMany()
    * ```
    */
  get orpDecision(): Prisma.OrpDecisionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Department: 'Department',
    Jurisdiction: 'Jurisdiction',
    User: 'User',
    Asset: 'Asset',
    Case: 'Case',
    Inspection: 'Inspection',
    RiskAssessment: 'RiskAssessment',
    OperationalResponsePlan: 'OperationalResponsePlan',
    ApprovalAuthority: 'ApprovalAuthority',
    OrpDecision: 'OrpDecision'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "department" | "jurisdiction" | "user" | "asset" | "case" | "inspection" | "riskAssessment" | "operationalResponsePlan" | "approvalAuthority" | "orpDecision"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Department: {
        payload: Prisma.$DepartmentPayload<ExtArgs>
        fields: Prisma.DepartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DepartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findFirst: {
            args: Prisma.DepartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findMany: {
            args: Prisma.DepartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          create: {
            args: Prisma.DepartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          createMany: {
            args: Prisma.DepartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DepartmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          delete: {
            args: Prisma.DepartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          update: {
            args: Prisma.DepartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          deleteMany: {
            args: Prisma.DepartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DepartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DepartmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          upsert: {
            args: Prisma.DepartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          aggregate: {
            args: Prisma.DepartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDepartment>
          }
          groupBy: {
            args: Prisma.DepartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DepartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DepartmentCountArgs<ExtArgs>
            result: $Utils.Optional<DepartmentCountAggregateOutputType> | number
          }
        }
      }
      Jurisdiction: {
        payload: Prisma.$JurisdictionPayload<ExtArgs>
        fields: Prisma.JurisdictionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JurisdictionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JurisdictionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          findFirst: {
            args: Prisma.JurisdictionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JurisdictionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          findMany: {
            args: Prisma.JurisdictionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>[]
          }
          create: {
            args: Prisma.JurisdictionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          createMany: {
            args: Prisma.JurisdictionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JurisdictionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>[]
          }
          delete: {
            args: Prisma.JurisdictionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          update: {
            args: Prisma.JurisdictionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          deleteMany: {
            args: Prisma.JurisdictionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JurisdictionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JurisdictionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>[]
          }
          upsert: {
            args: Prisma.JurisdictionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JurisdictionPayload>
          }
          aggregate: {
            args: Prisma.JurisdictionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJurisdiction>
          }
          groupBy: {
            args: Prisma.JurisdictionGroupByArgs<ExtArgs>
            result: $Utils.Optional<JurisdictionGroupByOutputType>[]
          }
          count: {
            args: Prisma.JurisdictionCountArgs<ExtArgs>
            result: $Utils.Optional<JurisdictionCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Asset: {
        payload: Prisma.$AssetPayload<ExtArgs>
        fields: Prisma.AssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findFirst: {
            args: Prisma.AssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findMany: {
            args: Prisma.AssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          create: {
            args: Prisma.AssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          createMany: {
            args: Prisma.AssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          delete: {
            args: Prisma.AssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          update: {
            args: Prisma.AssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          deleteMany: {
            args: Prisma.AssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          upsert: {
            args: Prisma.AssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          aggregate: {
            args: Prisma.AssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsset>
          }
          groupBy: {
            args: Prisma.AssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetCountArgs<ExtArgs>
            result: $Utils.Optional<AssetCountAggregateOutputType> | number
          }
        }
      }
      Case: {
        payload: Prisma.$CasePayload<ExtArgs>
        fields: Prisma.CaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          findFirst: {
            args: Prisma.CaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          findMany: {
            args: Prisma.CaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>[]
          }
          create: {
            args: Prisma.CaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          createMany: {
            args: Prisma.CaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>[]
          }
          delete: {
            args: Prisma.CaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          update: {
            args: Prisma.CaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          deleteMany: {
            args: Prisma.CaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CaseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>[]
          }
          upsert: {
            args: Prisma.CaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CasePayload>
          }
          aggregate: {
            args: Prisma.CaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCase>
          }
          groupBy: {
            args: Prisma.CaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CaseCountArgs<ExtArgs>
            result: $Utils.Optional<CaseCountAggregateOutputType> | number
          }
        }
      }
      Inspection: {
        payload: Prisma.$InspectionPayload<ExtArgs>
        fields: Prisma.InspectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InspectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InspectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          findFirst: {
            args: Prisma.InspectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InspectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          findMany: {
            args: Prisma.InspectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>[]
          }
          create: {
            args: Prisma.InspectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          createMany: {
            args: Prisma.InspectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InspectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>[]
          }
          delete: {
            args: Prisma.InspectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          update: {
            args: Prisma.InspectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          deleteMany: {
            args: Prisma.InspectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InspectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InspectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>[]
          }
          upsert: {
            args: Prisma.InspectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InspectionPayload>
          }
          aggregate: {
            args: Prisma.InspectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInspection>
          }
          groupBy: {
            args: Prisma.InspectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InspectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.InspectionCountArgs<ExtArgs>
            result: $Utils.Optional<InspectionCountAggregateOutputType> | number
          }
        }
      }
      RiskAssessment: {
        payload: Prisma.$RiskAssessmentPayload<ExtArgs>
        fields: Prisma.RiskAssessmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RiskAssessmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RiskAssessmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          findFirst: {
            args: Prisma.RiskAssessmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RiskAssessmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          findMany: {
            args: Prisma.RiskAssessmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>[]
          }
          create: {
            args: Prisma.RiskAssessmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          createMany: {
            args: Prisma.RiskAssessmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RiskAssessmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>[]
          }
          delete: {
            args: Prisma.RiskAssessmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          update: {
            args: Prisma.RiskAssessmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          deleteMany: {
            args: Prisma.RiskAssessmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RiskAssessmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RiskAssessmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>[]
          }
          upsert: {
            args: Prisma.RiskAssessmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskAssessmentPayload>
          }
          aggregate: {
            args: Prisma.RiskAssessmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRiskAssessment>
          }
          groupBy: {
            args: Prisma.RiskAssessmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<RiskAssessmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.RiskAssessmentCountArgs<ExtArgs>
            result: $Utils.Optional<RiskAssessmentCountAggregateOutputType> | number
          }
        }
      }
      OperationalResponsePlan: {
        payload: Prisma.$OperationalResponsePlanPayload<ExtArgs>
        fields: Prisma.OperationalResponsePlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OperationalResponsePlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OperationalResponsePlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          findFirst: {
            args: Prisma.OperationalResponsePlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OperationalResponsePlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          findMany: {
            args: Prisma.OperationalResponsePlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>[]
          }
          create: {
            args: Prisma.OperationalResponsePlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          createMany: {
            args: Prisma.OperationalResponsePlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OperationalResponsePlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>[]
          }
          delete: {
            args: Prisma.OperationalResponsePlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          update: {
            args: Prisma.OperationalResponsePlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          deleteMany: {
            args: Prisma.OperationalResponsePlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OperationalResponsePlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OperationalResponsePlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>[]
          }
          upsert: {
            args: Prisma.OperationalResponsePlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OperationalResponsePlanPayload>
          }
          aggregate: {
            args: Prisma.OperationalResponsePlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOperationalResponsePlan>
          }
          groupBy: {
            args: Prisma.OperationalResponsePlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<OperationalResponsePlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.OperationalResponsePlanCountArgs<ExtArgs>
            result: $Utils.Optional<OperationalResponsePlanCountAggregateOutputType> | number
          }
        }
      }
      ApprovalAuthority: {
        payload: Prisma.$ApprovalAuthorityPayload<ExtArgs>
        fields: Prisma.ApprovalAuthorityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApprovalAuthorityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApprovalAuthorityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          findFirst: {
            args: Prisma.ApprovalAuthorityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApprovalAuthorityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          findMany: {
            args: Prisma.ApprovalAuthorityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>[]
          }
          create: {
            args: Prisma.ApprovalAuthorityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          createMany: {
            args: Prisma.ApprovalAuthorityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApprovalAuthorityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>[]
          }
          delete: {
            args: Prisma.ApprovalAuthorityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          update: {
            args: Prisma.ApprovalAuthorityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          deleteMany: {
            args: Prisma.ApprovalAuthorityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApprovalAuthorityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApprovalAuthorityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>[]
          }
          upsert: {
            args: Prisma.ApprovalAuthorityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApprovalAuthorityPayload>
          }
          aggregate: {
            args: Prisma.ApprovalAuthorityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApprovalAuthority>
          }
          groupBy: {
            args: Prisma.ApprovalAuthorityGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApprovalAuthorityGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApprovalAuthorityCountArgs<ExtArgs>
            result: $Utils.Optional<ApprovalAuthorityCountAggregateOutputType> | number
          }
        }
      }
      OrpDecision: {
        payload: Prisma.$OrpDecisionPayload<ExtArgs>
        fields: Prisma.OrpDecisionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrpDecisionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrpDecisionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          findFirst: {
            args: Prisma.OrpDecisionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrpDecisionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          findMany: {
            args: Prisma.OrpDecisionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>[]
          }
          create: {
            args: Prisma.OrpDecisionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          createMany: {
            args: Prisma.OrpDecisionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrpDecisionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>[]
          }
          delete: {
            args: Prisma.OrpDecisionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          update: {
            args: Prisma.OrpDecisionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          deleteMany: {
            args: Prisma.OrpDecisionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrpDecisionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrpDecisionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>[]
          }
          upsert: {
            args: Prisma.OrpDecisionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrpDecisionPayload>
          }
          aggregate: {
            args: Prisma.OrpDecisionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrpDecision>
          }
          groupBy: {
            args: Prisma.OrpDecisionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrpDecisionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrpDecisionCountArgs<ExtArgs>
            result: $Utils.Optional<OrpDecisionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    department?: DepartmentOmit
    jurisdiction?: JurisdictionOmit
    user?: UserOmit
    asset?: AssetOmit
    case?: CaseOmit
    inspection?: InspectionOmit
    riskAssessment?: RiskAssessmentOmit
    operationalResponsePlan?: OperationalResponsePlanOmit
    approvalAuthority?: ApprovalAuthorityOmit
    orpDecision?: OrpDecisionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type DepartmentCountOutputType
   */

  export type DepartmentCountOutputType = {
    users: number
    assets: number
    jurisdictions: number
    approvalAuthorities: number
  }

  export type DepartmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | DepartmentCountOutputTypeCountUsersArgs
    assets?: boolean | DepartmentCountOutputTypeCountAssetsArgs
    jurisdictions?: boolean | DepartmentCountOutputTypeCountJurisdictionsArgs
    approvalAuthorities?: boolean | DepartmentCountOutputTypeCountApprovalAuthoritiesArgs
  }

  // Custom InputTypes
  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DepartmentCountOutputType
     */
    select?: DepartmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountJurisdictionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JurisdictionWhereInput
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountApprovalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApprovalAuthorityWhereInput
  }


  /**
   * Count Type JurisdictionCountOutputType
   */

  export type JurisdictionCountOutputType = {
    users: number
    assets: number
    approvalAuthorities: number
  }

  export type JurisdictionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | JurisdictionCountOutputTypeCountUsersArgs
    assets?: boolean | JurisdictionCountOutputTypeCountAssetsArgs
    approvalAuthorities?: boolean | JurisdictionCountOutputTypeCountApprovalAuthoritiesArgs
  }

  // Custom InputTypes
  /**
   * JurisdictionCountOutputType without action
   */
  export type JurisdictionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JurisdictionCountOutputType
     */
    select?: JurisdictionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * JurisdictionCountOutputType without action
   */
  export type JurisdictionCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * JurisdictionCountOutputType without action
   */
  export type JurisdictionCountOutputTypeCountAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
  }

  /**
   * JurisdictionCountOutputType without action
   */
  export type JurisdictionCountOutputTypeCountApprovalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApprovalAuthorityWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    inspections: number
    approvalAuthorities: number
    reviewedOrpDecisions: number
    forwardedOrpDecisions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inspections?: boolean | UserCountOutputTypeCountInspectionsArgs
    approvalAuthorities?: boolean | UserCountOutputTypeCountApprovalAuthoritiesArgs
    reviewedOrpDecisions?: boolean | UserCountOutputTypeCountReviewedOrpDecisionsArgs
    forwardedOrpDecisions?: boolean | UserCountOutputTypeCountForwardedOrpDecisionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountInspectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InspectionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountApprovalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApprovalAuthorityWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReviewedOrpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountForwardedOrpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
  }


  /**
   * Count Type AssetCountOutputType
   */

  export type AssetCountOutputType = {
    cases: number
  }

  export type AssetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cases?: boolean | AssetCountOutputTypeCountCasesArgs
  }

  // Custom InputTypes
  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCountOutputType
     */
    select?: AssetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountCasesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaseWhereInput
  }


  /**
   * Count Type CaseCountOutputType
   */

  export type CaseCountOutputType = {
    inspections: number
    riskAssessments: number
    operationalResponsePlans: number
    orpDecisions: number
  }

  export type CaseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inspections?: boolean | CaseCountOutputTypeCountInspectionsArgs
    riskAssessments?: boolean | CaseCountOutputTypeCountRiskAssessmentsArgs
    operationalResponsePlans?: boolean | CaseCountOutputTypeCountOperationalResponsePlansArgs
    orpDecisions?: boolean | CaseCountOutputTypeCountOrpDecisionsArgs
  }

  // Custom InputTypes
  /**
   * CaseCountOutputType without action
   */
  export type CaseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CaseCountOutputType
     */
    select?: CaseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CaseCountOutputType without action
   */
  export type CaseCountOutputTypeCountInspectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InspectionWhereInput
  }

  /**
   * CaseCountOutputType without action
   */
  export type CaseCountOutputTypeCountRiskAssessmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RiskAssessmentWhereInput
  }

  /**
   * CaseCountOutputType without action
   */
  export type CaseCountOutputTypeCountOperationalResponsePlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalResponsePlanWhereInput
  }

  /**
   * CaseCountOutputType without action
   */
  export type CaseCountOutputTypeCountOrpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
  }


  /**
   * Count Type InspectionCountOutputType
   */

  export type InspectionCountOutputType = {
    riskAssessments: number
  }

  export type InspectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    riskAssessments?: boolean | InspectionCountOutputTypeCountRiskAssessmentsArgs
  }

  // Custom InputTypes
  /**
   * InspectionCountOutputType without action
   */
  export type InspectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InspectionCountOutputType
     */
    select?: InspectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InspectionCountOutputType without action
   */
  export type InspectionCountOutputTypeCountRiskAssessmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RiskAssessmentWhereInput
  }


  /**
   * Count Type RiskAssessmentCountOutputType
   */

  export type RiskAssessmentCountOutputType = {
    operationalResponsePlans: number
  }

  export type RiskAssessmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    operationalResponsePlans?: boolean | RiskAssessmentCountOutputTypeCountOperationalResponsePlansArgs
  }

  // Custom InputTypes
  /**
   * RiskAssessmentCountOutputType without action
   */
  export type RiskAssessmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessmentCountOutputType
     */
    select?: RiskAssessmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RiskAssessmentCountOutputType without action
   */
  export type RiskAssessmentCountOutputTypeCountOperationalResponsePlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalResponsePlanWhereInput
  }


  /**
   * Count Type OperationalResponsePlanCountOutputType
   */

  export type OperationalResponsePlanCountOutputType = {
    decisions: number
  }

  export type OperationalResponsePlanCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | OperationalResponsePlanCountOutputTypeCountDecisionsArgs
  }

  // Custom InputTypes
  /**
   * OperationalResponsePlanCountOutputType without action
   */
  export type OperationalResponsePlanCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlanCountOutputType
     */
    select?: OperationalResponsePlanCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OperationalResponsePlanCountOutputType without action
   */
  export type OperationalResponsePlanCountOutputTypeCountDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
  }


  /**
   * Count Type ApprovalAuthorityCountOutputType
   */

  export type ApprovalAuthorityCountOutputType = {
    decisions: number
  }

  export type ApprovalAuthorityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | ApprovalAuthorityCountOutputTypeCountDecisionsArgs
  }

  // Custom InputTypes
  /**
   * ApprovalAuthorityCountOutputType without action
   */
  export type ApprovalAuthorityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthorityCountOutputType
     */
    select?: ApprovalAuthorityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApprovalAuthorityCountOutputType without action
   */
  export type ApprovalAuthorityCountOutputTypeCountDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Department
   */

  export type AggregateDepartment = {
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  export type DepartmentMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    createdAt: Date | null
  }

  export type DepartmentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    createdAt: Date | null
  }

  export type DepartmentCountAggregateOutputType = {
    id: number
    name: number
    code: number
    createdAt: number
    _all: number
  }


  export type DepartmentMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
  }

  export type DepartmentMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
  }

  export type DepartmentCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
    _all?: true
  }

  export type DepartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Department to aggregate.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Departments
    **/
    _count?: true | DepartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DepartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DepartmentMaxAggregateInputType
  }

  export type GetDepartmentAggregateType<T extends DepartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateDepartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDepartment[P]>
      : GetScalarType<T[P], AggregateDepartment[P]>
  }




  export type DepartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithAggregationInput | DepartmentOrderByWithAggregationInput[]
    by: DepartmentScalarFieldEnum[] | DepartmentScalarFieldEnum
    having?: DepartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DepartmentCountAggregateInputType | true
    _min?: DepartmentMinAggregateInputType
    _max?: DepartmentMaxAggregateInputType
  }

  export type DepartmentGroupByOutputType = {
    id: string
    name: string
    code: string
    createdAt: Date
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  type GetDepartmentGroupByPayload<T extends DepartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DepartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DepartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
            : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
        }
      >
    >


  export type DepartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
    users?: boolean | Department$usersArgs<ExtArgs>
    assets?: boolean | Department$assetsArgs<ExtArgs>
    jurisdictions?: boolean | Department$jurisdictionsArgs<ExtArgs>
    approvalAuthorities?: boolean | Department$approvalAuthoritiesArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["department"]>

  export type DepartmentSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
  }

  export type DepartmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "createdAt", ExtArgs["result"]["department"]>
  export type DepartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Department$usersArgs<ExtArgs>
    assets?: boolean | Department$assetsArgs<ExtArgs>
    jurisdictions?: boolean | Department$jurisdictionsArgs<ExtArgs>
    approvalAuthorities?: boolean | Department$approvalAuthoritiesArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DepartmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DepartmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DepartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Department"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      assets: Prisma.$AssetPayload<ExtArgs>[]
      jurisdictions: Prisma.$JurisdictionPayload<ExtArgs>[]
      approvalAuthorities: Prisma.$ApprovalAuthorityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      createdAt: Date
    }, ExtArgs["result"]["department"]>
    composites: {}
  }

  type DepartmentGetPayload<S extends boolean | null | undefined | DepartmentDefaultArgs> = $Result.GetResult<Prisma.$DepartmentPayload, S>

  type DepartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DepartmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DepartmentCountAggregateInputType | true
    }

  export interface DepartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Department'], meta: { name: 'Department' } }
    /**
     * Find zero or one Department that matches the filter.
     * @param {DepartmentFindUniqueArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DepartmentFindUniqueArgs>(args: SelectSubset<T, DepartmentFindUniqueArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Department that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DepartmentFindUniqueOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DepartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, DepartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DepartmentFindFirstArgs>(args?: SelectSubset<T, DepartmentFindFirstArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DepartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, DepartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Departments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Departments
     * const departments = await prisma.department.findMany()
     * 
     * // Get first 10 Departments
     * const departments = await prisma.department.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const departmentWithIdOnly = await prisma.department.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DepartmentFindManyArgs>(args?: SelectSubset<T, DepartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Department.
     * @param {DepartmentCreateArgs} args - Arguments to create a Department.
     * @example
     * // Create one Department
     * const Department = await prisma.department.create({
     *   data: {
     *     // ... data to create a Department
     *   }
     * })
     * 
     */
    create<T extends DepartmentCreateArgs>(args: SelectSubset<T, DepartmentCreateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Departments.
     * @param {DepartmentCreateManyArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DepartmentCreateManyArgs>(args?: SelectSubset<T, DepartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Departments and returns the data saved in the database.
     * @param {DepartmentCreateManyAndReturnArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DepartmentCreateManyAndReturnArgs>(args?: SelectSubset<T, DepartmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Department.
     * @param {DepartmentDeleteArgs} args - Arguments to delete one Department.
     * @example
     * // Delete one Department
     * const Department = await prisma.department.delete({
     *   where: {
     *     // ... filter to delete one Department
     *   }
     * })
     * 
     */
    delete<T extends DepartmentDeleteArgs>(args: SelectSubset<T, DepartmentDeleteArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Department.
     * @param {DepartmentUpdateArgs} args - Arguments to update one Department.
     * @example
     * // Update one Department
     * const department = await prisma.department.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DepartmentUpdateArgs>(args: SelectSubset<T, DepartmentUpdateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Departments.
     * @param {DepartmentDeleteManyArgs} args - Arguments to filter Departments to delete.
     * @example
     * // Delete a few Departments
     * const { count } = await prisma.department.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DepartmentDeleteManyArgs>(args?: SelectSubset<T, DepartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DepartmentUpdateManyArgs>(args: SelectSubset<T, DepartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments and returns the data updated in the database.
     * @param {DepartmentUpdateManyAndReturnArgs} args - Arguments to update many Departments.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Departments and only return the `id`
     * const departmentWithIdOnly = await prisma.department.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DepartmentUpdateManyAndReturnArgs>(args: SelectSubset<T, DepartmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Department.
     * @param {DepartmentUpsertArgs} args - Arguments to update or create a Department.
     * @example
     * // Update or create a Department
     * const department = await prisma.department.upsert({
     *   create: {
     *     // ... data to create a Department
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Department we want to update
     *   }
     * })
     */
    upsert<T extends DepartmentUpsertArgs>(args: SelectSubset<T, DepartmentUpsertArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentCountArgs} args - Arguments to filter Departments to count.
     * @example
     * // Count the number of Departments
     * const count = await prisma.department.count({
     *   where: {
     *     // ... the filter for the Departments we want to count
     *   }
     * })
    **/
    count<T extends DepartmentCountArgs>(
      args?: Subset<T, DepartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DepartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DepartmentAggregateArgs>(args: Subset<T, DepartmentAggregateArgs>): Prisma.PrismaPromise<GetDepartmentAggregateType<T>>

    /**
     * Group by Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DepartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DepartmentGroupByArgs['orderBy'] }
        : { orderBy?: DepartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DepartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDepartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Department model
   */
  readonly fields: DepartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Department.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DepartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Department$usersArgs<ExtArgs> = {}>(args?: Subset<T, Department$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    assets<T extends Department$assetsArgs<ExtArgs> = {}>(args?: Subset<T, Department$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    jurisdictions<T extends Department$jurisdictionsArgs<ExtArgs> = {}>(args?: Subset<T, Department$jurisdictionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    approvalAuthorities<T extends Department$approvalAuthoritiesArgs<ExtArgs> = {}>(args?: Subset<T, Department$approvalAuthoritiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Department model
   */
  interface DepartmentFieldRefs {
    readonly id: FieldRef<"Department", 'String'>
    readonly name: FieldRef<"Department", 'String'>
    readonly code: FieldRef<"Department", 'String'>
    readonly createdAt: FieldRef<"Department", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Department findUnique
   */
  export type DepartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findUniqueOrThrow
   */
  export type DepartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findFirst
   */
  export type DepartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findFirstOrThrow
   */
  export type DepartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findMany
   */
  export type DepartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Departments to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department create
   */
  export type DepartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Department.
     */
    data: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
  }

  /**
   * Department createMany
   */
  export type DepartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department createManyAndReturn
   */
  export type DepartmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department update
   */
  export type DepartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Department.
     */
    data: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    /**
     * Choose, which Department to update.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department updateMany
   */
  export type DepartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to update.
     */
    limit?: number
  }

  /**
   * Department updateManyAndReturn
   */
  export type DepartmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to update.
     */
    limit?: number
  }

  /**
   * Department upsert
   */
  export type DepartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Department to update in case it exists.
     */
    where: DepartmentWhereUniqueInput
    /**
     * In case the Department found by the `where` argument doesn't exist, create a new Department with this data.
     */
    create: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    /**
     * In case the Department was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
  }

  /**
   * Department delete
   */
  export type DepartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter which Department to delete.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department deleteMany
   */
  export type DepartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Departments to delete
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to delete.
     */
    limit?: number
  }

  /**
   * Department.users
   */
  export type Department$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Department.assets
   */
  export type Department$assetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    cursor?: AssetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Department.jurisdictions
   */
  export type Department$jurisdictionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    where?: JurisdictionWhereInput
    orderBy?: JurisdictionOrderByWithRelationInput | JurisdictionOrderByWithRelationInput[]
    cursor?: JurisdictionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: JurisdictionScalarFieldEnum | JurisdictionScalarFieldEnum[]
  }

  /**
   * Department.approvalAuthorities
   */
  export type Department$approvalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    where?: ApprovalAuthorityWhereInput
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    cursor?: ApprovalAuthorityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * Department without action
   */
  export type DepartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
  }


  /**
   * Model Jurisdiction
   */

  export type AggregateJurisdiction = {
    _count: JurisdictionCountAggregateOutputType | null
    _min: JurisdictionMinAggregateOutputType | null
    _max: JurisdictionMaxAggregateOutputType | null
  }

  export type JurisdictionMinAggregateOutputType = {
    id: string | null
    name: string | null
    type: string | null
    departmentId: string | null
    createdAt: Date | null
  }

  export type JurisdictionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    type: string | null
    departmentId: string | null
    createdAt: Date | null
  }

  export type JurisdictionCountAggregateOutputType = {
    id: number
    name: number
    type: number
    departmentId: number
    createdAt: number
    _all: number
  }


  export type JurisdictionMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    departmentId?: true
    createdAt?: true
  }

  export type JurisdictionMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    departmentId?: true
    createdAt?: true
  }

  export type JurisdictionCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    departmentId?: true
    createdAt?: true
    _all?: true
  }

  export type JurisdictionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Jurisdiction to aggregate.
     */
    where?: JurisdictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jurisdictions to fetch.
     */
    orderBy?: JurisdictionOrderByWithRelationInput | JurisdictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JurisdictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jurisdictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jurisdictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Jurisdictions
    **/
    _count?: true | JurisdictionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JurisdictionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JurisdictionMaxAggregateInputType
  }

  export type GetJurisdictionAggregateType<T extends JurisdictionAggregateArgs> = {
        [P in keyof T & keyof AggregateJurisdiction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJurisdiction[P]>
      : GetScalarType<T[P], AggregateJurisdiction[P]>
  }




  export type JurisdictionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JurisdictionWhereInput
    orderBy?: JurisdictionOrderByWithAggregationInput | JurisdictionOrderByWithAggregationInput[]
    by: JurisdictionScalarFieldEnum[] | JurisdictionScalarFieldEnum
    having?: JurisdictionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JurisdictionCountAggregateInputType | true
    _min?: JurisdictionMinAggregateInputType
    _max?: JurisdictionMaxAggregateInputType
  }

  export type JurisdictionGroupByOutputType = {
    id: string
    name: string
    type: string
    departmentId: string
    createdAt: Date
    _count: JurisdictionCountAggregateOutputType | null
    _min: JurisdictionMinAggregateOutputType | null
    _max: JurisdictionMaxAggregateOutputType | null
  }

  type GetJurisdictionGroupByPayload<T extends JurisdictionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JurisdictionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JurisdictionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JurisdictionGroupByOutputType[P]>
            : GetScalarType<T[P], JurisdictionGroupByOutputType[P]>
        }
      >
    >


  export type JurisdictionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    departmentId?: boolean
    createdAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    users?: boolean | Jurisdiction$usersArgs<ExtArgs>
    assets?: boolean | Jurisdiction$assetsArgs<ExtArgs>
    approvalAuthorities?: boolean | Jurisdiction$approvalAuthoritiesArgs<ExtArgs>
    _count?: boolean | JurisdictionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jurisdiction"]>

  export type JurisdictionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    departmentId?: boolean
    createdAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jurisdiction"]>

  export type JurisdictionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    departmentId?: boolean
    createdAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jurisdiction"]>

  export type JurisdictionSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    departmentId?: boolean
    createdAt?: boolean
  }

  export type JurisdictionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "type" | "departmentId" | "createdAt", ExtArgs["result"]["jurisdiction"]>
  export type JurisdictionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    users?: boolean | Jurisdiction$usersArgs<ExtArgs>
    assets?: boolean | Jurisdiction$assetsArgs<ExtArgs>
    approvalAuthorities?: boolean | Jurisdiction$approvalAuthoritiesArgs<ExtArgs>
    _count?: boolean | JurisdictionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type JurisdictionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }
  export type JurisdictionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
  }

  export type $JurisdictionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Jurisdiction"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs>
      users: Prisma.$UserPayload<ExtArgs>[]
      assets: Prisma.$AssetPayload<ExtArgs>[]
      approvalAuthorities: Prisma.$ApprovalAuthorityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      type: string
      departmentId: string
      createdAt: Date
    }, ExtArgs["result"]["jurisdiction"]>
    composites: {}
  }

  type JurisdictionGetPayload<S extends boolean | null | undefined | JurisdictionDefaultArgs> = $Result.GetResult<Prisma.$JurisdictionPayload, S>

  type JurisdictionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JurisdictionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JurisdictionCountAggregateInputType | true
    }

  export interface JurisdictionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Jurisdiction'], meta: { name: 'Jurisdiction' } }
    /**
     * Find zero or one Jurisdiction that matches the filter.
     * @param {JurisdictionFindUniqueArgs} args - Arguments to find a Jurisdiction
     * @example
     * // Get one Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JurisdictionFindUniqueArgs>(args: SelectSubset<T, JurisdictionFindUniqueArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Jurisdiction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JurisdictionFindUniqueOrThrowArgs} args - Arguments to find a Jurisdiction
     * @example
     * // Get one Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JurisdictionFindUniqueOrThrowArgs>(args: SelectSubset<T, JurisdictionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Jurisdiction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionFindFirstArgs} args - Arguments to find a Jurisdiction
     * @example
     * // Get one Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JurisdictionFindFirstArgs>(args?: SelectSubset<T, JurisdictionFindFirstArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Jurisdiction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionFindFirstOrThrowArgs} args - Arguments to find a Jurisdiction
     * @example
     * // Get one Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JurisdictionFindFirstOrThrowArgs>(args?: SelectSubset<T, JurisdictionFindFirstOrThrowArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Jurisdictions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Jurisdictions
     * const jurisdictions = await prisma.jurisdiction.findMany()
     * 
     * // Get first 10 Jurisdictions
     * const jurisdictions = await prisma.jurisdiction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jurisdictionWithIdOnly = await prisma.jurisdiction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JurisdictionFindManyArgs>(args?: SelectSubset<T, JurisdictionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Jurisdiction.
     * @param {JurisdictionCreateArgs} args - Arguments to create a Jurisdiction.
     * @example
     * // Create one Jurisdiction
     * const Jurisdiction = await prisma.jurisdiction.create({
     *   data: {
     *     // ... data to create a Jurisdiction
     *   }
     * })
     * 
     */
    create<T extends JurisdictionCreateArgs>(args: SelectSubset<T, JurisdictionCreateArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Jurisdictions.
     * @param {JurisdictionCreateManyArgs} args - Arguments to create many Jurisdictions.
     * @example
     * // Create many Jurisdictions
     * const jurisdiction = await prisma.jurisdiction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JurisdictionCreateManyArgs>(args?: SelectSubset<T, JurisdictionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Jurisdictions and returns the data saved in the database.
     * @param {JurisdictionCreateManyAndReturnArgs} args - Arguments to create many Jurisdictions.
     * @example
     * // Create many Jurisdictions
     * const jurisdiction = await prisma.jurisdiction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Jurisdictions and only return the `id`
     * const jurisdictionWithIdOnly = await prisma.jurisdiction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JurisdictionCreateManyAndReturnArgs>(args?: SelectSubset<T, JurisdictionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Jurisdiction.
     * @param {JurisdictionDeleteArgs} args - Arguments to delete one Jurisdiction.
     * @example
     * // Delete one Jurisdiction
     * const Jurisdiction = await prisma.jurisdiction.delete({
     *   where: {
     *     // ... filter to delete one Jurisdiction
     *   }
     * })
     * 
     */
    delete<T extends JurisdictionDeleteArgs>(args: SelectSubset<T, JurisdictionDeleteArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Jurisdiction.
     * @param {JurisdictionUpdateArgs} args - Arguments to update one Jurisdiction.
     * @example
     * // Update one Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JurisdictionUpdateArgs>(args: SelectSubset<T, JurisdictionUpdateArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Jurisdictions.
     * @param {JurisdictionDeleteManyArgs} args - Arguments to filter Jurisdictions to delete.
     * @example
     * // Delete a few Jurisdictions
     * const { count } = await prisma.jurisdiction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JurisdictionDeleteManyArgs>(args?: SelectSubset<T, JurisdictionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jurisdictions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Jurisdictions
     * const jurisdiction = await prisma.jurisdiction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JurisdictionUpdateManyArgs>(args: SelectSubset<T, JurisdictionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jurisdictions and returns the data updated in the database.
     * @param {JurisdictionUpdateManyAndReturnArgs} args - Arguments to update many Jurisdictions.
     * @example
     * // Update many Jurisdictions
     * const jurisdiction = await prisma.jurisdiction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Jurisdictions and only return the `id`
     * const jurisdictionWithIdOnly = await prisma.jurisdiction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JurisdictionUpdateManyAndReturnArgs>(args: SelectSubset<T, JurisdictionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Jurisdiction.
     * @param {JurisdictionUpsertArgs} args - Arguments to update or create a Jurisdiction.
     * @example
     * // Update or create a Jurisdiction
     * const jurisdiction = await prisma.jurisdiction.upsert({
     *   create: {
     *     // ... data to create a Jurisdiction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Jurisdiction we want to update
     *   }
     * })
     */
    upsert<T extends JurisdictionUpsertArgs>(args: SelectSubset<T, JurisdictionUpsertArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Jurisdictions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionCountArgs} args - Arguments to filter Jurisdictions to count.
     * @example
     * // Count the number of Jurisdictions
     * const count = await prisma.jurisdiction.count({
     *   where: {
     *     // ... the filter for the Jurisdictions we want to count
     *   }
     * })
    **/
    count<T extends JurisdictionCountArgs>(
      args?: Subset<T, JurisdictionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JurisdictionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Jurisdiction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JurisdictionAggregateArgs>(args: Subset<T, JurisdictionAggregateArgs>): Prisma.PrismaPromise<GetJurisdictionAggregateType<T>>

    /**
     * Group by Jurisdiction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JurisdictionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JurisdictionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JurisdictionGroupByArgs['orderBy'] }
        : { orderBy?: JurisdictionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JurisdictionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJurisdictionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Jurisdiction model
   */
  readonly fields: JurisdictionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Jurisdiction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JurisdictionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends DepartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DepartmentDefaultArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends Jurisdiction$usersArgs<ExtArgs> = {}>(args?: Subset<T, Jurisdiction$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    assets<T extends Jurisdiction$assetsArgs<ExtArgs> = {}>(args?: Subset<T, Jurisdiction$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    approvalAuthorities<T extends Jurisdiction$approvalAuthoritiesArgs<ExtArgs> = {}>(args?: Subset<T, Jurisdiction$approvalAuthoritiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Jurisdiction model
   */
  interface JurisdictionFieldRefs {
    readonly id: FieldRef<"Jurisdiction", 'String'>
    readonly name: FieldRef<"Jurisdiction", 'String'>
    readonly type: FieldRef<"Jurisdiction", 'String'>
    readonly departmentId: FieldRef<"Jurisdiction", 'String'>
    readonly createdAt: FieldRef<"Jurisdiction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Jurisdiction findUnique
   */
  export type JurisdictionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter, which Jurisdiction to fetch.
     */
    where: JurisdictionWhereUniqueInput
  }

  /**
   * Jurisdiction findUniqueOrThrow
   */
  export type JurisdictionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter, which Jurisdiction to fetch.
     */
    where: JurisdictionWhereUniqueInput
  }

  /**
   * Jurisdiction findFirst
   */
  export type JurisdictionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter, which Jurisdiction to fetch.
     */
    where?: JurisdictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jurisdictions to fetch.
     */
    orderBy?: JurisdictionOrderByWithRelationInput | JurisdictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jurisdictions.
     */
    cursor?: JurisdictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jurisdictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jurisdictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jurisdictions.
     */
    distinct?: JurisdictionScalarFieldEnum | JurisdictionScalarFieldEnum[]
  }

  /**
   * Jurisdiction findFirstOrThrow
   */
  export type JurisdictionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter, which Jurisdiction to fetch.
     */
    where?: JurisdictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jurisdictions to fetch.
     */
    orderBy?: JurisdictionOrderByWithRelationInput | JurisdictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jurisdictions.
     */
    cursor?: JurisdictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jurisdictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jurisdictions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jurisdictions.
     */
    distinct?: JurisdictionScalarFieldEnum | JurisdictionScalarFieldEnum[]
  }

  /**
   * Jurisdiction findMany
   */
  export type JurisdictionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter, which Jurisdictions to fetch.
     */
    where?: JurisdictionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jurisdictions to fetch.
     */
    orderBy?: JurisdictionOrderByWithRelationInput | JurisdictionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Jurisdictions.
     */
    cursor?: JurisdictionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jurisdictions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jurisdictions.
     */
    skip?: number
    distinct?: JurisdictionScalarFieldEnum | JurisdictionScalarFieldEnum[]
  }

  /**
   * Jurisdiction create
   */
  export type JurisdictionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * The data needed to create a Jurisdiction.
     */
    data: XOR<JurisdictionCreateInput, JurisdictionUncheckedCreateInput>
  }

  /**
   * Jurisdiction createMany
   */
  export type JurisdictionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Jurisdictions.
     */
    data: JurisdictionCreateManyInput | JurisdictionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Jurisdiction createManyAndReturn
   */
  export type JurisdictionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * The data used to create many Jurisdictions.
     */
    data: JurisdictionCreateManyInput | JurisdictionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Jurisdiction update
   */
  export type JurisdictionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * The data needed to update a Jurisdiction.
     */
    data: XOR<JurisdictionUpdateInput, JurisdictionUncheckedUpdateInput>
    /**
     * Choose, which Jurisdiction to update.
     */
    where: JurisdictionWhereUniqueInput
  }

  /**
   * Jurisdiction updateMany
   */
  export type JurisdictionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Jurisdictions.
     */
    data: XOR<JurisdictionUpdateManyMutationInput, JurisdictionUncheckedUpdateManyInput>
    /**
     * Filter which Jurisdictions to update
     */
    where?: JurisdictionWhereInput
    /**
     * Limit how many Jurisdictions to update.
     */
    limit?: number
  }

  /**
   * Jurisdiction updateManyAndReturn
   */
  export type JurisdictionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * The data used to update Jurisdictions.
     */
    data: XOR<JurisdictionUpdateManyMutationInput, JurisdictionUncheckedUpdateManyInput>
    /**
     * Filter which Jurisdictions to update
     */
    where?: JurisdictionWhereInput
    /**
     * Limit how many Jurisdictions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Jurisdiction upsert
   */
  export type JurisdictionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * The filter to search for the Jurisdiction to update in case it exists.
     */
    where: JurisdictionWhereUniqueInput
    /**
     * In case the Jurisdiction found by the `where` argument doesn't exist, create a new Jurisdiction with this data.
     */
    create: XOR<JurisdictionCreateInput, JurisdictionUncheckedCreateInput>
    /**
     * In case the Jurisdiction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JurisdictionUpdateInput, JurisdictionUncheckedUpdateInput>
  }

  /**
   * Jurisdiction delete
   */
  export type JurisdictionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
    /**
     * Filter which Jurisdiction to delete.
     */
    where: JurisdictionWhereUniqueInput
  }

  /**
   * Jurisdiction deleteMany
   */
  export type JurisdictionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Jurisdictions to delete
     */
    where?: JurisdictionWhereInput
    /**
     * Limit how many Jurisdictions to delete.
     */
    limit?: number
  }

  /**
   * Jurisdiction.users
   */
  export type Jurisdiction$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Jurisdiction.assets
   */
  export type Jurisdiction$assetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    cursor?: AssetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Jurisdiction.approvalAuthorities
   */
  export type Jurisdiction$approvalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    where?: ApprovalAuthorityWhereInput
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    cursor?: ApprovalAuthorityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * Jurisdiction without action
   */
  export type JurisdictionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Jurisdiction
     */
    select?: JurisdictionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Jurisdiction
     */
    omit?: JurisdictionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JurisdictionInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    employeeCode: string | null
    name: string | null
    email: string | null
    passwordHash: string | null
    designation: string | null
    role: $Enums.SystemRole | null
    status: $Enums.UserStatus | null
    departmentId: string | null
    jurisdictionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    employeeCode: string | null
    name: string | null
    email: string | null
    passwordHash: string | null
    designation: string | null
    role: $Enums.SystemRole | null
    status: $Enums.UserStatus | null
    departmentId: string | null
    jurisdictionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    employeeCode: number
    name: number
    email: number
    passwordHash: number
    designation: number
    role: number
    status: number
    departmentId: number
    jurisdictionId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    email?: true
    passwordHash?: true
    designation?: true
    role?: true
    status?: true
    departmentId?: true
    jurisdictionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    email?: true
    passwordHash?: true
    designation?: true
    role?: true
    status?: true
    departmentId?: true
    jurisdictionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    email?: true
    passwordHash?: true
    designation?: true
    role?: true
    status?: true
    departmentId?: true
    jurisdictionId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role: $Enums.SystemRole
    status: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    designation?: boolean
    role?: boolean
    status?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    inspections?: boolean | User$inspectionsArgs<ExtArgs>
    approvalAuthorities?: boolean | User$approvalAuthoritiesArgs<ExtArgs>
    reviewedOrpDecisions?: boolean | User$reviewedOrpDecisionsArgs<ExtArgs>
    forwardedOrpDecisions?: boolean | User$forwardedOrpDecisionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    designation?: boolean
    role?: boolean
    status?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    designation?: boolean
    role?: boolean
    status?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    designation?: boolean
    role?: boolean
    status?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employeeCode" | "name" | "email" | "passwordHash" | "designation" | "role" | "status" | "departmentId" | "jurisdictionId" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    inspections?: boolean | User$inspectionsArgs<ExtArgs>
    approvalAuthorities?: boolean | User$approvalAuthoritiesArgs<ExtArgs>
    reviewedOrpDecisions?: boolean | User$reviewedOrpDecisionsArgs<ExtArgs>
    forwardedOrpDecisions?: boolean | User$forwardedOrpDecisionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs>
      jurisdiction: Prisma.$JurisdictionPayload<ExtArgs>
      inspections: Prisma.$InspectionPayload<ExtArgs>[]
      approvalAuthorities: Prisma.$ApprovalAuthorityPayload<ExtArgs>[]
      reviewedOrpDecisions: Prisma.$OrpDecisionPayload<ExtArgs>[]
      forwardedOrpDecisions: Prisma.$OrpDecisionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      employeeCode: string
      name: string
      email: string
      passwordHash: string
      designation: string
      role: $Enums.SystemRole
      status: $Enums.UserStatus
      departmentId: string
      jurisdictionId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends DepartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DepartmentDefaultArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    jurisdiction<T extends JurisdictionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JurisdictionDefaultArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    inspections<T extends User$inspectionsArgs<ExtArgs> = {}>(args?: Subset<T, User$inspectionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    approvalAuthorities<T extends User$approvalAuthoritiesArgs<ExtArgs> = {}>(args?: Subset<T, User$approvalAuthoritiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reviewedOrpDecisions<T extends User$reviewedOrpDecisionsArgs<ExtArgs> = {}>(args?: Subset<T, User$reviewedOrpDecisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    forwardedOrpDecisions<T extends User$forwardedOrpDecisionsArgs<ExtArgs> = {}>(args?: Subset<T, User$forwardedOrpDecisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly employeeCode: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly designation: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'SystemRole'>
    readonly status: FieldRef<"User", 'UserStatus'>
    readonly departmentId: FieldRef<"User", 'String'>
    readonly jurisdictionId: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.inspections
   */
  export type User$inspectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    where?: InspectionWhereInput
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    cursor?: InspectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InspectionScalarFieldEnum | InspectionScalarFieldEnum[]
  }

  /**
   * User.approvalAuthorities
   */
  export type User$approvalAuthoritiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    where?: ApprovalAuthorityWhereInput
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    cursor?: ApprovalAuthorityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * User.reviewedOrpDecisions
   */
  export type User$reviewedOrpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    cursor?: OrpDecisionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * User.forwardedOrpDecisions
   */
  export type User$forwardedOrpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    cursor?: OrpDecisionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Asset
   */

  export type AggregateAsset = {
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  export type AssetAvgAggregateOutputType = {
    latitude: Decimal | null
    longitude: Decimal | null
    constructionYear: number | null
  }

  export type AssetSumAggregateOutputType = {
    latitude: Decimal | null
    longitude: Decimal | null
    constructionYear: number | null
  }

  export type AssetMinAggregateOutputType = {
    id: string | null
    assetCode: string | null
    name: string | null
    assetType: $Enums.AssetType | null
    departmentId: string | null
    jurisdictionId: string | null
    latitude: Decimal | null
    longitude: Decimal | null
    constructionYear: number | null
    conditionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssetMaxAggregateOutputType = {
    id: string | null
    assetCode: string | null
    name: string | null
    assetType: $Enums.AssetType | null
    departmentId: string | null
    jurisdictionId: string | null
    latitude: Decimal | null
    longitude: Decimal | null
    constructionYear: number | null
    conditionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssetCountAggregateOutputType = {
    id: number
    assetCode: number
    name: number
    assetType: number
    departmentId: number
    jurisdictionId: number
    latitude: number
    longitude: number
    constructionYear: number
    conditionStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssetAvgAggregateInputType = {
    latitude?: true
    longitude?: true
    constructionYear?: true
  }

  export type AssetSumAggregateInputType = {
    latitude?: true
    longitude?: true
    constructionYear?: true
  }

  export type AssetMinAggregateInputType = {
    id?: true
    assetCode?: true
    name?: true
    assetType?: true
    departmentId?: true
    jurisdictionId?: true
    latitude?: true
    longitude?: true
    constructionYear?: true
    conditionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssetMaxAggregateInputType = {
    id?: true
    assetCode?: true
    name?: true
    assetType?: true
    departmentId?: true
    jurisdictionId?: true
    latitude?: true
    longitude?: true
    constructionYear?: true
    conditionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssetCountAggregateInputType = {
    id?: true
    assetCode?: true
    name?: true
    assetType?: true
    departmentId?: true
    jurisdictionId?: true
    latitude?: true
    longitude?: true
    constructionYear?: true
    conditionStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Asset to aggregate.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assets
    **/
    _count?: true | AssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetMaxAggregateInputType
  }

  export type GetAssetAggregateType<T extends AssetAggregateArgs> = {
        [P in keyof T & keyof AggregateAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsset[P]>
      : GetScalarType<T[P], AggregateAsset[P]>
  }




  export type AssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithAggregationInput | AssetOrderByWithAggregationInput[]
    by: AssetScalarFieldEnum[] | AssetScalarFieldEnum
    having?: AssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetCountAggregateInputType | true
    _avg?: AssetAvgAggregateInputType
    _sum?: AssetSumAggregateInputType
    _min?: AssetMinAggregateInputType
    _max?: AssetMaxAggregateInputType
  }

  export type AssetGroupByOutputType = {
    id: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    jurisdictionId: string
    latitude: Decimal | null
    longitude: Decimal | null
    constructionYear: number | null
    conditionStatus: string | null
    createdAt: Date
    updatedAt: Date
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  type GetAssetGroupByPayload<T extends AssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetGroupByOutputType[P]>
            : GetScalarType<T[P], AssetGroupByOutputType[P]>
        }
      >
    >


  export type AssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetCode?: boolean
    name?: boolean
    assetType?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    latitude?: boolean
    longitude?: boolean
    constructionYear?: boolean
    conditionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    cases?: boolean | Asset$casesArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetCode?: boolean
    name?: boolean
    assetType?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    latitude?: boolean
    longitude?: boolean
    constructionYear?: boolean
    conditionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetCode?: boolean
    name?: boolean
    assetType?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    latitude?: boolean
    longitude?: boolean
    constructionYear?: boolean
    conditionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectScalar = {
    id?: boolean
    assetCode?: boolean
    name?: boolean
    assetType?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    latitude?: boolean
    longitude?: boolean
    constructionYear?: boolean
    conditionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AssetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assetCode" | "name" | "assetType" | "departmentId" | "jurisdictionId" | "latitude" | "longitude" | "constructionYear" | "conditionStatus" | "createdAt" | "updatedAt", ExtArgs["result"]["asset"]>
  export type AssetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    cases?: boolean | Asset$casesArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }
  export type AssetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }

  export type $AssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Asset"
    objects: {
      department: Prisma.$DepartmentPayload<ExtArgs>
      jurisdiction: Prisma.$JurisdictionPayload<ExtArgs>
      cases: Prisma.$CasePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assetCode: string
      name: string
      assetType: $Enums.AssetType
      departmentId: string
      jurisdictionId: string
      latitude: Prisma.Decimal | null
      longitude: Prisma.Decimal | null
      constructionYear: number | null
      conditionStatus: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["asset"]>
    composites: {}
  }

  type AssetGetPayload<S extends boolean | null | undefined | AssetDefaultArgs> = $Result.GetResult<Prisma.$AssetPayload, S>

  type AssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssetCountAggregateInputType | true
    }

  export interface AssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Asset'], meta: { name: 'Asset' } }
    /**
     * Find zero or one Asset that matches the filter.
     * @param {AssetFindUniqueArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetFindUniqueArgs>(args: SelectSubset<T, AssetFindUniqueArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Asset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetFindUniqueOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetFindFirstArgs>(args?: SelectSubset<T, AssetFindFirstArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Assets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assets
     * const assets = await prisma.asset.findMany()
     * 
     * // Get first 10 Assets
     * const assets = await prisma.asset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetWithIdOnly = await prisma.asset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetFindManyArgs>(args?: SelectSubset<T, AssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Asset.
     * @param {AssetCreateArgs} args - Arguments to create a Asset.
     * @example
     * // Create one Asset
     * const Asset = await prisma.asset.create({
     *   data: {
     *     // ... data to create a Asset
     *   }
     * })
     * 
     */
    create<T extends AssetCreateArgs>(args: SelectSubset<T, AssetCreateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Assets.
     * @param {AssetCreateManyArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetCreateManyArgs>(args?: SelectSubset<T, AssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assets and returns the data saved in the database.
     * @param {AssetCreateManyAndReturnArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Asset.
     * @param {AssetDeleteArgs} args - Arguments to delete one Asset.
     * @example
     * // Delete one Asset
     * const Asset = await prisma.asset.delete({
     *   where: {
     *     // ... filter to delete one Asset
     *   }
     * })
     * 
     */
    delete<T extends AssetDeleteArgs>(args: SelectSubset<T, AssetDeleteArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Asset.
     * @param {AssetUpdateArgs} args - Arguments to update one Asset.
     * @example
     * // Update one Asset
     * const asset = await prisma.asset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetUpdateArgs>(args: SelectSubset<T, AssetUpdateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Assets.
     * @param {AssetDeleteManyArgs} args - Arguments to filter Assets to delete.
     * @example
     * // Delete a few Assets
     * const { count } = await prisma.asset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetDeleteManyArgs>(args?: SelectSubset<T, AssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetUpdateManyArgs>(args: SelectSubset<T, AssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets and returns the data updated in the database.
     * @param {AssetUpdateManyAndReturnArgs} args - Arguments to update many Assets.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AssetUpdateManyAndReturnArgs>(args: SelectSubset<T, AssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Asset.
     * @param {AssetUpsertArgs} args - Arguments to update or create a Asset.
     * @example
     * // Update or create a Asset
     * const asset = await prisma.asset.upsert({
     *   create: {
     *     // ... data to create a Asset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Asset we want to update
     *   }
     * })
     */
    upsert<T extends AssetUpsertArgs>(args: SelectSubset<T, AssetUpsertArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCountArgs} args - Arguments to filter Assets to count.
     * @example
     * // Count the number of Assets
     * const count = await prisma.asset.count({
     *   where: {
     *     // ... the filter for the Assets we want to count
     *   }
     * })
    **/
    count<T extends AssetCountArgs>(
      args?: Subset<T, AssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAggregateArgs>(args: Subset<T, AssetAggregateArgs>): Prisma.PrismaPromise<GetAssetAggregateType<T>>

    /**
     * Group by Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetGroupByArgs['orderBy'] }
        : { orderBy?: AssetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Asset model
   */
  readonly fields: AssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Asset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    department<T extends DepartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DepartmentDefaultArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    jurisdiction<T extends JurisdictionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JurisdictionDefaultArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cases<T extends Asset$casesArgs<ExtArgs> = {}>(args?: Subset<T, Asset$casesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Asset model
   */
  interface AssetFieldRefs {
    readonly id: FieldRef<"Asset", 'String'>
    readonly assetCode: FieldRef<"Asset", 'String'>
    readonly name: FieldRef<"Asset", 'String'>
    readonly assetType: FieldRef<"Asset", 'AssetType'>
    readonly departmentId: FieldRef<"Asset", 'String'>
    readonly jurisdictionId: FieldRef<"Asset", 'String'>
    readonly latitude: FieldRef<"Asset", 'Decimal'>
    readonly longitude: FieldRef<"Asset", 'Decimal'>
    readonly constructionYear: FieldRef<"Asset", 'Int'>
    readonly conditionStatus: FieldRef<"Asset", 'String'>
    readonly createdAt: FieldRef<"Asset", 'DateTime'>
    readonly updatedAt: FieldRef<"Asset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Asset findUnique
   */
  export type AssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findUniqueOrThrow
   */
  export type AssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findFirst
   */
  export type AssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findFirstOrThrow
   */
  export type AssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findMany
   */
  export type AssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Assets to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset create
   */
  export type AssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to create a Asset.
     */
    data: XOR<AssetCreateInput, AssetUncheckedCreateInput>
  }

  /**
   * Asset createMany
   */
  export type AssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset createManyAndReturn
   */
  export type AssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Asset update
   */
  export type AssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to update a Asset.
     */
    data: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
    /**
     * Choose, which Asset to update.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset updateMany
   */
  export type AssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
  }

  /**
   * Asset updateManyAndReturn
   */
  export type AssetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Asset upsert
   */
  export type AssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The filter to search for the Asset to update in case it exists.
     */
    where: AssetWhereUniqueInput
    /**
     * In case the Asset found by the `where` argument doesn't exist, create a new Asset with this data.
     */
    create: XOR<AssetCreateInput, AssetUncheckedCreateInput>
    /**
     * In case the Asset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
  }

  /**
   * Asset delete
   */
  export type AssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter which Asset to delete.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset deleteMany
   */
  export type AssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assets to delete
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to delete.
     */
    limit?: number
  }

  /**
   * Asset.cases
   */
  export type Asset$casesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    where?: CaseWhereInput
    orderBy?: CaseOrderByWithRelationInput | CaseOrderByWithRelationInput[]
    cursor?: CaseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CaseScalarFieldEnum | CaseScalarFieldEnum[]
  }

  /**
   * Asset without action
   */
  export type AssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
  }


  /**
   * Model Case
   */

  export type AggregateCase = {
    _count: CaseCountAggregateOutputType | null
    _min: CaseMinAggregateOutputType | null
    _max: CaseMaxAggregateOutputType | null
  }

  export type CaseMinAggregateOutputType = {
    id: string | null
    caseNumber: string | null
    assetId: string | null
    title: string | null
    description: string | null
    status: $Enums.CaseStatus | null
    riskLevel: $Enums.RiskLevel | null
    priorityLevel: $Enums.PriorityLevel | null
    emergencyFlag: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    closedAt: Date | null
  }

  export type CaseMaxAggregateOutputType = {
    id: string | null
    caseNumber: string | null
    assetId: string | null
    title: string | null
    description: string | null
    status: $Enums.CaseStatus | null
    riskLevel: $Enums.RiskLevel | null
    priorityLevel: $Enums.PriorityLevel | null
    emergencyFlag: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    closedAt: Date | null
  }

  export type CaseCountAggregateOutputType = {
    id: number
    caseNumber: number
    assetId: number
    title: number
    description: number
    status: number
    riskLevel: number
    priorityLevel: number
    emergencyFlag: number
    createdAt: number
    updatedAt: number
    closedAt: number
    _all: number
  }


  export type CaseMinAggregateInputType = {
    id?: true
    caseNumber?: true
    assetId?: true
    title?: true
    description?: true
    status?: true
    riskLevel?: true
    priorityLevel?: true
    emergencyFlag?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
  }

  export type CaseMaxAggregateInputType = {
    id?: true
    caseNumber?: true
    assetId?: true
    title?: true
    description?: true
    status?: true
    riskLevel?: true
    priorityLevel?: true
    emergencyFlag?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
  }

  export type CaseCountAggregateInputType = {
    id?: true
    caseNumber?: true
    assetId?: true
    title?: true
    description?: true
    status?: true
    riskLevel?: true
    priorityLevel?: true
    emergencyFlag?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
    _all?: true
  }

  export type CaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Case to aggregate.
     */
    where?: CaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cases to fetch.
     */
    orderBy?: CaseOrderByWithRelationInput | CaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cases
    **/
    _count?: true | CaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CaseMaxAggregateInputType
  }

  export type GetCaseAggregateType<T extends CaseAggregateArgs> = {
        [P in keyof T & keyof AggregateCase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCase[P]>
      : GetScalarType<T[P], AggregateCase[P]>
  }




  export type CaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CaseWhereInput
    orderBy?: CaseOrderByWithAggregationInput | CaseOrderByWithAggregationInput[]
    by: CaseScalarFieldEnum[] | CaseScalarFieldEnum
    having?: CaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CaseCountAggregateInputType | true
    _min?: CaseMinAggregateInputType
    _max?: CaseMaxAggregateInputType
  }

  export type CaseGroupByOutputType = {
    id: string
    caseNumber: string
    assetId: string
    title: string
    description: string | null
    status: $Enums.CaseStatus
    riskLevel: $Enums.RiskLevel | null
    priorityLevel: $Enums.PriorityLevel | null
    emergencyFlag: boolean
    createdAt: Date
    updatedAt: Date
    closedAt: Date | null
    _count: CaseCountAggregateOutputType | null
    _min: CaseMinAggregateOutputType | null
    _max: CaseMaxAggregateOutputType | null
  }

  type GetCaseGroupByPayload<T extends CaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CaseGroupByOutputType[P]>
            : GetScalarType<T[P], CaseGroupByOutputType[P]>
        }
      >
    >


  export type CaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseNumber?: boolean
    assetId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    emergencyFlag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    inspections?: boolean | Case$inspectionsArgs<ExtArgs>
    riskAssessments?: boolean | Case$riskAssessmentsArgs<ExtArgs>
    operationalResponsePlans?: boolean | Case$operationalResponsePlansArgs<ExtArgs>
    orpDecisions?: boolean | Case$orpDecisionsArgs<ExtArgs>
    _count?: boolean | CaseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["case"]>

  export type CaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseNumber?: boolean
    assetId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    emergencyFlag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["case"]>

  export type CaseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseNumber?: boolean
    assetId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    emergencyFlag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["case"]>

  export type CaseSelectScalar = {
    id?: boolean
    caseNumber?: boolean
    assetId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    emergencyFlag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
  }

  export type CaseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "caseNumber" | "assetId" | "title" | "description" | "status" | "riskLevel" | "priorityLevel" | "emergencyFlag" | "createdAt" | "updatedAt" | "closedAt", ExtArgs["result"]["case"]>
  export type CaseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    inspections?: boolean | Case$inspectionsArgs<ExtArgs>
    riskAssessments?: boolean | Case$riskAssessmentsArgs<ExtArgs>
    operationalResponsePlans?: boolean | Case$operationalResponsePlansArgs<ExtArgs>
    orpDecisions?: boolean | Case$orpDecisionsArgs<ExtArgs>
    _count?: boolean | CaseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CaseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }
  export type CaseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $CasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Case"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
      inspections: Prisma.$InspectionPayload<ExtArgs>[]
      riskAssessments: Prisma.$RiskAssessmentPayload<ExtArgs>[]
      operationalResponsePlans: Prisma.$OperationalResponsePlanPayload<ExtArgs>[]
      orpDecisions: Prisma.$OrpDecisionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      caseNumber: string
      assetId: string
      title: string
      description: string | null
      status: $Enums.CaseStatus
      riskLevel: $Enums.RiskLevel | null
      priorityLevel: $Enums.PriorityLevel | null
      emergencyFlag: boolean
      createdAt: Date
      updatedAt: Date
      closedAt: Date | null
    }, ExtArgs["result"]["case"]>
    composites: {}
  }

  type CaseGetPayload<S extends boolean | null | undefined | CaseDefaultArgs> = $Result.GetResult<Prisma.$CasePayload, S>

  type CaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CaseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CaseCountAggregateInputType | true
    }

  export interface CaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Case'], meta: { name: 'Case' } }
    /**
     * Find zero or one Case that matches the filter.
     * @param {CaseFindUniqueArgs} args - Arguments to find a Case
     * @example
     * // Get one Case
     * const case = await prisma.case.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CaseFindUniqueArgs>(args: SelectSubset<T, CaseFindUniqueArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Case that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CaseFindUniqueOrThrowArgs} args - Arguments to find a Case
     * @example
     * // Get one Case
     * const case = await prisma.case.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CaseFindUniqueOrThrowArgs>(args: SelectSubset<T, CaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Case that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseFindFirstArgs} args - Arguments to find a Case
     * @example
     * // Get one Case
     * const case = await prisma.case.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CaseFindFirstArgs>(args?: SelectSubset<T, CaseFindFirstArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Case that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseFindFirstOrThrowArgs} args - Arguments to find a Case
     * @example
     * // Get one Case
     * const case = await prisma.case.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CaseFindFirstOrThrowArgs>(args?: SelectSubset<T, CaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cases
     * const cases = await prisma.case.findMany()
     * 
     * // Get first 10 Cases
     * const cases = await prisma.case.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const caseWithIdOnly = await prisma.case.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CaseFindManyArgs>(args?: SelectSubset<T, CaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Case.
     * @param {CaseCreateArgs} args - Arguments to create a Case.
     * @example
     * // Create one Case
     * const Case = await prisma.case.create({
     *   data: {
     *     // ... data to create a Case
     *   }
     * })
     * 
     */
    create<T extends CaseCreateArgs>(args: SelectSubset<T, CaseCreateArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cases.
     * @param {CaseCreateManyArgs} args - Arguments to create many Cases.
     * @example
     * // Create many Cases
     * const case = await prisma.case.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CaseCreateManyArgs>(args?: SelectSubset<T, CaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cases and returns the data saved in the database.
     * @param {CaseCreateManyAndReturnArgs} args - Arguments to create many Cases.
     * @example
     * // Create many Cases
     * const case = await prisma.case.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cases and only return the `id`
     * const caseWithIdOnly = await prisma.case.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CaseCreateManyAndReturnArgs>(args?: SelectSubset<T, CaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Case.
     * @param {CaseDeleteArgs} args - Arguments to delete one Case.
     * @example
     * // Delete one Case
     * const Case = await prisma.case.delete({
     *   where: {
     *     // ... filter to delete one Case
     *   }
     * })
     * 
     */
    delete<T extends CaseDeleteArgs>(args: SelectSubset<T, CaseDeleteArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Case.
     * @param {CaseUpdateArgs} args - Arguments to update one Case.
     * @example
     * // Update one Case
     * const case = await prisma.case.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CaseUpdateArgs>(args: SelectSubset<T, CaseUpdateArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cases.
     * @param {CaseDeleteManyArgs} args - Arguments to filter Cases to delete.
     * @example
     * // Delete a few Cases
     * const { count } = await prisma.case.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CaseDeleteManyArgs>(args?: SelectSubset<T, CaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cases
     * const case = await prisma.case.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CaseUpdateManyArgs>(args: SelectSubset<T, CaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cases and returns the data updated in the database.
     * @param {CaseUpdateManyAndReturnArgs} args - Arguments to update many Cases.
     * @example
     * // Update many Cases
     * const case = await prisma.case.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cases and only return the `id`
     * const caseWithIdOnly = await prisma.case.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CaseUpdateManyAndReturnArgs>(args: SelectSubset<T, CaseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Case.
     * @param {CaseUpsertArgs} args - Arguments to update or create a Case.
     * @example
     * // Update or create a Case
     * const case = await prisma.case.upsert({
     *   create: {
     *     // ... data to create a Case
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Case we want to update
     *   }
     * })
     */
    upsert<T extends CaseUpsertArgs>(args: SelectSubset<T, CaseUpsertArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseCountArgs} args - Arguments to filter Cases to count.
     * @example
     * // Count the number of Cases
     * const count = await prisma.case.count({
     *   where: {
     *     // ... the filter for the Cases we want to count
     *   }
     * })
    **/
    count<T extends CaseCountArgs>(
      args?: Subset<T, CaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Case.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CaseAggregateArgs>(args: Subset<T, CaseAggregateArgs>): Prisma.PrismaPromise<GetCaseAggregateType<T>>

    /**
     * Group by Case.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CaseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CaseGroupByArgs['orderBy'] }
        : { orderBy?: CaseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Case model
   */
  readonly fields: CaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Case.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    inspections<T extends Case$inspectionsArgs<ExtArgs> = {}>(args?: Subset<T, Case$inspectionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    riskAssessments<T extends Case$riskAssessmentsArgs<ExtArgs> = {}>(args?: Subset<T, Case$riskAssessmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    operationalResponsePlans<T extends Case$operationalResponsePlansArgs<ExtArgs> = {}>(args?: Subset<T, Case$operationalResponsePlansArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orpDecisions<T extends Case$orpDecisionsArgs<ExtArgs> = {}>(args?: Subset<T, Case$orpDecisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Case model
   */
  interface CaseFieldRefs {
    readonly id: FieldRef<"Case", 'String'>
    readonly caseNumber: FieldRef<"Case", 'String'>
    readonly assetId: FieldRef<"Case", 'String'>
    readonly title: FieldRef<"Case", 'String'>
    readonly description: FieldRef<"Case", 'String'>
    readonly status: FieldRef<"Case", 'CaseStatus'>
    readonly riskLevel: FieldRef<"Case", 'RiskLevel'>
    readonly priorityLevel: FieldRef<"Case", 'PriorityLevel'>
    readonly emergencyFlag: FieldRef<"Case", 'Boolean'>
    readonly createdAt: FieldRef<"Case", 'DateTime'>
    readonly updatedAt: FieldRef<"Case", 'DateTime'>
    readonly closedAt: FieldRef<"Case", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Case findUnique
   */
  export type CaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter, which Case to fetch.
     */
    where: CaseWhereUniqueInput
  }

  /**
   * Case findUniqueOrThrow
   */
  export type CaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter, which Case to fetch.
     */
    where: CaseWhereUniqueInput
  }

  /**
   * Case findFirst
   */
  export type CaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter, which Case to fetch.
     */
    where?: CaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cases to fetch.
     */
    orderBy?: CaseOrderByWithRelationInput | CaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cases.
     */
    cursor?: CaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cases.
     */
    distinct?: CaseScalarFieldEnum | CaseScalarFieldEnum[]
  }

  /**
   * Case findFirstOrThrow
   */
  export type CaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter, which Case to fetch.
     */
    where?: CaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cases to fetch.
     */
    orderBy?: CaseOrderByWithRelationInput | CaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cases.
     */
    cursor?: CaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cases.
     */
    distinct?: CaseScalarFieldEnum | CaseScalarFieldEnum[]
  }

  /**
   * Case findMany
   */
  export type CaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter, which Cases to fetch.
     */
    where?: CaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cases to fetch.
     */
    orderBy?: CaseOrderByWithRelationInput | CaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cases.
     */
    cursor?: CaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cases.
     */
    skip?: number
    distinct?: CaseScalarFieldEnum | CaseScalarFieldEnum[]
  }

  /**
   * Case create
   */
  export type CaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * The data needed to create a Case.
     */
    data: XOR<CaseCreateInput, CaseUncheckedCreateInput>
  }

  /**
   * Case createMany
   */
  export type CaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cases.
     */
    data: CaseCreateManyInput | CaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Case createManyAndReturn
   */
  export type CaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * The data used to create many Cases.
     */
    data: CaseCreateManyInput | CaseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Case update
   */
  export type CaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * The data needed to update a Case.
     */
    data: XOR<CaseUpdateInput, CaseUncheckedUpdateInput>
    /**
     * Choose, which Case to update.
     */
    where: CaseWhereUniqueInput
  }

  /**
   * Case updateMany
   */
  export type CaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cases.
     */
    data: XOR<CaseUpdateManyMutationInput, CaseUncheckedUpdateManyInput>
    /**
     * Filter which Cases to update
     */
    where?: CaseWhereInput
    /**
     * Limit how many Cases to update.
     */
    limit?: number
  }

  /**
   * Case updateManyAndReturn
   */
  export type CaseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * The data used to update Cases.
     */
    data: XOR<CaseUpdateManyMutationInput, CaseUncheckedUpdateManyInput>
    /**
     * Filter which Cases to update
     */
    where?: CaseWhereInput
    /**
     * Limit how many Cases to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Case upsert
   */
  export type CaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * The filter to search for the Case to update in case it exists.
     */
    where: CaseWhereUniqueInput
    /**
     * In case the Case found by the `where` argument doesn't exist, create a new Case with this data.
     */
    create: XOR<CaseCreateInput, CaseUncheckedCreateInput>
    /**
     * In case the Case was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CaseUpdateInput, CaseUncheckedUpdateInput>
  }

  /**
   * Case delete
   */
  export type CaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
    /**
     * Filter which Case to delete.
     */
    where: CaseWhereUniqueInput
  }

  /**
   * Case deleteMany
   */
  export type CaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cases to delete
     */
    where?: CaseWhereInput
    /**
     * Limit how many Cases to delete.
     */
    limit?: number
  }

  /**
   * Case.inspections
   */
  export type Case$inspectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    where?: InspectionWhereInput
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    cursor?: InspectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InspectionScalarFieldEnum | InspectionScalarFieldEnum[]
  }

  /**
   * Case.riskAssessments
   */
  export type Case$riskAssessmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    where?: RiskAssessmentWhereInput
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    cursor?: RiskAssessmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RiskAssessmentScalarFieldEnum | RiskAssessmentScalarFieldEnum[]
  }

  /**
   * Case.operationalResponsePlans
   */
  export type Case$operationalResponsePlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    where?: OperationalResponsePlanWhereInput
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    cursor?: OperationalResponsePlanWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OperationalResponsePlanScalarFieldEnum | OperationalResponsePlanScalarFieldEnum[]
  }

  /**
   * Case.orpDecisions
   */
  export type Case$orpDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    cursor?: OrpDecisionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * Case without action
   */
  export type CaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Case
     */
    select?: CaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Case
     */
    omit?: CaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CaseInclude<ExtArgs> | null
  }


  /**
   * Model Inspection
   */

  export type AggregateInspection = {
    _count: InspectionCountAggregateOutputType | null
    _avg: InspectionAvgAggregateOutputType | null
    _sum: InspectionSumAggregateOutputType | null
    _min: InspectionMinAggregateOutputType | null
    _max: InspectionMaxAggregateOutputType | null
  }

  export type InspectionAvgAggregateOutputType = {
    estimatedDailyUsers: number | null
  }

  export type InspectionSumAggregateOutputType = {
    estimatedDailyUsers: number | null
  }

  export type InspectionMinAggregateOutputType = {
    id: string | null
    caseId: string | null
    inspectorId: string | null
    inspectionDate: Date | null
    structuralCondition: string | null
    crackSeverity: string | null
    corrosionLevel: string | null
    trafficImportance: string | null
    hospitalRoute: boolean | null
    weatherRisk: string | null
    heavyRainExpected: boolean | null
    estimatedDailyUsers: number | null
    inspectionNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InspectionMaxAggregateOutputType = {
    id: string | null
    caseId: string | null
    inspectorId: string | null
    inspectionDate: Date | null
    structuralCondition: string | null
    crackSeverity: string | null
    corrosionLevel: string | null
    trafficImportance: string | null
    hospitalRoute: boolean | null
    weatherRisk: string | null
    heavyRainExpected: boolean | null
    estimatedDailyUsers: number | null
    inspectionNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InspectionCountAggregateOutputType = {
    id: number
    caseId: number
    inspectorId: number
    inspectionDate: number
    structuralCondition: number
    crackSeverity: number
    corrosionLevel: number
    trafficImportance: number
    hospitalRoute: number
    weatherRisk: number
    heavyRainExpected: number
    estimatedDailyUsers: number
    inspectionNotes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InspectionAvgAggregateInputType = {
    estimatedDailyUsers?: true
  }

  export type InspectionSumAggregateInputType = {
    estimatedDailyUsers?: true
  }

  export type InspectionMinAggregateInputType = {
    id?: true
    caseId?: true
    inspectorId?: true
    inspectionDate?: true
    structuralCondition?: true
    crackSeverity?: true
    corrosionLevel?: true
    trafficImportance?: true
    hospitalRoute?: true
    weatherRisk?: true
    heavyRainExpected?: true
    estimatedDailyUsers?: true
    inspectionNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InspectionMaxAggregateInputType = {
    id?: true
    caseId?: true
    inspectorId?: true
    inspectionDate?: true
    structuralCondition?: true
    crackSeverity?: true
    corrosionLevel?: true
    trafficImportance?: true
    hospitalRoute?: true
    weatherRisk?: true
    heavyRainExpected?: true
    estimatedDailyUsers?: true
    inspectionNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InspectionCountAggregateInputType = {
    id?: true
    caseId?: true
    inspectorId?: true
    inspectionDate?: true
    structuralCondition?: true
    crackSeverity?: true
    corrosionLevel?: true
    trafficImportance?: true
    hospitalRoute?: true
    weatherRisk?: true
    heavyRainExpected?: true
    estimatedDailyUsers?: true
    inspectionNotes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InspectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inspection to aggregate.
     */
    where?: InspectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inspections to fetch.
     */
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InspectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inspections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inspections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Inspections
    **/
    _count?: true | InspectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InspectionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InspectionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InspectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InspectionMaxAggregateInputType
  }

  export type GetInspectionAggregateType<T extends InspectionAggregateArgs> = {
        [P in keyof T & keyof AggregateInspection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInspection[P]>
      : GetScalarType<T[P], AggregateInspection[P]>
  }




  export type InspectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InspectionWhereInput
    orderBy?: InspectionOrderByWithAggregationInput | InspectionOrderByWithAggregationInput[]
    by: InspectionScalarFieldEnum[] | InspectionScalarFieldEnum
    having?: InspectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InspectionCountAggregateInputType | true
    _avg?: InspectionAvgAggregateInputType
    _sum?: InspectionSumAggregateInputType
    _min?: InspectionMinAggregateInputType
    _max?: InspectionMaxAggregateInputType
  }

  export type InspectionGroupByOutputType = {
    id: string
    caseId: string
    inspectorId: string
    inspectionDate: Date
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers: number | null
    inspectionNotes: string | null
    createdAt: Date
    updatedAt: Date
    _count: InspectionCountAggregateOutputType | null
    _avg: InspectionAvgAggregateOutputType | null
    _sum: InspectionSumAggregateOutputType | null
    _min: InspectionMinAggregateOutputType | null
    _max: InspectionMaxAggregateOutputType | null
  }

  type GetInspectionGroupByPayload<T extends InspectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InspectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InspectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InspectionGroupByOutputType[P]>
            : GetScalarType<T[P], InspectionGroupByOutputType[P]>
        }
      >
    >


  export type InspectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectorId?: boolean
    inspectionDate?: boolean
    structuralCondition?: boolean
    crackSeverity?: boolean
    corrosionLevel?: boolean
    trafficImportance?: boolean
    hospitalRoute?: boolean
    weatherRisk?: boolean
    heavyRainExpected?: boolean
    estimatedDailyUsers?: boolean
    inspectionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
    riskAssessments?: boolean | Inspection$riskAssessmentsArgs<ExtArgs>
    _count?: boolean | InspectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inspection"]>

  export type InspectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectorId?: boolean
    inspectionDate?: boolean
    structuralCondition?: boolean
    crackSeverity?: boolean
    corrosionLevel?: boolean
    trafficImportance?: boolean
    hospitalRoute?: boolean
    weatherRisk?: boolean
    heavyRainExpected?: boolean
    estimatedDailyUsers?: boolean
    inspectionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inspection"]>

  export type InspectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectorId?: boolean
    inspectionDate?: boolean
    structuralCondition?: boolean
    crackSeverity?: boolean
    corrosionLevel?: boolean
    trafficImportance?: boolean
    hospitalRoute?: boolean
    weatherRisk?: boolean
    heavyRainExpected?: boolean
    estimatedDailyUsers?: boolean
    inspectionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inspection"]>

  export type InspectionSelectScalar = {
    id?: boolean
    caseId?: boolean
    inspectorId?: boolean
    inspectionDate?: boolean
    structuralCondition?: boolean
    crackSeverity?: boolean
    corrosionLevel?: boolean
    trafficImportance?: boolean
    hospitalRoute?: boolean
    weatherRisk?: boolean
    heavyRainExpected?: boolean
    estimatedDailyUsers?: boolean
    inspectionNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InspectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "caseId" | "inspectorId" | "inspectionDate" | "structuralCondition" | "crackSeverity" | "corrosionLevel" | "trafficImportance" | "hospitalRoute" | "weatherRisk" | "heavyRainExpected" | "estimatedDailyUsers" | "inspectionNotes" | "createdAt" | "updatedAt", ExtArgs["result"]["inspection"]>
  export type InspectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
    riskAssessments?: boolean | Inspection$riskAssessmentsArgs<ExtArgs>
    _count?: boolean | InspectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InspectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InspectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspector?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $InspectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Inspection"
    objects: {
      case: Prisma.$CasePayload<ExtArgs>
      inspector: Prisma.$UserPayload<ExtArgs>
      riskAssessments: Prisma.$RiskAssessmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      caseId: string
      inspectorId: string
      inspectionDate: Date
      structuralCondition: string
      crackSeverity: string
      corrosionLevel: string
      trafficImportance: string
      hospitalRoute: boolean
      weatherRisk: string
      heavyRainExpected: boolean
      estimatedDailyUsers: number | null
      inspectionNotes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["inspection"]>
    composites: {}
  }

  type InspectionGetPayload<S extends boolean | null | undefined | InspectionDefaultArgs> = $Result.GetResult<Prisma.$InspectionPayload, S>

  type InspectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InspectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InspectionCountAggregateInputType | true
    }

  export interface InspectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Inspection'], meta: { name: 'Inspection' } }
    /**
     * Find zero or one Inspection that matches the filter.
     * @param {InspectionFindUniqueArgs} args - Arguments to find a Inspection
     * @example
     * // Get one Inspection
     * const inspection = await prisma.inspection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InspectionFindUniqueArgs>(args: SelectSubset<T, InspectionFindUniqueArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inspection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InspectionFindUniqueOrThrowArgs} args - Arguments to find a Inspection
     * @example
     * // Get one Inspection
     * const inspection = await prisma.inspection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InspectionFindUniqueOrThrowArgs>(args: SelectSubset<T, InspectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inspection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionFindFirstArgs} args - Arguments to find a Inspection
     * @example
     * // Get one Inspection
     * const inspection = await prisma.inspection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InspectionFindFirstArgs>(args?: SelectSubset<T, InspectionFindFirstArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inspection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionFindFirstOrThrowArgs} args - Arguments to find a Inspection
     * @example
     * // Get one Inspection
     * const inspection = await prisma.inspection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InspectionFindFirstOrThrowArgs>(args?: SelectSubset<T, InspectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inspections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inspections
     * const inspections = await prisma.inspection.findMany()
     * 
     * // Get first 10 Inspections
     * const inspections = await prisma.inspection.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inspectionWithIdOnly = await prisma.inspection.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InspectionFindManyArgs>(args?: SelectSubset<T, InspectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inspection.
     * @param {InspectionCreateArgs} args - Arguments to create a Inspection.
     * @example
     * // Create one Inspection
     * const Inspection = await prisma.inspection.create({
     *   data: {
     *     // ... data to create a Inspection
     *   }
     * })
     * 
     */
    create<T extends InspectionCreateArgs>(args: SelectSubset<T, InspectionCreateArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inspections.
     * @param {InspectionCreateManyArgs} args - Arguments to create many Inspections.
     * @example
     * // Create many Inspections
     * const inspection = await prisma.inspection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InspectionCreateManyArgs>(args?: SelectSubset<T, InspectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inspections and returns the data saved in the database.
     * @param {InspectionCreateManyAndReturnArgs} args - Arguments to create many Inspections.
     * @example
     * // Create many Inspections
     * const inspection = await prisma.inspection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inspections and only return the `id`
     * const inspectionWithIdOnly = await prisma.inspection.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InspectionCreateManyAndReturnArgs>(args?: SelectSubset<T, InspectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inspection.
     * @param {InspectionDeleteArgs} args - Arguments to delete one Inspection.
     * @example
     * // Delete one Inspection
     * const Inspection = await prisma.inspection.delete({
     *   where: {
     *     // ... filter to delete one Inspection
     *   }
     * })
     * 
     */
    delete<T extends InspectionDeleteArgs>(args: SelectSubset<T, InspectionDeleteArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inspection.
     * @param {InspectionUpdateArgs} args - Arguments to update one Inspection.
     * @example
     * // Update one Inspection
     * const inspection = await prisma.inspection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InspectionUpdateArgs>(args: SelectSubset<T, InspectionUpdateArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inspections.
     * @param {InspectionDeleteManyArgs} args - Arguments to filter Inspections to delete.
     * @example
     * // Delete a few Inspections
     * const { count } = await prisma.inspection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InspectionDeleteManyArgs>(args?: SelectSubset<T, InspectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inspections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inspections
     * const inspection = await prisma.inspection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InspectionUpdateManyArgs>(args: SelectSubset<T, InspectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inspections and returns the data updated in the database.
     * @param {InspectionUpdateManyAndReturnArgs} args - Arguments to update many Inspections.
     * @example
     * // Update many Inspections
     * const inspection = await prisma.inspection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inspections and only return the `id`
     * const inspectionWithIdOnly = await prisma.inspection.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InspectionUpdateManyAndReturnArgs>(args: SelectSubset<T, InspectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inspection.
     * @param {InspectionUpsertArgs} args - Arguments to update or create a Inspection.
     * @example
     * // Update or create a Inspection
     * const inspection = await prisma.inspection.upsert({
     *   create: {
     *     // ... data to create a Inspection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inspection we want to update
     *   }
     * })
     */
    upsert<T extends InspectionUpsertArgs>(args: SelectSubset<T, InspectionUpsertArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inspections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionCountArgs} args - Arguments to filter Inspections to count.
     * @example
     * // Count the number of Inspections
     * const count = await prisma.inspection.count({
     *   where: {
     *     // ... the filter for the Inspections we want to count
     *   }
     * })
    **/
    count<T extends InspectionCountArgs>(
      args?: Subset<T, InspectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InspectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inspection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InspectionAggregateArgs>(args: Subset<T, InspectionAggregateArgs>): Prisma.PrismaPromise<GetInspectionAggregateType<T>>

    /**
     * Group by Inspection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InspectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InspectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InspectionGroupByArgs['orderBy'] }
        : { orderBy?: InspectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InspectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInspectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Inspection model
   */
  readonly fields: InspectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Inspection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InspectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends CaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CaseDefaultArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    inspector<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    riskAssessments<T extends Inspection$riskAssessmentsArgs<ExtArgs> = {}>(args?: Subset<T, Inspection$riskAssessmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Inspection model
   */
  interface InspectionFieldRefs {
    readonly id: FieldRef<"Inspection", 'String'>
    readonly caseId: FieldRef<"Inspection", 'String'>
    readonly inspectorId: FieldRef<"Inspection", 'String'>
    readonly inspectionDate: FieldRef<"Inspection", 'DateTime'>
    readonly structuralCondition: FieldRef<"Inspection", 'String'>
    readonly crackSeverity: FieldRef<"Inspection", 'String'>
    readonly corrosionLevel: FieldRef<"Inspection", 'String'>
    readonly trafficImportance: FieldRef<"Inspection", 'String'>
    readonly hospitalRoute: FieldRef<"Inspection", 'Boolean'>
    readonly weatherRisk: FieldRef<"Inspection", 'String'>
    readonly heavyRainExpected: FieldRef<"Inspection", 'Boolean'>
    readonly estimatedDailyUsers: FieldRef<"Inspection", 'Int'>
    readonly inspectionNotes: FieldRef<"Inspection", 'String'>
    readonly createdAt: FieldRef<"Inspection", 'DateTime'>
    readonly updatedAt: FieldRef<"Inspection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Inspection findUnique
   */
  export type InspectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter, which Inspection to fetch.
     */
    where: InspectionWhereUniqueInput
  }

  /**
   * Inspection findUniqueOrThrow
   */
  export type InspectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter, which Inspection to fetch.
     */
    where: InspectionWhereUniqueInput
  }

  /**
   * Inspection findFirst
   */
  export type InspectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter, which Inspection to fetch.
     */
    where?: InspectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inspections to fetch.
     */
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inspections.
     */
    cursor?: InspectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inspections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inspections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inspections.
     */
    distinct?: InspectionScalarFieldEnum | InspectionScalarFieldEnum[]
  }

  /**
   * Inspection findFirstOrThrow
   */
  export type InspectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter, which Inspection to fetch.
     */
    where?: InspectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inspections to fetch.
     */
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inspections.
     */
    cursor?: InspectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inspections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inspections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inspections.
     */
    distinct?: InspectionScalarFieldEnum | InspectionScalarFieldEnum[]
  }

  /**
   * Inspection findMany
   */
  export type InspectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter, which Inspections to fetch.
     */
    where?: InspectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inspections to fetch.
     */
    orderBy?: InspectionOrderByWithRelationInput | InspectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Inspections.
     */
    cursor?: InspectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inspections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inspections.
     */
    skip?: number
    distinct?: InspectionScalarFieldEnum | InspectionScalarFieldEnum[]
  }

  /**
   * Inspection create
   */
  export type InspectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * The data needed to create a Inspection.
     */
    data: XOR<InspectionCreateInput, InspectionUncheckedCreateInput>
  }

  /**
   * Inspection createMany
   */
  export type InspectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Inspections.
     */
    data: InspectionCreateManyInput | InspectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inspection createManyAndReturn
   */
  export type InspectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * The data used to create many Inspections.
     */
    data: InspectionCreateManyInput | InspectionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Inspection update
   */
  export type InspectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * The data needed to update a Inspection.
     */
    data: XOR<InspectionUpdateInput, InspectionUncheckedUpdateInput>
    /**
     * Choose, which Inspection to update.
     */
    where: InspectionWhereUniqueInput
  }

  /**
   * Inspection updateMany
   */
  export type InspectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Inspections.
     */
    data: XOR<InspectionUpdateManyMutationInput, InspectionUncheckedUpdateManyInput>
    /**
     * Filter which Inspections to update
     */
    where?: InspectionWhereInput
    /**
     * Limit how many Inspections to update.
     */
    limit?: number
  }

  /**
   * Inspection updateManyAndReturn
   */
  export type InspectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * The data used to update Inspections.
     */
    data: XOR<InspectionUpdateManyMutationInput, InspectionUncheckedUpdateManyInput>
    /**
     * Filter which Inspections to update
     */
    where?: InspectionWhereInput
    /**
     * Limit how many Inspections to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Inspection upsert
   */
  export type InspectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * The filter to search for the Inspection to update in case it exists.
     */
    where: InspectionWhereUniqueInput
    /**
     * In case the Inspection found by the `where` argument doesn't exist, create a new Inspection with this data.
     */
    create: XOR<InspectionCreateInput, InspectionUncheckedCreateInput>
    /**
     * In case the Inspection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InspectionUpdateInput, InspectionUncheckedUpdateInput>
  }

  /**
   * Inspection delete
   */
  export type InspectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
    /**
     * Filter which Inspection to delete.
     */
    where: InspectionWhereUniqueInput
  }

  /**
   * Inspection deleteMany
   */
  export type InspectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inspections to delete
     */
    where?: InspectionWhereInput
    /**
     * Limit how many Inspections to delete.
     */
    limit?: number
  }

  /**
   * Inspection.riskAssessments
   */
  export type Inspection$riskAssessmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    where?: RiskAssessmentWhereInput
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    cursor?: RiskAssessmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RiskAssessmentScalarFieldEnum | RiskAssessmentScalarFieldEnum[]
  }

  /**
   * Inspection without action
   */
  export type InspectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inspection
     */
    select?: InspectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inspection
     */
    omit?: InspectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InspectionInclude<ExtArgs> | null
  }


  /**
   * Model RiskAssessment
   */

  export type AggregateRiskAssessment = {
    _count: RiskAssessmentCountAggregateOutputType | null
    _avg: RiskAssessmentAvgAggregateOutputType | null
    _sum: RiskAssessmentSumAggregateOutputType | null
    _min: RiskAssessmentMinAggregateOutputType | null
    _max: RiskAssessmentMaxAggregateOutputType | null
  }

  export type RiskAssessmentAvgAggregateOutputType = {
    riskScore: number | null
  }

  export type RiskAssessmentSumAggregateOutputType = {
    riskScore: number | null
  }

  export type RiskAssessmentMinAggregateOutputType = {
    id: string | null
    caseId: string | null
    inspectionId: string | null
    riskScore: number | null
    riskLevel: $Enums.RiskLevel | null
    priorityLevel: $Enums.PriorityLevel | null
    assessmentVersion: string | null
    createdAt: Date | null
  }

  export type RiskAssessmentMaxAggregateOutputType = {
    id: string | null
    caseId: string | null
    inspectionId: string | null
    riskScore: number | null
    riskLevel: $Enums.RiskLevel | null
    priorityLevel: $Enums.PriorityLevel | null
    assessmentVersion: string | null
    createdAt: Date | null
  }

  export type RiskAssessmentCountAggregateOutputType = {
    id: number
    caseId: number
    inspectionId: number
    riskScore: number
    riskLevel: number
    priorityLevel: number
    reasonCodes: number
    reasons: number
    assessmentVersion: number
    createdAt: number
    _all: number
  }


  export type RiskAssessmentAvgAggregateInputType = {
    riskScore?: true
  }

  export type RiskAssessmentSumAggregateInputType = {
    riskScore?: true
  }

  export type RiskAssessmentMinAggregateInputType = {
    id?: true
    caseId?: true
    inspectionId?: true
    riskScore?: true
    riskLevel?: true
    priorityLevel?: true
    assessmentVersion?: true
    createdAt?: true
  }

  export type RiskAssessmentMaxAggregateInputType = {
    id?: true
    caseId?: true
    inspectionId?: true
    riskScore?: true
    riskLevel?: true
    priorityLevel?: true
    assessmentVersion?: true
    createdAt?: true
  }

  export type RiskAssessmentCountAggregateInputType = {
    id?: true
    caseId?: true
    inspectionId?: true
    riskScore?: true
    riskLevel?: true
    priorityLevel?: true
    reasonCodes?: true
    reasons?: true
    assessmentVersion?: true
    createdAt?: true
    _all?: true
  }

  export type RiskAssessmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RiskAssessment to aggregate.
     */
    where?: RiskAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskAssessments to fetch.
     */
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RiskAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RiskAssessments
    **/
    _count?: true | RiskAssessmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RiskAssessmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RiskAssessmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RiskAssessmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RiskAssessmentMaxAggregateInputType
  }

  export type GetRiskAssessmentAggregateType<T extends RiskAssessmentAggregateArgs> = {
        [P in keyof T & keyof AggregateRiskAssessment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRiskAssessment[P]>
      : GetScalarType<T[P], AggregateRiskAssessment[P]>
  }




  export type RiskAssessmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RiskAssessmentWhereInput
    orderBy?: RiskAssessmentOrderByWithAggregationInput | RiskAssessmentOrderByWithAggregationInput[]
    by: RiskAssessmentScalarFieldEnum[] | RiskAssessmentScalarFieldEnum
    having?: RiskAssessmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RiskAssessmentCountAggregateInputType | true
    _avg?: RiskAssessmentAvgAggregateInputType
    _sum?: RiskAssessmentSumAggregateInputType
    _min?: RiskAssessmentMinAggregateInputType
    _max?: RiskAssessmentMaxAggregateInputType
  }

  export type RiskAssessmentGroupByOutputType = {
    id: string
    caseId: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonValue
    reasons: JsonValue
    assessmentVersion: string
    createdAt: Date
    _count: RiskAssessmentCountAggregateOutputType | null
    _avg: RiskAssessmentAvgAggregateOutputType | null
    _sum: RiskAssessmentSumAggregateOutputType | null
    _min: RiskAssessmentMinAggregateOutputType | null
    _max: RiskAssessmentMaxAggregateOutputType | null
  }

  type GetRiskAssessmentGroupByPayload<T extends RiskAssessmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RiskAssessmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RiskAssessmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RiskAssessmentGroupByOutputType[P]>
            : GetScalarType<T[P], RiskAssessmentGroupByOutputType[P]>
        }
      >
    >


  export type RiskAssessmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectionId?: boolean
    riskScore?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    reasonCodes?: boolean
    reasons?: boolean
    assessmentVersion?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
    operationalResponsePlans?: boolean | RiskAssessment$operationalResponsePlansArgs<ExtArgs>
    _count?: boolean | RiskAssessmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["riskAssessment"]>

  export type RiskAssessmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectionId?: boolean
    riskScore?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    reasonCodes?: boolean
    reasons?: boolean
    assessmentVersion?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["riskAssessment"]>

  export type RiskAssessmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    inspectionId?: boolean
    riskScore?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    reasonCodes?: boolean
    reasons?: boolean
    assessmentVersion?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["riskAssessment"]>

  export type RiskAssessmentSelectScalar = {
    id?: boolean
    caseId?: boolean
    inspectionId?: boolean
    riskScore?: boolean
    riskLevel?: boolean
    priorityLevel?: boolean
    reasonCodes?: boolean
    reasons?: boolean
    assessmentVersion?: boolean
    createdAt?: boolean
  }

  export type RiskAssessmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "caseId" | "inspectionId" | "riskScore" | "riskLevel" | "priorityLevel" | "reasonCodes" | "reasons" | "assessmentVersion" | "createdAt", ExtArgs["result"]["riskAssessment"]>
  export type RiskAssessmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
    operationalResponsePlans?: boolean | RiskAssessment$operationalResponsePlansArgs<ExtArgs>
    _count?: boolean | RiskAssessmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RiskAssessmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
  }
  export type RiskAssessmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    inspection?: boolean | InspectionDefaultArgs<ExtArgs>
  }

  export type $RiskAssessmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RiskAssessment"
    objects: {
      case: Prisma.$CasePayload<ExtArgs>
      inspection: Prisma.$InspectionPayload<ExtArgs>
      operationalResponsePlans: Prisma.$OperationalResponsePlanPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      caseId: string
      inspectionId: string
      riskScore: number
      riskLevel: $Enums.RiskLevel
      priorityLevel: $Enums.PriorityLevel
      reasonCodes: Prisma.JsonValue
      reasons: Prisma.JsonValue
      assessmentVersion: string
      createdAt: Date
    }, ExtArgs["result"]["riskAssessment"]>
    composites: {}
  }

  type RiskAssessmentGetPayload<S extends boolean | null | undefined | RiskAssessmentDefaultArgs> = $Result.GetResult<Prisma.$RiskAssessmentPayload, S>

  type RiskAssessmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RiskAssessmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RiskAssessmentCountAggregateInputType | true
    }

  export interface RiskAssessmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RiskAssessment'], meta: { name: 'RiskAssessment' } }
    /**
     * Find zero or one RiskAssessment that matches the filter.
     * @param {RiskAssessmentFindUniqueArgs} args - Arguments to find a RiskAssessment
     * @example
     * // Get one RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RiskAssessmentFindUniqueArgs>(args: SelectSubset<T, RiskAssessmentFindUniqueArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RiskAssessment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RiskAssessmentFindUniqueOrThrowArgs} args - Arguments to find a RiskAssessment
     * @example
     * // Get one RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RiskAssessmentFindUniqueOrThrowArgs>(args: SelectSubset<T, RiskAssessmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RiskAssessment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentFindFirstArgs} args - Arguments to find a RiskAssessment
     * @example
     * // Get one RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RiskAssessmentFindFirstArgs>(args?: SelectSubset<T, RiskAssessmentFindFirstArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RiskAssessment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentFindFirstOrThrowArgs} args - Arguments to find a RiskAssessment
     * @example
     * // Get one RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RiskAssessmentFindFirstOrThrowArgs>(args?: SelectSubset<T, RiskAssessmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RiskAssessments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RiskAssessments
     * const riskAssessments = await prisma.riskAssessment.findMany()
     * 
     * // Get first 10 RiskAssessments
     * const riskAssessments = await prisma.riskAssessment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const riskAssessmentWithIdOnly = await prisma.riskAssessment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RiskAssessmentFindManyArgs>(args?: SelectSubset<T, RiskAssessmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RiskAssessment.
     * @param {RiskAssessmentCreateArgs} args - Arguments to create a RiskAssessment.
     * @example
     * // Create one RiskAssessment
     * const RiskAssessment = await prisma.riskAssessment.create({
     *   data: {
     *     // ... data to create a RiskAssessment
     *   }
     * })
     * 
     */
    create<T extends RiskAssessmentCreateArgs>(args: SelectSubset<T, RiskAssessmentCreateArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RiskAssessments.
     * @param {RiskAssessmentCreateManyArgs} args - Arguments to create many RiskAssessments.
     * @example
     * // Create many RiskAssessments
     * const riskAssessment = await prisma.riskAssessment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RiskAssessmentCreateManyArgs>(args?: SelectSubset<T, RiskAssessmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RiskAssessments and returns the data saved in the database.
     * @param {RiskAssessmentCreateManyAndReturnArgs} args - Arguments to create many RiskAssessments.
     * @example
     * // Create many RiskAssessments
     * const riskAssessment = await prisma.riskAssessment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RiskAssessments and only return the `id`
     * const riskAssessmentWithIdOnly = await prisma.riskAssessment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RiskAssessmentCreateManyAndReturnArgs>(args?: SelectSubset<T, RiskAssessmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RiskAssessment.
     * @param {RiskAssessmentDeleteArgs} args - Arguments to delete one RiskAssessment.
     * @example
     * // Delete one RiskAssessment
     * const RiskAssessment = await prisma.riskAssessment.delete({
     *   where: {
     *     // ... filter to delete one RiskAssessment
     *   }
     * })
     * 
     */
    delete<T extends RiskAssessmentDeleteArgs>(args: SelectSubset<T, RiskAssessmentDeleteArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RiskAssessment.
     * @param {RiskAssessmentUpdateArgs} args - Arguments to update one RiskAssessment.
     * @example
     * // Update one RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RiskAssessmentUpdateArgs>(args: SelectSubset<T, RiskAssessmentUpdateArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RiskAssessments.
     * @param {RiskAssessmentDeleteManyArgs} args - Arguments to filter RiskAssessments to delete.
     * @example
     * // Delete a few RiskAssessments
     * const { count } = await prisma.riskAssessment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RiskAssessmentDeleteManyArgs>(args?: SelectSubset<T, RiskAssessmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RiskAssessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RiskAssessments
     * const riskAssessment = await prisma.riskAssessment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RiskAssessmentUpdateManyArgs>(args: SelectSubset<T, RiskAssessmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RiskAssessments and returns the data updated in the database.
     * @param {RiskAssessmentUpdateManyAndReturnArgs} args - Arguments to update many RiskAssessments.
     * @example
     * // Update many RiskAssessments
     * const riskAssessment = await prisma.riskAssessment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RiskAssessments and only return the `id`
     * const riskAssessmentWithIdOnly = await prisma.riskAssessment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RiskAssessmentUpdateManyAndReturnArgs>(args: SelectSubset<T, RiskAssessmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RiskAssessment.
     * @param {RiskAssessmentUpsertArgs} args - Arguments to update or create a RiskAssessment.
     * @example
     * // Update or create a RiskAssessment
     * const riskAssessment = await prisma.riskAssessment.upsert({
     *   create: {
     *     // ... data to create a RiskAssessment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RiskAssessment we want to update
     *   }
     * })
     */
    upsert<T extends RiskAssessmentUpsertArgs>(args: SelectSubset<T, RiskAssessmentUpsertArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RiskAssessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentCountArgs} args - Arguments to filter RiskAssessments to count.
     * @example
     * // Count the number of RiskAssessments
     * const count = await prisma.riskAssessment.count({
     *   where: {
     *     // ... the filter for the RiskAssessments we want to count
     *   }
     * })
    **/
    count<T extends RiskAssessmentCountArgs>(
      args?: Subset<T, RiskAssessmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RiskAssessmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RiskAssessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RiskAssessmentAggregateArgs>(args: Subset<T, RiskAssessmentAggregateArgs>): Prisma.PrismaPromise<GetRiskAssessmentAggregateType<T>>

    /**
     * Group by RiskAssessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskAssessmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RiskAssessmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RiskAssessmentGroupByArgs['orderBy'] }
        : { orderBy?: RiskAssessmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RiskAssessmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRiskAssessmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RiskAssessment model
   */
  readonly fields: RiskAssessmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RiskAssessment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RiskAssessmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends CaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CaseDefaultArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    inspection<T extends InspectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InspectionDefaultArgs<ExtArgs>>): Prisma__InspectionClient<$Result.GetResult<Prisma.$InspectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    operationalResponsePlans<T extends RiskAssessment$operationalResponsePlansArgs<ExtArgs> = {}>(args?: Subset<T, RiskAssessment$operationalResponsePlansArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RiskAssessment model
   */
  interface RiskAssessmentFieldRefs {
    readonly id: FieldRef<"RiskAssessment", 'String'>
    readonly caseId: FieldRef<"RiskAssessment", 'String'>
    readonly inspectionId: FieldRef<"RiskAssessment", 'String'>
    readonly riskScore: FieldRef<"RiskAssessment", 'Int'>
    readonly riskLevel: FieldRef<"RiskAssessment", 'RiskLevel'>
    readonly priorityLevel: FieldRef<"RiskAssessment", 'PriorityLevel'>
    readonly reasonCodes: FieldRef<"RiskAssessment", 'Json'>
    readonly reasons: FieldRef<"RiskAssessment", 'Json'>
    readonly assessmentVersion: FieldRef<"RiskAssessment", 'String'>
    readonly createdAt: FieldRef<"RiskAssessment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RiskAssessment findUnique
   */
  export type RiskAssessmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter, which RiskAssessment to fetch.
     */
    where: RiskAssessmentWhereUniqueInput
  }

  /**
   * RiskAssessment findUniqueOrThrow
   */
  export type RiskAssessmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter, which RiskAssessment to fetch.
     */
    where: RiskAssessmentWhereUniqueInput
  }

  /**
   * RiskAssessment findFirst
   */
  export type RiskAssessmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter, which RiskAssessment to fetch.
     */
    where?: RiskAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskAssessments to fetch.
     */
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RiskAssessments.
     */
    cursor?: RiskAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RiskAssessments.
     */
    distinct?: RiskAssessmentScalarFieldEnum | RiskAssessmentScalarFieldEnum[]
  }

  /**
   * RiskAssessment findFirstOrThrow
   */
  export type RiskAssessmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter, which RiskAssessment to fetch.
     */
    where?: RiskAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskAssessments to fetch.
     */
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RiskAssessments.
     */
    cursor?: RiskAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RiskAssessments.
     */
    distinct?: RiskAssessmentScalarFieldEnum | RiskAssessmentScalarFieldEnum[]
  }

  /**
   * RiskAssessment findMany
   */
  export type RiskAssessmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter, which RiskAssessments to fetch.
     */
    where?: RiskAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskAssessments to fetch.
     */
    orderBy?: RiskAssessmentOrderByWithRelationInput | RiskAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RiskAssessments.
     */
    cursor?: RiskAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskAssessments.
     */
    skip?: number
    distinct?: RiskAssessmentScalarFieldEnum | RiskAssessmentScalarFieldEnum[]
  }

  /**
   * RiskAssessment create
   */
  export type RiskAssessmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * The data needed to create a RiskAssessment.
     */
    data: XOR<RiskAssessmentCreateInput, RiskAssessmentUncheckedCreateInput>
  }

  /**
   * RiskAssessment createMany
   */
  export type RiskAssessmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RiskAssessments.
     */
    data: RiskAssessmentCreateManyInput | RiskAssessmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RiskAssessment createManyAndReturn
   */
  export type RiskAssessmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * The data used to create many RiskAssessments.
     */
    data: RiskAssessmentCreateManyInput | RiskAssessmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RiskAssessment update
   */
  export type RiskAssessmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * The data needed to update a RiskAssessment.
     */
    data: XOR<RiskAssessmentUpdateInput, RiskAssessmentUncheckedUpdateInput>
    /**
     * Choose, which RiskAssessment to update.
     */
    where: RiskAssessmentWhereUniqueInput
  }

  /**
   * RiskAssessment updateMany
   */
  export type RiskAssessmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RiskAssessments.
     */
    data: XOR<RiskAssessmentUpdateManyMutationInput, RiskAssessmentUncheckedUpdateManyInput>
    /**
     * Filter which RiskAssessments to update
     */
    where?: RiskAssessmentWhereInput
    /**
     * Limit how many RiskAssessments to update.
     */
    limit?: number
  }

  /**
   * RiskAssessment updateManyAndReturn
   */
  export type RiskAssessmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * The data used to update RiskAssessments.
     */
    data: XOR<RiskAssessmentUpdateManyMutationInput, RiskAssessmentUncheckedUpdateManyInput>
    /**
     * Filter which RiskAssessments to update
     */
    where?: RiskAssessmentWhereInput
    /**
     * Limit how many RiskAssessments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RiskAssessment upsert
   */
  export type RiskAssessmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * The filter to search for the RiskAssessment to update in case it exists.
     */
    where: RiskAssessmentWhereUniqueInput
    /**
     * In case the RiskAssessment found by the `where` argument doesn't exist, create a new RiskAssessment with this data.
     */
    create: XOR<RiskAssessmentCreateInput, RiskAssessmentUncheckedCreateInput>
    /**
     * In case the RiskAssessment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RiskAssessmentUpdateInput, RiskAssessmentUncheckedUpdateInput>
  }

  /**
   * RiskAssessment delete
   */
  export type RiskAssessmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
    /**
     * Filter which RiskAssessment to delete.
     */
    where: RiskAssessmentWhereUniqueInput
  }

  /**
   * RiskAssessment deleteMany
   */
  export type RiskAssessmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RiskAssessments to delete
     */
    where?: RiskAssessmentWhereInput
    /**
     * Limit how many RiskAssessments to delete.
     */
    limit?: number
  }

  /**
   * RiskAssessment.operationalResponsePlans
   */
  export type RiskAssessment$operationalResponsePlansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    where?: OperationalResponsePlanWhereInput
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    cursor?: OperationalResponsePlanWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OperationalResponsePlanScalarFieldEnum | OperationalResponsePlanScalarFieldEnum[]
  }

  /**
   * RiskAssessment without action
   */
  export type RiskAssessmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskAssessment
     */
    select?: RiskAssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskAssessment
     */
    omit?: RiskAssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RiskAssessmentInclude<ExtArgs> | null
  }


  /**
   * Model OperationalResponsePlan
   */

  export type AggregateOperationalResponsePlan = {
    _count: OperationalResponsePlanCountAggregateOutputType | null
    _avg: OperationalResponsePlanAvgAggregateOutputType | null
    _sum: OperationalResponsePlanSumAggregateOutputType | null
    _min: OperationalResponsePlanMinAggregateOutputType | null
    _max: OperationalResponsePlanMaxAggregateOutputType | null
  }

  export type OperationalResponsePlanAvgAggregateOutputType = {
    versionNumber: number | null
  }

  export type OperationalResponsePlanSumAggregateOutputType = {
    versionNumber: number | null
  }

  export type OperationalResponsePlanMinAggregateOutputType = {
    id: string | null
    caseId: string | null
    riskAssessmentId: string | null
    versionNumber: number | null
    status: string | null
    urgency: string | null
    planVersion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperationalResponsePlanMaxAggregateOutputType = {
    id: string | null
    caseId: string | null
    riskAssessmentId: string | null
    versionNumber: number | null
    status: string | null
    urgency: string | null
    planVersion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OperationalResponsePlanCountAggregateOutputType = {
    id: number
    caseId: number
    riskAssessmentId: number
    versionNumber: number
    status: number
    urgency: number
    recommendedActionCodes: number
    temporaryMeasures: number
    reasons: number
    alternativeActionCodes: number
    planVersion: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OperationalResponsePlanAvgAggregateInputType = {
    versionNumber?: true
  }

  export type OperationalResponsePlanSumAggregateInputType = {
    versionNumber?: true
  }

  export type OperationalResponsePlanMinAggregateInputType = {
    id?: true
    caseId?: true
    riskAssessmentId?: true
    versionNumber?: true
    status?: true
    urgency?: true
    planVersion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperationalResponsePlanMaxAggregateInputType = {
    id?: true
    caseId?: true
    riskAssessmentId?: true
    versionNumber?: true
    status?: true
    urgency?: true
    planVersion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OperationalResponsePlanCountAggregateInputType = {
    id?: true
    caseId?: true
    riskAssessmentId?: true
    versionNumber?: true
    status?: true
    urgency?: true
    recommendedActionCodes?: true
    temporaryMeasures?: true
    reasons?: true
    alternativeActionCodes?: true
    planVersion?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OperationalResponsePlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalResponsePlan to aggregate.
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalResponsePlans to fetch.
     */
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OperationalResponsePlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalResponsePlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalResponsePlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OperationalResponsePlans
    **/
    _count?: true | OperationalResponsePlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OperationalResponsePlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OperationalResponsePlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OperationalResponsePlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OperationalResponsePlanMaxAggregateInputType
  }

  export type GetOperationalResponsePlanAggregateType<T extends OperationalResponsePlanAggregateArgs> = {
        [P in keyof T & keyof AggregateOperationalResponsePlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOperationalResponsePlan[P]>
      : GetScalarType<T[P], AggregateOperationalResponsePlan[P]>
  }




  export type OperationalResponsePlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OperationalResponsePlanWhereInput
    orderBy?: OperationalResponsePlanOrderByWithAggregationInput | OperationalResponsePlanOrderByWithAggregationInput[]
    by: OperationalResponsePlanScalarFieldEnum[] | OperationalResponsePlanScalarFieldEnum
    having?: OperationalResponsePlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OperationalResponsePlanCountAggregateInputType | true
    _avg?: OperationalResponsePlanAvgAggregateInputType
    _sum?: OperationalResponsePlanSumAggregateInputType
    _min?: OperationalResponsePlanMinAggregateInputType
    _max?: OperationalResponsePlanMaxAggregateInputType
  }

  export type OperationalResponsePlanGroupByOutputType = {
    id: string
    caseId: string
    riskAssessmentId: string
    versionNumber: number
    status: string
    urgency: string
    recommendedActionCodes: JsonValue
    temporaryMeasures: JsonValue
    reasons: JsonValue
    alternativeActionCodes: JsonValue
    planVersion: string
    createdAt: Date
    updatedAt: Date
    _count: OperationalResponsePlanCountAggregateOutputType | null
    _avg: OperationalResponsePlanAvgAggregateOutputType | null
    _sum: OperationalResponsePlanSumAggregateOutputType | null
    _min: OperationalResponsePlanMinAggregateOutputType | null
    _max: OperationalResponsePlanMaxAggregateOutputType | null
  }

  type GetOperationalResponsePlanGroupByPayload<T extends OperationalResponsePlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OperationalResponsePlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OperationalResponsePlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OperationalResponsePlanGroupByOutputType[P]>
            : GetScalarType<T[P], OperationalResponsePlanGroupByOutputType[P]>
        }
      >
    >


  export type OperationalResponsePlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    riskAssessmentId?: boolean
    versionNumber?: boolean
    status?: boolean
    urgency?: boolean
    recommendedActionCodes?: boolean
    temporaryMeasures?: boolean
    reasons?: boolean
    alternativeActionCodes?: boolean
    planVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
    decisions?: boolean | OperationalResponsePlan$decisionsArgs<ExtArgs>
    _count?: boolean | OperationalResponsePlanCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalResponsePlan"]>

  export type OperationalResponsePlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    riskAssessmentId?: boolean
    versionNumber?: boolean
    status?: boolean
    urgency?: boolean
    recommendedActionCodes?: boolean
    temporaryMeasures?: boolean
    reasons?: boolean
    alternativeActionCodes?: boolean
    planVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalResponsePlan"]>

  export type OperationalResponsePlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    riskAssessmentId?: boolean
    versionNumber?: boolean
    status?: boolean
    urgency?: boolean
    recommendedActionCodes?: boolean
    temporaryMeasures?: boolean
    reasons?: boolean
    alternativeActionCodes?: boolean
    planVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["operationalResponsePlan"]>

  export type OperationalResponsePlanSelectScalar = {
    id?: boolean
    caseId?: boolean
    riskAssessmentId?: boolean
    versionNumber?: boolean
    status?: boolean
    urgency?: boolean
    recommendedActionCodes?: boolean
    temporaryMeasures?: boolean
    reasons?: boolean
    alternativeActionCodes?: boolean
    planVersion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OperationalResponsePlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "caseId" | "riskAssessmentId" | "versionNumber" | "status" | "urgency" | "recommendedActionCodes" | "temporaryMeasures" | "reasons" | "alternativeActionCodes" | "planVersion" | "createdAt" | "updatedAt", ExtArgs["result"]["operationalResponsePlan"]>
  export type OperationalResponsePlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
    decisions?: boolean | OperationalResponsePlan$decisionsArgs<ExtArgs>
    _count?: boolean | OperationalResponsePlanCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OperationalResponsePlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
  }
  export type OperationalResponsePlanIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    riskAssessment?: boolean | RiskAssessmentDefaultArgs<ExtArgs>
  }

  export type $OperationalResponsePlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OperationalResponsePlan"
    objects: {
      case: Prisma.$CasePayload<ExtArgs>
      riskAssessment: Prisma.$RiskAssessmentPayload<ExtArgs>
      decisions: Prisma.$OrpDecisionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      caseId: string
      riskAssessmentId: string
      versionNumber: number
      status: string
      urgency: string
      recommendedActionCodes: Prisma.JsonValue
      temporaryMeasures: Prisma.JsonValue
      reasons: Prisma.JsonValue
      alternativeActionCodes: Prisma.JsonValue
      planVersion: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["operationalResponsePlan"]>
    composites: {}
  }

  type OperationalResponsePlanGetPayload<S extends boolean | null | undefined | OperationalResponsePlanDefaultArgs> = $Result.GetResult<Prisma.$OperationalResponsePlanPayload, S>

  type OperationalResponsePlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OperationalResponsePlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OperationalResponsePlanCountAggregateInputType | true
    }

  export interface OperationalResponsePlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OperationalResponsePlan'], meta: { name: 'OperationalResponsePlan' } }
    /**
     * Find zero or one OperationalResponsePlan that matches the filter.
     * @param {OperationalResponsePlanFindUniqueArgs} args - Arguments to find a OperationalResponsePlan
     * @example
     * // Get one OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OperationalResponsePlanFindUniqueArgs>(args: SelectSubset<T, OperationalResponsePlanFindUniqueArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OperationalResponsePlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OperationalResponsePlanFindUniqueOrThrowArgs} args - Arguments to find a OperationalResponsePlan
     * @example
     * // Get one OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OperationalResponsePlanFindUniqueOrThrowArgs>(args: SelectSubset<T, OperationalResponsePlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OperationalResponsePlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanFindFirstArgs} args - Arguments to find a OperationalResponsePlan
     * @example
     * // Get one OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OperationalResponsePlanFindFirstArgs>(args?: SelectSubset<T, OperationalResponsePlanFindFirstArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OperationalResponsePlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanFindFirstOrThrowArgs} args - Arguments to find a OperationalResponsePlan
     * @example
     * // Get one OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OperationalResponsePlanFindFirstOrThrowArgs>(args?: SelectSubset<T, OperationalResponsePlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OperationalResponsePlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OperationalResponsePlans
     * const operationalResponsePlans = await prisma.operationalResponsePlan.findMany()
     * 
     * // Get first 10 OperationalResponsePlans
     * const operationalResponsePlans = await prisma.operationalResponsePlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const operationalResponsePlanWithIdOnly = await prisma.operationalResponsePlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OperationalResponsePlanFindManyArgs>(args?: SelectSubset<T, OperationalResponsePlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OperationalResponsePlan.
     * @param {OperationalResponsePlanCreateArgs} args - Arguments to create a OperationalResponsePlan.
     * @example
     * // Create one OperationalResponsePlan
     * const OperationalResponsePlan = await prisma.operationalResponsePlan.create({
     *   data: {
     *     // ... data to create a OperationalResponsePlan
     *   }
     * })
     * 
     */
    create<T extends OperationalResponsePlanCreateArgs>(args: SelectSubset<T, OperationalResponsePlanCreateArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OperationalResponsePlans.
     * @param {OperationalResponsePlanCreateManyArgs} args - Arguments to create many OperationalResponsePlans.
     * @example
     * // Create many OperationalResponsePlans
     * const operationalResponsePlan = await prisma.operationalResponsePlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OperationalResponsePlanCreateManyArgs>(args?: SelectSubset<T, OperationalResponsePlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OperationalResponsePlans and returns the data saved in the database.
     * @param {OperationalResponsePlanCreateManyAndReturnArgs} args - Arguments to create many OperationalResponsePlans.
     * @example
     * // Create many OperationalResponsePlans
     * const operationalResponsePlan = await prisma.operationalResponsePlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OperationalResponsePlans and only return the `id`
     * const operationalResponsePlanWithIdOnly = await prisma.operationalResponsePlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OperationalResponsePlanCreateManyAndReturnArgs>(args?: SelectSubset<T, OperationalResponsePlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OperationalResponsePlan.
     * @param {OperationalResponsePlanDeleteArgs} args - Arguments to delete one OperationalResponsePlan.
     * @example
     * // Delete one OperationalResponsePlan
     * const OperationalResponsePlan = await prisma.operationalResponsePlan.delete({
     *   where: {
     *     // ... filter to delete one OperationalResponsePlan
     *   }
     * })
     * 
     */
    delete<T extends OperationalResponsePlanDeleteArgs>(args: SelectSubset<T, OperationalResponsePlanDeleteArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OperationalResponsePlan.
     * @param {OperationalResponsePlanUpdateArgs} args - Arguments to update one OperationalResponsePlan.
     * @example
     * // Update one OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OperationalResponsePlanUpdateArgs>(args: SelectSubset<T, OperationalResponsePlanUpdateArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OperationalResponsePlans.
     * @param {OperationalResponsePlanDeleteManyArgs} args - Arguments to filter OperationalResponsePlans to delete.
     * @example
     * // Delete a few OperationalResponsePlans
     * const { count } = await prisma.operationalResponsePlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OperationalResponsePlanDeleteManyArgs>(args?: SelectSubset<T, OperationalResponsePlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OperationalResponsePlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OperationalResponsePlans
     * const operationalResponsePlan = await prisma.operationalResponsePlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OperationalResponsePlanUpdateManyArgs>(args: SelectSubset<T, OperationalResponsePlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OperationalResponsePlans and returns the data updated in the database.
     * @param {OperationalResponsePlanUpdateManyAndReturnArgs} args - Arguments to update many OperationalResponsePlans.
     * @example
     * // Update many OperationalResponsePlans
     * const operationalResponsePlan = await prisma.operationalResponsePlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OperationalResponsePlans and only return the `id`
     * const operationalResponsePlanWithIdOnly = await prisma.operationalResponsePlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OperationalResponsePlanUpdateManyAndReturnArgs>(args: SelectSubset<T, OperationalResponsePlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OperationalResponsePlan.
     * @param {OperationalResponsePlanUpsertArgs} args - Arguments to update or create a OperationalResponsePlan.
     * @example
     * // Update or create a OperationalResponsePlan
     * const operationalResponsePlan = await prisma.operationalResponsePlan.upsert({
     *   create: {
     *     // ... data to create a OperationalResponsePlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OperationalResponsePlan we want to update
     *   }
     * })
     */
    upsert<T extends OperationalResponsePlanUpsertArgs>(args: SelectSubset<T, OperationalResponsePlanUpsertArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OperationalResponsePlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanCountArgs} args - Arguments to filter OperationalResponsePlans to count.
     * @example
     * // Count the number of OperationalResponsePlans
     * const count = await prisma.operationalResponsePlan.count({
     *   where: {
     *     // ... the filter for the OperationalResponsePlans we want to count
     *   }
     * })
    **/
    count<T extends OperationalResponsePlanCountArgs>(
      args?: Subset<T, OperationalResponsePlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OperationalResponsePlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OperationalResponsePlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OperationalResponsePlanAggregateArgs>(args: Subset<T, OperationalResponsePlanAggregateArgs>): Prisma.PrismaPromise<GetOperationalResponsePlanAggregateType<T>>

    /**
     * Group by OperationalResponsePlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OperationalResponsePlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OperationalResponsePlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OperationalResponsePlanGroupByArgs['orderBy'] }
        : { orderBy?: OperationalResponsePlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OperationalResponsePlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOperationalResponsePlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OperationalResponsePlan model
   */
  readonly fields: OperationalResponsePlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OperationalResponsePlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OperationalResponsePlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends CaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CaseDefaultArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    riskAssessment<T extends RiskAssessmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RiskAssessmentDefaultArgs<ExtArgs>>): Prisma__RiskAssessmentClient<$Result.GetResult<Prisma.$RiskAssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    decisions<T extends OperationalResponsePlan$decisionsArgs<ExtArgs> = {}>(args?: Subset<T, OperationalResponsePlan$decisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OperationalResponsePlan model
   */
  interface OperationalResponsePlanFieldRefs {
    readonly id: FieldRef<"OperationalResponsePlan", 'String'>
    readonly caseId: FieldRef<"OperationalResponsePlan", 'String'>
    readonly riskAssessmentId: FieldRef<"OperationalResponsePlan", 'String'>
    readonly versionNumber: FieldRef<"OperationalResponsePlan", 'Int'>
    readonly status: FieldRef<"OperationalResponsePlan", 'String'>
    readonly urgency: FieldRef<"OperationalResponsePlan", 'String'>
    readonly recommendedActionCodes: FieldRef<"OperationalResponsePlan", 'Json'>
    readonly temporaryMeasures: FieldRef<"OperationalResponsePlan", 'Json'>
    readonly reasons: FieldRef<"OperationalResponsePlan", 'Json'>
    readonly alternativeActionCodes: FieldRef<"OperationalResponsePlan", 'Json'>
    readonly planVersion: FieldRef<"OperationalResponsePlan", 'String'>
    readonly createdAt: FieldRef<"OperationalResponsePlan", 'DateTime'>
    readonly updatedAt: FieldRef<"OperationalResponsePlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OperationalResponsePlan findUnique
   */
  export type OperationalResponsePlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter, which OperationalResponsePlan to fetch.
     */
    where: OperationalResponsePlanWhereUniqueInput
  }

  /**
   * OperationalResponsePlan findUniqueOrThrow
   */
  export type OperationalResponsePlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter, which OperationalResponsePlan to fetch.
     */
    where: OperationalResponsePlanWhereUniqueInput
  }

  /**
   * OperationalResponsePlan findFirst
   */
  export type OperationalResponsePlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter, which OperationalResponsePlan to fetch.
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalResponsePlans to fetch.
     */
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalResponsePlans.
     */
    cursor?: OperationalResponsePlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalResponsePlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalResponsePlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalResponsePlans.
     */
    distinct?: OperationalResponsePlanScalarFieldEnum | OperationalResponsePlanScalarFieldEnum[]
  }

  /**
   * OperationalResponsePlan findFirstOrThrow
   */
  export type OperationalResponsePlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter, which OperationalResponsePlan to fetch.
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalResponsePlans to fetch.
     */
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OperationalResponsePlans.
     */
    cursor?: OperationalResponsePlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalResponsePlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalResponsePlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OperationalResponsePlans.
     */
    distinct?: OperationalResponsePlanScalarFieldEnum | OperationalResponsePlanScalarFieldEnum[]
  }

  /**
   * OperationalResponsePlan findMany
   */
  export type OperationalResponsePlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter, which OperationalResponsePlans to fetch.
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OperationalResponsePlans to fetch.
     */
    orderBy?: OperationalResponsePlanOrderByWithRelationInput | OperationalResponsePlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OperationalResponsePlans.
     */
    cursor?: OperationalResponsePlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OperationalResponsePlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OperationalResponsePlans.
     */
    skip?: number
    distinct?: OperationalResponsePlanScalarFieldEnum | OperationalResponsePlanScalarFieldEnum[]
  }

  /**
   * OperationalResponsePlan create
   */
  export type OperationalResponsePlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * The data needed to create a OperationalResponsePlan.
     */
    data: XOR<OperationalResponsePlanCreateInput, OperationalResponsePlanUncheckedCreateInput>
  }

  /**
   * OperationalResponsePlan createMany
   */
  export type OperationalResponsePlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OperationalResponsePlans.
     */
    data: OperationalResponsePlanCreateManyInput | OperationalResponsePlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OperationalResponsePlan createManyAndReturn
   */
  export type OperationalResponsePlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * The data used to create many OperationalResponsePlans.
     */
    data: OperationalResponsePlanCreateManyInput | OperationalResponsePlanCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OperationalResponsePlan update
   */
  export type OperationalResponsePlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * The data needed to update a OperationalResponsePlan.
     */
    data: XOR<OperationalResponsePlanUpdateInput, OperationalResponsePlanUncheckedUpdateInput>
    /**
     * Choose, which OperationalResponsePlan to update.
     */
    where: OperationalResponsePlanWhereUniqueInput
  }

  /**
   * OperationalResponsePlan updateMany
   */
  export type OperationalResponsePlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OperationalResponsePlans.
     */
    data: XOR<OperationalResponsePlanUpdateManyMutationInput, OperationalResponsePlanUncheckedUpdateManyInput>
    /**
     * Filter which OperationalResponsePlans to update
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * Limit how many OperationalResponsePlans to update.
     */
    limit?: number
  }

  /**
   * OperationalResponsePlan updateManyAndReturn
   */
  export type OperationalResponsePlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * The data used to update OperationalResponsePlans.
     */
    data: XOR<OperationalResponsePlanUpdateManyMutationInput, OperationalResponsePlanUncheckedUpdateManyInput>
    /**
     * Filter which OperationalResponsePlans to update
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * Limit how many OperationalResponsePlans to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OperationalResponsePlan upsert
   */
  export type OperationalResponsePlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * The filter to search for the OperationalResponsePlan to update in case it exists.
     */
    where: OperationalResponsePlanWhereUniqueInput
    /**
     * In case the OperationalResponsePlan found by the `where` argument doesn't exist, create a new OperationalResponsePlan with this data.
     */
    create: XOR<OperationalResponsePlanCreateInput, OperationalResponsePlanUncheckedCreateInput>
    /**
     * In case the OperationalResponsePlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OperationalResponsePlanUpdateInput, OperationalResponsePlanUncheckedUpdateInput>
  }

  /**
   * OperationalResponsePlan delete
   */
  export type OperationalResponsePlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
    /**
     * Filter which OperationalResponsePlan to delete.
     */
    where: OperationalResponsePlanWhereUniqueInput
  }

  /**
   * OperationalResponsePlan deleteMany
   */
  export type OperationalResponsePlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OperationalResponsePlans to delete
     */
    where?: OperationalResponsePlanWhereInput
    /**
     * Limit how many OperationalResponsePlans to delete.
     */
    limit?: number
  }

  /**
   * OperationalResponsePlan.decisions
   */
  export type OperationalResponsePlan$decisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    cursor?: OrpDecisionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * OperationalResponsePlan without action
   */
  export type OperationalResponsePlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OperationalResponsePlan
     */
    select?: OperationalResponsePlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OperationalResponsePlan
     */
    omit?: OperationalResponsePlanOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OperationalResponsePlanInclude<ExtArgs> | null
  }


  /**
   * Model ApprovalAuthority
   */

  export type AggregateApprovalAuthority = {
    _count: ApprovalAuthorityCountAggregateOutputType | null
    _min: ApprovalAuthorityMinAggregateOutputType | null
    _max: ApprovalAuthorityMaxAggregateOutputType | null
  }

  export type ApprovalAuthorityMinAggregateOutputType = {
    id: string | null
    userId: string | null
    departmentId: string | null
    jurisdictionId: string | null
    canApprove: boolean | null
    canReject: boolean | null
    canRequestModification: boolean | null
    canRequestReinspection: boolean | null
    canEscalate: boolean | null
    maxPriorityLevel: $Enums.PriorityLevel | null
    isActive: boolean | null
    validFrom: Date | null
    validUntil: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApprovalAuthorityMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    departmentId: string | null
    jurisdictionId: string | null
    canApprove: boolean | null
    canReject: boolean | null
    canRequestModification: boolean | null
    canRequestReinspection: boolean | null
    canEscalate: boolean | null
    maxPriorityLevel: $Enums.PriorityLevel | null
    isActive: boolean | null
    validFrom: Date | null
    validUntil: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApprovalAuthorityCountAggregateOutputType = {
    id: number
    userId: number
    departmentId: number
    jurisdictionId: number
    canApprove: number
    canReject: number
    canRequestModification: number
    canRequestReinspection: number
    canEscalate: number
    maxPriorityLevel: number
    isActive: number
    validFrom: number
    validUntil: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ApprovalAuthorityMinAggregateInputType = {
    id?: true
    userId?: true
    departmentId?: true
    jurisdictionId?: true
    canApprove?: true
    canReject?: true
    canRequestModification?: true
    canRequestReinspection?: true
    canEscalate?: true
    maxPriorityLevel?: true
    isActive?: true
    validFrom?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApprovalAuthorityMaxAggregateInputType = {
    id?: true
    userId?: true
    departmentId?: true
    jurisdictionId?: true
    canApprove?: true
    canReject?: true
    canRequestModification?: true
    canRequestReinspection?: true
    canEscalate?: true
    maxPriorityLevel?: true
    isActive?: true
    validFrom?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApprovalAuthorityCountAggregateInputType = {
    id?: true
    userId?: true
    departmentId?: true
    jurisdictionId?: true
    canApprove?: true
    canReject?: true
    canRequestModification?: true
    canRequestReinspection?: true
    canEscalate?: true
    maxPriorityLevel?: true
    isActive?: true
    validFrom?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ApprovalAuthorityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApprovalAuthority to aggregate.
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApprovalAuthorities to fetch.
     */
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApprovalAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApprovalAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApprovalAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApprovalAuthorities
    **/
    _count?: true | ApprovalAuthorityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApprovalAuthorityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApprovalAuthorityMaxAggregateInputType
  }

  export type GetApprovalAuthorityAggregateType<T extends ApprovalAuthorityAggregateArgs> = {
        [P in keyof T & keyof AggregateApprovalAuthority]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApprovalAuthority[P]>
      : GetScalarType<T[P], AggregateApprovalAuthority[P]>
  }




  export type ApprovalAuthorityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApprovalAuthorityWhereInput
    orderBy?: ApprovalAuthorityOrderByWithAggregationInput | ApprovalAuthorityOrderByWithAggregationInput[]
    by: ApprovalAuthorityScalarFieldEnum[] | ApprovalAuthorityScalarFieldEnum
    having?: ApprovalAuthorityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApprovalAuthorityCountAggregateInputType | true
    _min?: ApprovalAuthorityMinAggregateInputType
    _max?: ApprovalAuthorityMaxAggregateInputType
  }

  export type ApprovalAuthorityGroupByOutputType = {
    id: string
    userId: string
    departmentId: string
    jurisdictionId: string
    canApprove: boolean
    canReject: boolean
    canRequestModification: boolean
    canRequestReinspection: boolean
    canEscalate: boolean
    maxPriorityLevel: $Enums.PriorityLevel | null
    isActive: boolean
    validFrom: Date | null
    validUntil: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ApprovalAuthorityCountAggregateOutputType | null
    _min: ApprovalAuthorityMinAggregateOutputType | null
    _max: ApprovalAuthorityMaxAggregateOutputType | null
  }

  type GetApprovalAuthorityGroupByPayload<T extends ApprovalAuthorityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApprovalAuthorityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApprovalAuthorityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApprovalAuthorityGroupByOutputType[P]>
            : GetScalarType<T[P], ApprovalAuthorityGroupByOutputType[P]>
        }
      >
    >


  export type ApprovalAuthoritySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: boolean
    isActive?: boolean
    validFrom?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    decisions?: boolean | ApprovalAuthority$decisionsArgs<ExtArgs>
    _count?: boolean | ApprovalAuthorityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["approvalAuthority"]>

  export type ApprovalAuthoritySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: boolean
    isActive?: boolean
    validFrom?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["approvalAuthority"]>

  export type ApprovalAuthoritySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: boolean
    isActive?: boolean
    validFrom?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["approvalAuthority"]>

  export type ApprovalAuthoritySelectScalar = {
    id?: boolean
    userId?: boolean
    departmentId?: boolean
    jurisdictionId?: boolean
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: boolean
    isActive?: boolean
    validFrom?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ApprovalAuthorityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "departmentId" | "jurisdictionId" | "canApprove" | "canReject" | "canRequestModification" | "canRequestReinspection" | "canEscalate" | "maxPriorityLevel" | "isActive" | "validFrom" | "validUntil" | "createdAt" | "updatedAt", ExtArgs["result"]["approvalAuthority"]>
  export type ApprovalAuthorityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
    decisions?: boolean | ApprovalAuthority$decisionsArgs<ExtArgs>
    _count?: boolean | ApprovalAuthorityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApprovalAuthorityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }
  export type ApprovalAuthorityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    department?: boolean | DepartmentDefaultArgs<ExtArgs>
    jurisdiction?: boolean | JurisdictionDefaultArgs<ExtArgs>
  }

  export type $ApprovalAuthorityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApprovalAuthority"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      department: Prisma.$DepartmentPayload<ExtArgs>
      jurisdiction: Prisma.$JurisdictionPayload<ExtArgs>
      decisions: Prisma.$OrpDecisionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      departmentId: string
      jurisdictionId: string
      canApprove: boolean
      canReject: boolean
      canRequestModification: boolean
      canRequestReinspection: boolean
      canEscalate: boolean
      maxPriorityLevel: $Enums.PriorityLevel | null
      isActive: boolean
      validFrom: Date | null
      validUntil: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["approvalAuthority"]>
    composites: {}
  }

  type ApprovalAuthorityGetPayload<S extends boolean | null | undefined | ApprovalAuthorityDefaultArgs> = $Result.GetResult<Prisma.$ApprovalAuthorityPayload, S>

  type ApprovalAuthorityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApprovalAuthorityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApprovalAuthorityCountAggregateInputType | true
    }

  export interface ApprovalAuthorityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApprovalAuthority'], meta: { name: 'ApprovalAuthority' } }
    /**
     * Find zero or one ApprovalAuthority that matches the filter.
     * @param {ApprovalAuthorityFindUniqueArgs} args - Arguments to find a ApprovalAuthority
     * @example
     * // Get one ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApprovalAuthorityFindUniqueArgs>(args: SelectSubset<T, ApprovalAuthorityFindUniqueArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApprovalAuthority that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApprovalAuthorityFindUniqueOrThrowArgs} args - Arguments to find a ApprovalAuthority
     * @example
     * // Get one ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApprovalAuthorityFindUniqueOrThrowArgs>(args: SelectSubset<T, ApprovalAuthorityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApprovalAuthority that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityFindFirstArgs} args - Arguments to find a ApprovalAuthority
     * @example
     * // Get one ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApprovalAuthorityFindFirstArgs>(args?: SelectSubset<T, ApprovalAuthorityFindFirstArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApprovalAuthority that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityFindFirstOrThrowArgs} args - Arguments to find a ApprovalAuthority
     * @example
     * // Get one ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApprovalAuthorityFindFirstOrThrowArgs>(args?: SelectSubset<T, ApprovalAuthorityFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApprovalAuthorities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApprovalAuthorities
     * const approvalAuthorities = await prisma.approvalAuthority.findMany()
     * 
     * // Get first 10 ApprovalAuthorities
     * const approvalAuthorities = await prisma.approvalAuthority.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const approvalAuthorityWithIdOnly = await prisma.approvalAuthority.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApprovalAuthorityFindManyArgs>(args?: SelectSubset<T, ApprovalAuthorityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApprovalAuthority.
     * @param {ApprovalAuthorityCreateArgs} args - Arguments to create a ApprovalAuthority.
     * @example
     * // Create one ApprovalAuthority
     * const ApprovalAuthority = await prisma.approvalAuthority.create({
     *   data: {
     *     // ... data to create a ApprovalAuthority
     *   }
     * })
     * 
     */
    create<T extends ApprovalAuthorityCreateArgs>(args: SelectSubset<T, ApprovalAuthorityCreateArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApprovalAuthorities.
     * @param {ApprovalAuthorityCreateManyArgs} args - Arguments to create many ApprovalAuthorities.
     * @example
     * // Create many ApprovalAuthorities
     * const approvalAuthority = await prisma.approvalAuthority.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApprovalAuthorityCreateManyArgs>(args?: SelectSubset<T, ApprovalAuthorityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApprovalAuthorities and returns the data saved in the database.
     * @param {ApprovalAuthorityCreateManyAndReturnArgs} args - Arguments to create many ApprovalAuthorities.
     * @example
     * // Create many ApprovalAuthorities
     * const approvalAuthority = await prisma.approvalAuthority.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApprovalAuthorities and only return the `id`
     * const approvalAuthorityWithIdOnly = await prisma.approvalAuthority.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApprovalAuthorityCreateManyAndReturnArgs>(args?: SelectSubset<T, ApprovalAuthorityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApprovalAuthority.
     * @param {ApprovalAuthorityDeleteArgs} args - Arguments to delete one ApprovalAuthority.
     * @example
     * // Delete one ApprovalAuthority
     * const ApprovalAuthority = await prisma.approvalAuthority.delete({
     *   where: {
     *     // ... filter to delete one ApprovalAuthority
     *   }
     * })
     * 
     */
    delete<T extends ApprovalAuthorityDeleteArgs>(args: SelectSubset<T, ApprovalAuthorityDeleteArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApprovalAuthority.
     * @param {ApprovalAuthorityUpdateArgs} args - Arguments to update one ApprovalAuthority.
     * @example
     * // Update one ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApprovalAuthorityUpdateArgs>(args: SelectSubset<T, ApprovalAuthorityUpdateArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApprovalAuthorities.
     * @param {ApprovalAuthorityDeleteManyArgs} args - Arguments to filter ApprovalAuthorities to delete.
     * @example
     * // Delete a few ApprovalAuthorities
     * const { count } = await prisma.approvalAuthority.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApprovalAuthorityDeleteManyArgs>(args?: SelectSubset<T, ApprovalAuthorityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApprovalAuthorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApprovalAuthorities
     * const approvalAuthority = await prisma.approvalAuthority.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApprovalAuthorityUpdateManyArgs>(args: SelectSubset<T, ApprovalAuthorityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApprovalAuthorities and returns the data updated in the database.
     * @param {ApprovalAuthorityUpdateManyAndReturnArgs} args - Arguments to update many ApprovalAuthorities.
     * @example
     * // Update many ApprovalAuthorities
     * const approvalAuthority = await prisma.approvalAuthority.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApprovalAuthorities and only return the `id`
     * const approvalAuthorityWithIdOnly = await prisma.approvalAuthority.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApprovalAuthorityUpdateManyAndReturnArgs>(args: SelectSubset<T, ApprovalAuthorityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApprovalAuthority.
     * @param {ApprovalAuthorityUpsertArgs} args - Arguments to update or create a ApprovalAuthority.
     * @example
     * // Update or create a ApprovalAuthority
     * const approvalAuthority = await prisma.approvalAuthority.upsert({
     *   create: {
     *     // ... data to create a ApprovalAuthority
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApprovalAuthority we want to update
     *   }
     * })
     */
    upsert<T extends ApprovalAuthorityUpsertArgs>(args: SelectSubset<T, ApprovalAuthorityUpsertArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApprovalAuthorities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityCountArgs} args - Arguments to filter ApprovalAuthorities to count.
     * @example
     * // Count the number of ApprovalAuthorities
     * const count = await prisma.approvalAuthority.count({
     *   where: {
     *     // ... the filter for the ApprovalAuthorities we want to count
     *   }
     * })
    **/
    count<T extends ApprovalAuthorityCountArgs>(
      args?: Subset<T, ApprovalAuthorityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApprovalAuthorityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApprovalAuthority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApprovalAuthorityAggregateArgs>(args: Subset<T, ApprovalAuthorityAggregateArgs>): Prisma.PrismaPromise<GetApprovalAuthorityAggregateType<T>>

    /**
     * Group by ApprovalAuthority.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApprovalAuthorityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApprovalAuthorityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApprovalAuthorityGroupByArgs['orderBy'] }
        : { orderBy?: ApprovalAuthorityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApprovalAuthorityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApprovalAuthorityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApprovalAuthority model
   */
  readonly fields: ApprovalAuthorityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApprovalAuthority.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApprovalAuthorityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    department<T extends DepartmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DepartmentDefaultArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    jurisdiction<T extends JurisdictionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JurisdictionDefaultArgs<ExtArgs>>): Prisma__JurisdictionClient<$Result.GetResult<Prisma.$JurisdictionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    decisions<T extends ApprovalAuthority$decisionsArgs<ExtArgs> = {}>(args?: Subset<T, ApprovalAuthority$decisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApprovalAuthority model
   */
  interface ApprovalAuthorityFieldRefs {
    readonly id: FieldRef<"ApprovalAuthority", 'String'>
    readonly userId: FieldRef<"ApprovalAuthority", 'String'>
    readonly departmentId: FieldRef<"ApprovalAuthority", 'String'>
    readonly jurisdictionId: FieldRef<"ApprovalAuthority", 'String'>
    readonly canApprove: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly canReject: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly canRequestModification: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly canRequestReinspection: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly canEscalate: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly maxPriorityLevel: FieldRef<"ApprovalAuthority", 'PriorityLevel'>
    readonly isActive: FieldRef<"ApprovalAuthority", 'Boolean'>
    readonly validFrom: FieldRef<"ApprovalAuthority", 'DateTime'>
    readonly validUntil: FieldRef<"ApprovalAuthority", 'DateTime'>
    readonly createdAt: FieldRef<"ApprovalAuthority", 'DateTime'>
    readonly updatedAt: FieldRef<"ApprovalAuthority", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApprovalAuthority findUnique
   */
  export type ApprovalAuthorityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which ApprovalAuthority to fetch.
     */
    where: ApprovalAuthorityWhereUniqueInput
  }

  /**
   * ApprovalAuthority findUniqueOrThrow
   */
  export type ApprovalAuthorityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which ApprovalAuthority to fetch.
     */
    where: ApprovalAuthorityWhereUniqueInput
  }

  /**
   * ApprovalAuthority findFirst
   */
  export type ApprovalAuthorityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which ApprovalAuthority to fetch.
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApprovalAuthorities to fetch.
     */
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApprovalAuthorities.
     */
    cursor?: ApprovalAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApprovalAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApprovalAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApprovalAuthorities.
     */
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * ApprovalAuthority findFirstOrThrow
   */
  export type ApprovalAuthorityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which ApprovalAuthority to fetch.
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApprovalAuthorities to fetch.
     */
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApprovalAuthorities.
     */
    cursor?: ApprovalAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApprovalAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApprovalAuthorities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApprovalAuthorities.
     */
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * ApprovalAuthority findMany
   */
  export type ApprovalAuthorityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter, which ApprovalAuthorities to fetch.
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApprovalAuthorities to fetch.
     */
    orderBy?: ApprovalAuthorityOrderByWithRelationInput | ApprovalAuthorityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApprovalAuthorities.
     */
    cursor?: ApprovalAuthorityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApprovalAuthorities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApprovalAuthorities.
     */
    skip?: number
    distinct?: ApprovalAuthorityScalarFieldEnum | ApprovalAuthorityScalarFieldEnum[]
  }

  /**
   * ApprovalAuthority create
   */
  export type ApprovalAuthorityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * The data needed to create a ApprovalAuthority.
     */
    data: XOR<ApprovalAuthorityCreateInput, ApprovalAuthorityUncheckedCreateInput>
  }

  /**
   * ApprovalAuthority createMany
   */
  export type ApprovalAuthorityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApprovalAuthorities.
     */
    data: ApprovalAuthorityCreateManyInput | ApprovalAuthorityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApprovalAuthority createManyAndReturn
   */
  export type ApprovalAuthorityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * The data used to create many ApprovalAuthorities.
     */
    data: ApprovalAuthorityCreateManyInput | ApprovalAuthorityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApprovalAuthority update
   */
  export type ApprovalAuthorityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * The data needed to update a ApprovalAuthority.
     */
    data: XOR<ApprovalAuthorityUpdateInput, ApprovalAuthorityUncheckedUpdateInput>
    /**
     * Choose, which ApprovalAuthority to update.
     */
    where: ApprovalAuthorityWhereUniqueInput
  }

  /**
   * ApprovalAuthority updateMany
   */
  export type ApprovalAuthorityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApprovalAuthorities.
     */
    data: XOR<ApprovalAuthorityUpdateManyMutationInput, ApprovalAuthorityUncheckedUpdateManyInput>
    /**
     * Filter which ApprovalAuthorities to update
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * Limit how many ApprovalAuthorities to update.
     */
    limit?: number
  }

  /**
   * ApprovalAuthority updateManyAndReturn
   */
  export type ApprovalAuthorityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * The data used to update ApprovalAuthorities.
     */
    data: XOR<ApprovalAuthorityUpdateManyMutationInput, ApprovalAuthorityUncheckedUpdateManyInput>
    /**
     * Filter which ApprovalAuthorities to update
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * Limit how many ApprovalAuthorities to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApprovalAuthority upsert
   */
  export type ApprovalAuthorityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * The filter to search for the ApprovalAuthority to update in case it exists.
     */
    where: ApprovalAuthorityWhereUniqueInput
    /**
     * In case the ApprovalAuthority found by the `where` argument doesn't exist, create a new ApprovalAuthority with this data.
     */
    create: XOR<ApprovalAuthorityCreateInput, ApprovalAuthorityUncheckedCreateInput>
    /**
     * In case the ApprovalAuthority was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApprovalAuthorityUpdateInput, ApprovalAuthorityUncheckedUpdateInput>
  }

  /**
   * ApprovalAuthority delete
   */
  export type ApprovalAuthorityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
    /**
     * Filter which ApprovalAuthority to delete.
     */
    where: ApprovalAuthorityWhereUniqueInput
  }

  /**
   * ApprovalAuthority deleteMany
   */
  export type ApprovalAuthorityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApprovalAuthorities to delete
     */
    where?: ApprovalAuthorityWhereInput
    /**
     * Limit how many ApprovalAuthorities to delete.
     */
    limit?: number
  }

  /**
   * ApprovalAuthority.decisions
   */
  export type ApprovalAuthority$decisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    cursor?: OrpDecisionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * ApprovalAuthority without action
   */
  export type ApprovalAuthorityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApprovalAuthority
     */
    select?: ApprovalAuthoritySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApprovalAuthority
     */
    omit?: ApprovalAuthorityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApprovalAuthorityInclude<ExtArgs> | null
  }


  /**
   * Model OrpDecision
   */

  export type AggregateOrpDecision = {
    _count: OrpDecisionCountAggregateOutputType | null
    _min: OrpDecisionMinAggregateOutputType | null
    _max: OrpDecisionMaxAggregateOutputType | null
  }

  export type OrpDecisionMinAggregateOutputType = {
    id: string | null
    caseId: string | null
    orpId: string | null
    reviewerId: string | null
    authorityGrantId: string | null
    decisionType: $Enums.OrpDecisionType | null
    reason: string | null
    remarks: string | null
    forwardToUserId: string | null
    createdAt: Date | null
  }

  export type OrpDecisionMaxAggregateOutputType = {
    id: string | null
    caseId: string | null
    orpId: string | null
    reviewerId: string | null
    authorityGrantId: string | null
    decisionType: $Enums.OrpDecisionType | null
    reason: string | null
    remarks: string | null
    forwardToUserId: string | null
    createdAt: Date | null
  }

  export type OrpDecisionCountAggregateOutputType = {
    id: number
    caseId: number
    orpId: number
    reviewerId: number
    authorityGrantId: number
    decisionType: number
    reason: number
    remarks: number
    requestedChanges: number
    forwardToUserId: number
    createdAt: number
    _all: number
  }


  export type OrpDecisionMinAggregateInputType = {
    id?: true
    caseId?: true
    orpId?: true
    reviewerId?: true
    authorityGrantId?: true
    decisionType?: true
    reason?: true
    remarks?: true
    forwardToUserId?: true
    createdAt?: true
  }

  export type OrpDecisionMaxAggregateInputType = {
    id?: true
    caseId?: true
    orpId?: true
    reviewerId?: true
    authorityGrantId?: true
    decisionType?: true
    reason?: true
    remarks?: true
    forwardToUserId?: true
    createdAt?: true
  }

  export type OrpDecisionCountAggregateInputType = {
    id?: true
    caseId?: true
    orpId?: true
    reviewerId?: true
    authorityGrantId?: true
    decisionType?: true
    reason?: true
    remarks?: true
    requestedChanges?: true
    forwardToUserId?: true
    createdAt?: true
    _all?: true
  }

  export type OrpDecisionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrpDecision to aggregate.
     */
    where?: OrpDecisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrpDecisions to fetch.
     */
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrpDecisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrpDecisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrpDecisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrpDecisions
    **/
    _count?: true | OrpDecisionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrpDecisionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrpDecisionMaxAggregateInputType
  }

  export type GetOrpDecisionAggregateType<T extends OrpDecisionAggregateArgs> = {
        [P in keyof T & keyof AggregateOrpDecision]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrpDecision[P]>
      : GetScalarType<T[P], AggregateOrpDecision[P]>
  }




  export type OrpDecisionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrpDecisionWhereInput
    orderBy?: OrpDecisionOrderByWithAggregationInput | OrpDecisionOrderByWithAggregationInput[]
    by: OrpDecisionScalarFieldEnum[] | OrpDecisionScalarFieldEnum
    having?: OrpDecisionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrpDecisionCountAggregateInputType | true
    _min?: OrpDecisionMinAggregateInputType
    _max?: OrpDecisionMaxAggregateInputType
  }

  export type OrpDecisionGroupByOutputType = {
    id: string
    caseId: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason: string | null
    remarks: string | null
    requestedChanges: JsonValue | null
    forwardToUserId: string | null
    createdAt: Date
    _count: OrpDecisionCountAggregateOutputType | null
    _min: OrpDecisionMinAggregateOutputType | null
    _max: OrpDecisionMaxAggregateOutputType | null
  }

  type GetOrpDecisionGroupByPayload<T extends OrpDecisionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrpDecisionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrpDecisionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrpDecisionGroupByOutputType[P]>
            : GetScalarType<T[P], OrpDecisionGroupByOutputType[P]>
        }
      >
    >


  export type OrpDecisionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    orpId?: boolean
    reviewerId?: boolean
    authorityGrantId?: boolean
    decisionType?: boolean
    reason?: boolean
    remarks?: boolean
    requestedChanges?: boolean
    forwardToUserId?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }, ExtArgs["result"]["orpDecision"]>

  export type OrpDecisionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    orpId?: boolean
    reviewerId?: boolean
    authorityGrantId?: boolean
    decisionType?: boolean
    reason?: boolean
    remarks?: boolean
    requestedChanges?: boolean
    forwardToUserId?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }, ExtArgs["result"]["orpDecision"]>

  export type OrpDecisionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    caseId?: boolean
    orpId?: boolean
    reviewerId?: boolean
    authorityGrantId?: boolean
    decisionType?: boolean
    reason?: boolean
    remarks?: boolean
    requestedChanges?: boolean
    forwardToUserId?: boolean
    createdAt?: boolean
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }, ExtArgs["result"]["orpDecision"]>

  export type OrpDecisionSelectScalar = {
    id?: boolean
    caseId?: boolean
    orpId?: boolean
    reviewerId?: boolean
    authorityGrantId?: boolean
    decisionType?: boolean
    reason?: boolean
    remarks?: boolean
    requestedChanges?: boolean
    forwardToUserId?: boolean
    createdAt?: boolean
  }

  export type OrpDecisionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "caseId" | "orpId" | "reviewerId" | "authorityGrantId" | "decisionType" | "reason" | "remarks" | "requestedChanges" | "forwardToUserId" | "createdAt", ExtArgs["result"]["orpDecision"]>
  export type OrpDecisionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }
  export type OrpDecisionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }
  export type OrpDecisionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | CaseDefaultArgs<ExtArgs>
    orp?: boolean | OperationalResponsePlanDefaultArgs<ExtArgs>
    reviewer?: boolean | UserDefaultArgs<ExtArgs>
    authorityGrant?: boolean | ApprovalAuthorityDefaultArgs<ExtArgs>
    forwardedUser?: boolean | OrpDecision$forwardedUserArgs<ExtArgs>
  }

  export type $OrpDecisionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrpDecision"
    objects: {
      case: Prisma.$CasePayload<ExtArgs>
      orp: Prisma.$OperationalResponsePlanPayload<ExtArgs>
      reviewer: Prisma.$UserPayload<ExtArgs>
      authorityGrant: Prisma.$ApprovalAuthorityPayload<ExtArgs>
      forwardedUser: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      caseId: string
      orpId: string
      reviewerId: string
      authorityGrantId: string
      decisionType: $Enums.OrpDecisionType
      reason: string | null
      remarks: string | null
      requestedChanges: Prisma.JsonValue | null
      forwardToUserId: string | null
      createdAt: Date
    }, ExtArgs["result"]["orpDecision"]>
    composites: {}
  }

  type OrpDecisionGetPayload<S extends boolean | null | undefined | OrpDecisionDefaultArgs> = $Result.GetResult<Prisma.$OrpDecisionPayload, S>

  type OrpDecisionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrpDecisionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrpDecisionCountAggregateInputType | true
    }

  export interface OrpDecisionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrpDecision'], meta: { name: 'OrpDecision' } }
    /**
     * Find zero or one OrpDecision that matches the filter.
     * @param {OrpDecisionFindUniqueArgs} args - Arguments to find a OrpDecision
     * @example
     * // Get one OrpDecision
     * const orpDecision = await prisma.orpDecision.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrpDecisionFindUniqueArgs>(args: SelectSubset<T, OrpDecisionFindUniqueArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrpDecision that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrpDecisionFindUniqueOrThrowArgs} args - Arguments to find a OrpDecision
     * @example
     * // Get one OrpDecision
     * const orpDecision = await prisma.orpDecision.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrpDecisionFindUniqueOrThrowArgs>(args: SelectSubset<T, OrpDecisionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrpDecision that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionFindFirstArgs} args - Arguments to find a OrpDecision
     * @example
     * // Get one OrpDecision
     * const orpDecision = await prisma.orpDecision.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrpDecisionFindFirstArgs>(args?: SelectSubset<T, OrpDecisionFindFirstArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrpDecision that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionFindFirstOrThrowArgs} args - Arguments to find a OrpDecision
     * @example
     * // Get one OrpDecision
     * const orpDecision = await prisma.orpDecision.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrpDecisionFindFirstOrThrowArgs>(args?: SelectSubset<T, OrpDecisionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrpDecisions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrpDecisions
     * const orpDecisions = await prisma.orpDecision.findMany()
     * 
     * // Get first 10 OrpDecisions
     * const orpDecisions = await prisma.orpDecision.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orpDecisionWithIdOnly = await prisma.orpDecision.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrpDecisionFindManyArgs>(args?: SelectSubset<T, OrpDecisionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrpDecision.
     * @param {OrpDecisionCreateArgs} args - Arguments to create a OrpDecision.
     * @example
     * // Create one OrpDecision
     * const OrpDecision = await prisma.orpDecision.create({
     *   data: {
     *     // ... data to create a OrpDecision
     *   }
     * })
     * 
     */
    create<T extends OrpDecisionCreateArgs>(args: SelectSubset<T, OrpDecisionCreateArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrpDecisions.
     * @param {OrpDecisionCreateManyArgs} args - Arguments to create many OrpDecisions.
     * @example
     * // Create many OrpDecisions
     * const orpDecision = await prisma.orpDecision.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrpDecisionCreateManyArgs>(args?: SelectSubset<T, OrpDecisionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrpDecisions and returns the data saved in the database.
     * @param {OrpDecisionCreateManyAndReturnArgs} args - Arguments to create many OrpDecisions.
     * @example
     * // Create many OrpDecisions
     * const orpDecision = await prisma.orpDecision.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrpDecisions and only return the `id`
     * const orpDecisionWithIdOnly = await prisma.orpDecision.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrpDecisionCreateManyAndReturnArgs>(args?: SelectSubset<T, OrpDecisionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrpDecision.
     * @param {OrpDecisionDeleteArgs} args - Arguments to delete one OrpDecision.
     * @example
     * // Delete one OrpDecision
     * const OrpDecision = await prisma.orpDecision.delete({
     *   where: {
     *     // ... filter to delete one OrpDecision
     *   }
     * })
     * 
     */
    delete<T extends OrpDecisionDeleteArgs>(args: SelectSubset<T, OrpDecisionDeleteArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrpDecision.
     * @param {OrpDecisionUpdateArgs} args - Arguments to update one OrpDecision.
     * @example
     * // Update one OrpDecision
     * const orpDecision = await prisma.orpDecision.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrpDecisionUpdateArgs>(args: SelectSubset<T, OrpDecisionUpdateArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrpDecisions.
     * @param {OrpDecisionDeleteManyArgs} args - Arguments to filter OrpDecisions to delete.
     * @example
     * // Delete a few OrpDecisions
     * const { count } = await prisma.orpDecision.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrpDecisionDeleteManyArgs>(args?: SelectSubset<T, OrpDecisionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrpDecisions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrpDecisions
     * const orpDecision = await prisma.orpDecision.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrpDecisionUpdateManyArgs>(args: SelectSubset<T, OrpDecisionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrpDecisions and returns the data updated in the database.
     * @param {OrpDecisionUpdateManyAndReturnArgs} args - Arguments to update many OrpDecisions.
     * @example
     * // Update many OrpDecisions
     * const orpDecision = await prisma.orpDecision.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrpDecisions and only return the `id`
     * const orpDecisionWithIdOnly = await prisma.orpDecision.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrpDecisionUpdateManyAndReturnArgs>(args: SelectSubset<T, OrpDecisionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrpDecision.
     * @param {OrpDecisionUpsertArgs} args - Arguments to update or create a OrpDecision.
     * @example
     * // Update or create a OrpDecision
     * const orpDecision = await prisma.orpDecision.upsert({
     *   create: {
     *     // ... data to create a OrpDecision
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrpDecision we want to update
     *   }
     * })
     */
    upsert<T extends OrpDecisionUpsertArgs>(args: SelectSubset<T, OrpDecisionUpsertArgs<ExtArgs>>): Prisma__OrpDecisionClient<$Result.GetResult<Prisma.$OrpDecisionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrpDecisions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionCountArgs} args - Arguments to filter OrpDecisions to count.
     * @example
     * // Count the number of OrpDecisions
     * const count = await prisma.orpDecision.count({
     *   where: {
     *     // ... the filter for the OrpDecisions we want to count
     *   }
     * })
    **/
    count<T extends OrpDecisionCountArgs>(
      args?: Subset<T, OrpDecisionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrpDecisionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrpDecision.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrpDecisionAggregateArgs>(args: Subset<T, OrpDecisionAggregateArgs>): Prisma.PrismaPromise<GetOrpDecisionAggregateType<T>>

    /**
     * Group by OrpDecision.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrpDecisionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrpDecisionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrpDecisionGroupByArgs['orderBy'] }
        : { orderBy?: OrpDecisionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrpDecisionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrpDecisionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrpDecision model
   */
  readonly fields: OrpDecisionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrpDecision.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrpDecisionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends CaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CaseDefaultArgs<ExtArgs>>): Prisma__CaseClient<$Result.GetResult<Prisma.$CasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    orp<T extends OperationalResponsePlanDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OperationalResponsePlanDefaultArgs<ExtArgs>>): Prisma__OperationalResponsePlanClient<$Result.GetResult<Prisma.$OperationalResponsePlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    reviewer<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    authorityGrant<T extends ApprovalAuthorityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApprovalAuthorityDefaultArgs<ExtArgs>>): Prisma__ApprovalAuthorityClient<$Result.GetResult<Prisma.$ApprovalAuthorityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    forwardedUser<T extends OrpDecision$forwardedUserArgs<ExtArgs> = {}>(args?: Subset<T, OrpDecision$forwardedUserArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrpDecision model
   */
  interface OrpDecisionFieldRefs {
    readonly id: FieldRef<"OrpDecision", 'String'>
    readonly caseId: FieldRef<"OrpDecision", 'String'>
    readonly orpId: FieldRef<"OrpDecision", 'String'>
    readonly reviewerId: FieldRef<"OrpDecision", 'String'>
    readonly authorityGrantId: FieldRef<"OrpDecision", 'String'>
    readonly decisionType: FieldRef<"OrpDecision", 'OrpDecisionType'>
    readonly reason: FieldRef<"OrpDecision", 'String'>
    readonly remarks: FieldRef<"OrpDecision", 'String'>
    readonly requestedChanges: FieldRef<"OrpDecision", 'Json'>
    readonly forwardToUserId: FieldRef<"OrpDecision", 'String'>
    readonly createdAt: FieldRef<"OrpDecision", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrpDecision findUnique
   */
  export type OrpDecisionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter, which OrpDecision to fetch.
     */
    where: OrpDecisionWhereUniqueInput
  }

  /**
   * OrpDecision findUniqueOrThrow
   */
  export type OrpDecisionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter, which OrpDecision to fetch.
     */
    where: OrpDecisionWhereUniqueInput
  }

  /**
   * OrpDecision findFirst
   */
  export type OrpDecisionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter, which OrpDecision to fetch.
     */
    where?: OrpDecisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrpDecisions to fetch.
     */
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrpDecisions.
     */
    cursor?: OrpDecisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrpDecisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrpDecisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrpDecisions.
     */
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * OrpDecision findFirstOrThrow
   */
  export type OrpDecisionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter, which OrpDecision to fetch.
     */
    where?: OrpDecisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrpDecisions to fetch.
     */
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrpDecisions.
     */
    cursor?: OrpDecisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrpDecisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrpDecisions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrpDecisions.
     */
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * OrpDecision findMany
   */
  export type OrpDecisionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter, which OrpDecisions to fetch.
     */
    where?: OrpDecisionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrpDecisions to fetch.
     */
    orderBy?: OrpDecisionOrderByWithRelationInput | OrpDecisionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrpDecisions.
     */
    cursor?: OrpDecisionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrpDecisions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrpDecisions.
     */
    skip?: number
    distinct?: OrpDecisionScalarFieldEnum | OrpDecisionScalarFieldEnum[]
  }

  /**
   * OrpDecision create
   */
  export type OrpDecisionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * The data needed to create a OrpDecision.
     */
    data: XOR<OrpDecisionCreateInput, OrpDecisionUncheckedCreateInput>
  }

  /**
   * OrpDecision createMany
   */
  export type OrpDecisionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrpDecisions.
     */
    data: OrpDecisionCreateManyInput | OrpDecisionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrpDecision createManyAndReturn
   */
  export type OrpDecisionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * The data used to create many OrpDecisions.
     */
    data: OrpDecisionCreateManyInput | OrpDecisionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrpDecision update
   */
  export type OrpDecisionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * The data needed to update a OrpDecision.
     */
    data: XOR<OrpDecisionUpdateInput, OrpDecisionUncheckedUpdateInput>
    /**
     * Choose, which OrpDecision to update.
     */
    where: OrpDecisionWhereUniqueInput
  }

  /**
   * OrpDecision updateMany
   */
  export type OrpDecisionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrpDecisions.
     */
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyInput>
    /**
     * Filter which OrpDecisions to update
     */
    where?: OrpDecisionWhereInput
    /**
     * Limit how many OrpDecisions to update.
     */
    limit?: number
  }

  /**
   * OrpDecision updateManyAndReturn
   */
  export type OrpDecisionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * The data used to update OrpDecisions.
     */
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyInput>
    /**
     * Filter which OrpDecisions to update
     */
    where?: OrpDecisionWhereInput
    /**
     * Limit how many OrpDecisions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrpDecision upsert
   */
  export type OrpDecisionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * The filter to search for the OrpDecision to update in case it exists.
     */
    where: OrpDecisionWhereUniqueInput
    /**
     * In case the OrpDecision found by the `where` argument doesn't exist, create a new OrpDecision with this data.
     */
    create: XOR<OrpDecisionCreateInput, OrpDecisionUncheckedCreateInput>
    /**
     * In case the OrpDecision was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrpDecisionUpdateInput, OrpDecisionUncheckedUpdateInput>
  }

  /**
   * OrpDecision delete
   */
  export type OrpDecisionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
    /**
     * Filter which OrpDecision to delete.
     */
    where: OrpDecisionWhereUniqueInput
  }

  /**
   * OrpDecision deleteMany
   */
  export type OrpDecisionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrpDecisions to delete
     */
    where?: OrpDecisionWhereInput
    /**
     * Limit how many OrpDecisions to delete.
     */
    limit?: number
  }

  /**
   * OrpDecision.forwardedUser
   */
  export type OrpDecision$forwardedUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * OrpDecision without action
   */
  export type OrpDecisionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrpDecision
     */
    select?: OrpDecisionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrpDecision
     */
    omit?: OrpDecisionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrpDecisionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DepartmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    createdAt: 'createdAt'
  };

  export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum]


  export const JurisdictionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    departmentId: 'departmentId',
    createdAt: 'createdAt'
  };

  export type JurisdictionScalarFieldEnum = (typeof JurisdictionScalarFieldEnum)[keyof typeof JurisdictionScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    employeeCode: 'employeeCode',
    name: 'name',
    email: 'email',
    passwordHash: 'passwordHash',
    designation: 'designation',
    role: 'role',
    status: 'status',
    departmentId: 'departmentId',
    jurisdictionId: 'jurisdictionId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AssetScalarFieldEnum: {
    id: 'id',
    assetCode: 'assetCode',
    name: 'name',
    assetType: 'assetType',
    departmentId: 'departmentId',
    jurisdictionId: 'jurisdictionId',
    latitude: 'latitude',
    longitude: 'longitude',
    constructionYear: 'constructionYear',
    conditionStatus: 'conditionStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum]


  export const CaseScalarFieldEnum: {
    id: 'id',
    caseNumber: 'caseNumber',
    assetId: 'assetId',
    title: 'title',
    description: 'description',
    status: 'status',
    riskLevel: 'riskLevel',
    priorityLevel: 'priorityLevel',
    emergencyFlag: 'emergencyFlag',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    closedAt: 'closedAt'
  };

  export type CaseScalarFieldEnum = (typeof CaseScalarFieldEnum)[keyof typeof CaseScalarFieldEnum]


  export const InspectionScalarFieldEnum: {
    id: 'id',
    caseId: 'caseId',
    inspectorId: 'inspectorId',
    inspectionDate: 'inspectionDate',
    structuralCondition: 'structuralCondition',
    crackSeverity: 'crackSeverity',
    corrosionLevel: 'corrosionLevel',
    trafficImportance: 'trafficImportance',
    hospitalRoute: 'hospitalRoute',
    weatherRisk: 'weatherRisk',
    heavyRainExpected: 'heavyRainExpected',
    estimatedDailyUsers: 'estimatedDailyUsers',
    inspectionNotes: 'inspectionNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InspectionScalarFieldEnum = (typeof InspectionScalarFieldEnum)[keyof typeof InspectionScalarFieldEnum]


  export const RiskAssessmentScalarFieldEnum: {
    id: 'id',
    caseId: 'caseId',
    inspectionId: 'inspectionId',
    riskScore: 'riskScore',
    riskLevel: 'riskLevel',
    priorityLevel: 'priorityLevel',
    reasonCodes: 'reasonCodes',
    reasons: 'reasons',
    assessmentVersion: 'assessmentVersion',
    createdAt: 'createdAt'
  };

  export type RiskAssessmentScalarFieldEnum = (typeof RiskAssessmentScalarFieldEnum)[keyof typeof RiskAssessmentScalarFieldEnum]


  export const OperationalResponsePlanScalarFieldEnum: {
    id: 'id',
    caseId: 'caseId',
    riskAssessmentId: 'riskAssessmentId',
    versionNumber: 'versionNumber',
    status: 'status',
    urgency: 'urgency',
    recommendedActionCodes: 'recommendedActionCodes',
    temporaryMeasures: 'temporaryMeasures',
    reasons: 'reasons',
    alternativeActionCodes: 'alternativeActionCodes',
    planVersion: 'planVersion',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OperationalResponsePlanScalarFieldEnum = (typeof OperationalResponsePlanScalarFieldEnum)[keyof typeof OperationalResponsePlanScalarFieldEnum]


  export const ApprovalAuthorityScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    departmentId: 'departmentId',
    jurisdictionId: 'jurisdictionId',
    canApprove: 'canApprove',
    canReject: 'canReject',
    canRequestModification: 'canRequestModification',
    canRequestReinspection: 'canRequestReinspection',
    canEscalate: 'canEscalate',
    maxPriorityLevel: 'maxPriorityLevel',
    isActive: 'isActive',
    validFrom: 'validFrom',
    validUntil: 'validUntil',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ApprovalAuthorityScalarFieldEnum = (typeof ApprovalAuthorityScalarFieldEnum)[keyof typeof ApprovalAuthorityScalarFieldEnum]


  export const OrpDecisionScalarFieldEnum: {
    id: 'id',
    caseId: 'caseId',
    orpId: 'orpId',
    reviewerId: 'reviewerId',
    authorityGrantId: 'authorityGrantId',
    decisionType: 'decisionType',
    reason: 'reason',
    remarks: 'remarks',
    requestedChanges: 'requestedChanges',
    forwardToUserId: 'forwardToUserId',
    createdAt: 'createdAt'
  };

  export type OrpDecisionScalarFieldEnum = (typeof OrpDecisionScalarFieldEnum)[keyof typeof OrpDecisionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SystemRole'
   */
  export type EnumSystemRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SystemRole'>
    


  /**
   * Reference to a field of type 'SystemRole[]'
   */
  export type ListEnumSystemRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SystemRole[]'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'AssetType'
   */
  export type EnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType'>
    


  /**
   * Reference to a field of type 'AssetType[]'
   */
  export type ListEnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'CaseStatus'
   */
  export type EnumCaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CaseStatus'>
    


  /**
   * Reference to a field of type 'CaseStatus[]'
   */
  export type ListEnumCaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CaseStatus[]'>
    


  /**
   * Reference to a field of type 'RiskLevel'
   */
  export type EnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel'>
    


  /**
   * Reference to a field of type 'RiskLevel[]'
   */
  export type ListEnumRiskLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskLevel[]'>
    


  /**
   * Reference to a field of type 'PriorityLevel'
   */
  export type EnumPriorityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriorityLevel'>
    


  /**
   * Reference to a field of type 'PriorityLevel[]'
   */
  export type ListEnumPriorityLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriorityLevel[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'OrpDecisionType'
   */
  export type EnumOrpDecisionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrpDecisionType'>
    


  /**
   * Reference to a field of type 'OrpDecisionType[]'
   */
  export type ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrpDecisionType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DepartmentWhereInput = {
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    code?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    users?: UserListRelationFilter
    assets?: AssetListRelationFilter
    jurisdictions?: JurisdictionListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
  }

  export type DepartmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
    assets?: AssetOrderByRelationAggregateInput
    jurisdictions?: JurisdictionOrderByRelationAggregateInput
    approvalAuthorities?: ApprovalAuthorityOrderByRelationAggregateInput
  }

  export type DepartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    name?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    users?: UserListRelationFilter
    assets?: AssetListRelationFilter
    jurisdictions?: JurisdictionListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
  }, "id" | "code">

  export type DepartmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    _count?: DepartmentCountOrderByAggregateInput
    _max?: DepartmentMaxOrderByAggregateInput
    _min?: DepartmentMinOrderByAggregateInput
  }

  export type DepartmentScalarWhereWithAggregatesInput = {
    AND?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    OR?: DepartmentScalarWhereWithAggregatesInput[]
    NOT?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Department"> | string
    name?: StringWithAggregatesFilter<"Department"> | string
    code?: StringWithAggregatesFilter<"Department"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Department"> | Date | string
  }

  export type JurisdictionWhereInput = {
    AND?: JurisdictionWhereInput | JurisdictionWhereInput[]
    OR?: JurisdictionWhereInput[]
    NOT?: JurisdictionWhereInput | JurisdictionWhereInput[]
    id?: StringFilter<"Jurisdiction"> | string
    name?: StringFilter<"Jurisdiction"> | string
    type?: StringFilter<"Jurisdiction"> | string
    departmentId?: StringFilter<"Jurisdiction"> | string
    createdAt?: DateTimeFilter<"Jurisdiction"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    users?: UserListRelationFilter
    assets?: AssetListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
  }

  export type JurisdictionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    departmentId?: SortOrder
    createdAt?: SortOrder
    department?: DepartmentOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
    assets?: AssetOrderByRelationAggregateInput
    approvalAuthorities?: ApprovalAuthorityOrderByRelationAggregateInput
  }

  export type JurisdictionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JurisdictionWhereInput | JurisdictionWhereInput[]
    OR?: JurisdictionWhereInput[]
    NOT?: JurisdictionWhereInput | JurisdictionWhereInput[]
    name?: StringFilter<"Jurisdiction"> | string
    type?: StringFilter<"Jurisdiction"> | string
    departmentId?: StringFilter<"Jurisdiction"> | string
    createdAt?: DateTimeFilter<"Jurisdiction"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    users?: UserListRelationFilter
    assets?: AssetListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
  }, "id">

  export type JurisdictionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    departmentId?: SortOrder
    createdAt?: SortOrder
    _count?: JurisdictionCountOrderByAggregateInput
    _max?: JurisdictionMaxOrderByAggregateInput
    _min?: JurisdictionMinOrderByAggregateInput
  }

  export type JurisdictionScalarWhereWithAggregatesInput = {
    AND?: JurisdictionScalarWhereWithAggregatesInput | JurisdictionScalarWhereWithAggregatesInput[]
    OR?: JurisdictionScalarWhereWithAggregatesInput[]
    NOT?: JurisdictionScalarWhereWithAggregatesInput | JurisdictionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Jurisdiction"> | string
    name?: StringWithAggregatesFilter<"Jurisdiction"> | string
    type?: StringWithAggregatesFilter<"Jurisdiction"> | string
    departmentId?: StringWithAggregatesFilter<"Jurisdiction"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Jurisdiction"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    employeeCode?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    designation?: StringFilter<"User"> | string
    role?: EnumSystemRoleFilter<"User"> | $Enums.SystemRole
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    departmentId?: StringFilter<"User"> | string
    jurisdictionId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    inspections?: InspectionListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
    reviewedOrpDecisions?: OrpDecisionListRelationFilter
    forwardedOrpDecisions?: OrpDecisionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    designation?: SortOrder
    role?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    department?: DepartmentOrderByWithRelationInput
    jurisdiction?: JurisdictionOrderByWithRelationInput
    inspections?: InspectionOrderByRelationAggregateInput
    approvalAuthorities?: ApprovalAuthorityOrderByRelationAggregateInput
    reviewedOrpDecisions?: OrpDecisionOrderByRelationAggregateInput
    forwardedOrpDecisions?: OrpDecisionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    employeeCode?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    designation?: StringFilter<"User"> | string
    role?: EnumSystemRoleFilter<"User"> | $Enums.SystemRole
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    departmentId?: StringFilter<"User"> | string
    jurisdictionId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    inspections?: InspectionListRelationFilter
    approvalAuthorities?: ApprovalAuthorityListRelationFilter
    reviewedOrpDecisions?: OrpDecisionListRelationFilter
    forwardedOrpDecisions?: OrpDecisionListRelationFilter
  }, "id" | "employeeCode" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    designation?: SortOrder
    role?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    employeeCode?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    designation?: StringWithAggregatesFilter<"User"> | string
    role?: EnumSystemRoleWithAggregatesFilter<"User"> | $Enums.SystemRole
    status?: EnumUserStatusWithAggregatesFilter<"User"> | $Enums.UserStatus
    departmentId?: StringWithAggregatesFilter<"User"> | string
    jurisdictionId?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AssetWhereInput = {
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    id?: StringFilter<"Asset"> | string
    assetCode?: StringFilter<"Asset"> | string
    name?: StringFilter<"Asset"> | string
    assetType?: EnumAssetTypeFilter<"Asset"> | $Enums.AssetType
    departmentId?: StringFilter<"Asset"> | string
    jurisdictionId?: StringFilter<"Asset"> | string
    latitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    constructionYear?: IntNullableFilter<"Asset"> | number | null
    conditionStatus?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    cases?: CaseListRelationFilter
  }

  export type AssetOrderByWithRelationInput = {
    id?: SortOrder
    assetCode?: SortOrder
    name?: SortOrder
    assetType?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    constructionYear?: SortOrderInput | SortOrder
    conditionStatus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    department?: DepartmentOrderByWithRelationInput
    jurisdiction?: JurisdictionOrderByWithRelationInput
    cases?: CaseOrderByRelationAggregateInput
  }

  export type AssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    assetCode?: string
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    name?: StringFilter<"Asset"> | string
    assetType?: EnumAssetTypeFilter<"Asset"> | $Enums.AssetType
    departmentId?: StringFilter<"Asset"> | string
    jurisdictionId?: StringFilter<"Asset"> | string
    latitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    constructionYear?: IntNullableFilter<"Asset"> | number | null
    conditionStatus?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    cases?: CaseListRelationFilter
  }, "id" | "assetCode">

  export type AssetOrderByWithAggregationInput = {
    id?: SortOrder
    assetCode?: SortOrder
    name?: SortOrder
    assetType?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    constructionYear?: SortOrderInput | SortOrder
    conditionStatus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssetCountOrderByAggregateInput
    _avg?: AssetAvgOrderByAggregateInput
    _max?: AssetMaxOrderByAggregateInput
    _min?: AssetMinOrderByAggregateInput
    _sum?: AssetSumOrderByAggregateInput
  }

  export type AssetScalarWhereWithAggregatesInput = {
    AND?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    OR?: AssetScalarWhereWithAggregatesInput[]
    NOT?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Asset"> | string
    assetCode?: StringWithAggregatesFilter<"Asset"> | string
    name?: StringWithAggregatesFilter<"Asset"> | string
    assetType?: EnumAssetTypeWithAggregatesFilter<"Asset"> | $Enums.AssetType
    departmentId?: StringWithAggregatesFilter<"Asset"> | string
    jurisdictionId?: StringWithAggregatesFilter<"Asset"> | string
    latitude?: DecimalNullableWithAggregatesFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableWithAggregatesFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    constructionYear?: IntNullableWithAggregatesFilter<"Asset"> | number | null
    conditionStatus?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
  }

  export type CaseWhereInput = {
    AND?: CaseWhereInput | CaseWhereInput[]
    OR?: CaseWhereInput[]
    NOT?: CaseWhereInput | CaseWhereInput[]
    id?: StringFilter<"Case"> | string
    caseNumber?: StringFilter<"Case"> | string
    assetId?: StringFilter<"Case"> | string
    title?: StringFilter<"Case"> | string
    description?: StringNullableFilter<"Case"> | string | null
    status?: EnumCaseStatusFilter<"Case"> | $Enums.CaseStatus
    riskLevel?: EnumRiskLevelNullableFilter<"Case"> | $Enums.RiskLevel | null
    priorityLevel?: EnumPriorityLevelNullableFilter<"Case"> | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFilter<"Case"> | boolean
    createdAt?: DateTimeFilter<"Case"> | Date | string
    updatedAt?: DateTimeFilter<"Case"> | Date | string
    closedAt?: DateTimeNullableFilter<"Case"> | Date | string | null
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    inspections?: InspectionListRelationFilter
    riskAssessments?: RiskAssessmentListRelationFilter
    operationalResponsePlans?: OperationalResponsePlanListRelationFilter
    orpDecisions?: OrpDecisionListRelationFilter
  }

  export type CaseOrderByWithRelationInput = {
    id?: SortOrder
    caseNumber?: SortOrder
    assetId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    riskLevel?: SortOrderInput | SortOrder
    priorityLevel?: SortOrderInput | SortOrder
    emergencyFlag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    asset?: AssetOrderByWithRelationInput
    inspections?: InspectionOrderByRelationAggregateInput
    riskAssessments?: RiskAssessmentOrderByRelationAggregateInput
    operationalResponsePlans?: OperationalResponsePlanOrderByRelationAggregateInput
    orpDecisions?: OrpDecisionOrderByRelationAggregateInput
  }

  export type CaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    caseNumber?: string
    AND?: CaseWhereInput | CaseWhereInput[]
    OR?: CaseWhereInput[]
    NOT?: CaseWhereInput | CaseWhereInput[]
    assetId?: StringFilter<"Case"> | string
    title?: StringFilter<"Case"> | string
    description?: StringNullableFilter<"Case"> | string | null
    status?: EnumCaseStatusFilter<"Case"> | $Enums.CaseStatus
    riskLevel?: EnumRiskLevelNullableFilter<"Case"> | $Enums.RiskLevel | null
    priorityLevel?: EnumPriorityLevelNullableFilter<"Case"> | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFilter<"Case"> | boolean
    createdAt?: DateTimeFilter<"Case"> | Date | string
    updatedAt?: DateTimeFilter<"Case"> | Date | string
    closedAt?: DateTimeNullableFilter<"Case"> | Date | string | null
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    inspections?: InspectionListRelationFilter
    riskAssessments?: RiskAssessmentListRelationFilter
    operationalResponsePlans?: OperationalResponsePlanListRelationFilter
    orpDecisions?: OrpDecisionListRelationFilter
  }, "id" | "caseNumber">

  export type CaseOrderByWithAggregationInput = {
    id?: SortOrder
    caseNumber?: SortOrder
    assetId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    riskLevel?: SortOrderInput | SortOrder
    priorityLevel?: SortOrderInput | SortOrder
    emergencyFlag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    _count?: CaseCountOrderByAggregateInput
    _max?: CaseMaxOrderByAggregateInput
    _min?: CaseMinOrderByAggregateInput
  }

  export type CaseScalarWhereWithAggregatesInput = {
    AND?: CaseScalarWhereWithAggregatesInput | CaseScalarWhereWithAggregatesInput[]
    OR?: CaseScalarWhereWithAggregatesInput[]
    NOT?: CaseScalarWhereWithAggregatesInput | CaseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Case"> | string
    caseNumber?: StringWithAggregatesFilter<"Case"> | string
    assetId?: StringWithAggregatesFilter<"Case"> | string
    title?: StringWithAggregatesFilter<"Case"> | string
    description?: StringNullableWithAggregatesFilter<"Case"> | string | null
    status?: EnumCaseStatusWithAggregatesFilter<"Case"> | $Enums.CaseStatus
    riskLevel?: EnumRiskLevelNullableWithAggregatesFilter<"Case"> | $Enums.RiskLevel | null
    priorityLevel?: EnumPriorityLevelNullableWithAggregatesFilter<"Case"> | $Enums.PriorityLevel | null
    emergencyFlag?: BoolWithAggregatesFilter<"Case"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Case"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Case"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"Case"> | Date | string | null
  }

  export type InspectionWhereInput = {
    AND?: InspectionWhereInput | InspectionWhereInput[]
    OR?: InspectionWhereInput[]
    NOT?: InspectionWhereInput | InspectionWhereInput[]
    id?: StringFilter<"Inspection"> | string
    caseId?: StringFilter<"Inspection"> | string
    inspectorId?: StringFilter<"Inspection"> | string
    inspectionDate?: DateTimeFilter<"Inspection"> | Date | string
    structuralCondition?: StringFilter<"Inspection"> | string
    crackSeverity?: StringFilter<"Inspection"> | string
    corrosionLevel?: StringFilter<"Inspection"> | string
    trafficImportance?: StringFilter<"Inspection"> | string
    hospitalRoute?: BoolFilter<"Inspection"> | boolean
    weatherRisk?: StringFilter<"Inspection"> | string
    heavyRainExpected?: BoolFilter<"Inspection"> | boolean
    estimatedDailyUsers?: IntNullableFilter<"Inspection"> | number | null
    inspectionNotes?: StringNullableFilter<"Inspection"> | string | null
    createdAt?: DateTimeFilter<"Inspection"> | Date | string
    updatedAt?: DateTimeFilter<"Inspection"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    inspector?: XOR<UserScalarRelationFilter, UserWhereInput>
    riskAssessments?: RiskAssessmentListRelationFilter
  }

  export type InspectionOrderByWithRelationInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectorId?: SortOrder
    inspectionDate?: SortOrder
    structuralCondition?: SortOrder
    crackSeverity?: SortOrder
    corrosionLevel?: SortOrder
    trafficImportance?: SortOrder
    hospitalRoute?: SortOrder
    weatherRisk?: SortOrder
    heavyRainExpected?: SortOrder
    estimatedDailyUsers?: SortOrderInput | SortOrder
    inspectionNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    case?: CaseOrderByWithRelationInput
    inspector?: UserOrderByWithRelationInput
    riskAssessments?: RiskAssessmentOrderByRelationAggregateInput
  }

  export type InspectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InspectionWhereInput | InspectionWhereInput[]
    OR?: InspectionWhereInput[]
    NOT?: InspectionWhereInput | InspectionWhereInput[]
    caseId?: StringFilter<"Inspection"> | string
    inspectorId?: StringFilter<"Inspection"> | string
    inspectionDate?: DateTimeFilter<"Inspection"> | Date | string
    structuralCondition?: StringFilter<"Inspection"> | string
    crackSeverity?: StringFilter<"Inspection"> | string
    corrosionLevel?: StringFilter<"Inspection"> | string
    trafficImportance?: StringFilter<"Inspection"> | string
    hospitalRoute?: BoolFilter<"Inspection"> | boolean
    weatherRisk?: StringFilter<"Inspection"> | string
    heavyRainExpected?: BoolFilter<"Inspection"> | boolean
    estimatedDailyUsers?: IntNullableFilter<"Inspection"> | number | null
    inspectionNotes?: StringNullableFilter<"Inspection"> | string | null
    createdAt?: DateTimeFilter<"Inspection"> | Date | string
    updatedAt?: DateTimeFilter<"Inspection"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    inspector?: XOR<UserScalarRelationFilter, UserWhereInput>
    riskAssessments?: RiskAssessmentListRelationFilter
  }, "id">

  export type InspectionOrderByWithAggregationInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectorId?: SortOrder
    inspectionDate?: SortOrder
    structuralCondition?: SortOrder
    crackSeverity?: SortOrder
    corrosionLevel?: SortOrder
    trafficImportance?: SortOrder
    hospitalRoute?: SortOrder
    weatherRisk?: SortOrder
    heavyRainExpected?: SortOrder
    estimatedDailyUsers?: SortOrderInput | SortOrder
    inspectionNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InspectionCountOrderByAggregateInput
    _avg?: InspectionAvgOrderByAggregateInput
    _max?: InspectionMaxOrderByAggregateInput
    _min?: InspectionMinOrderByAggregateInput
    _sum?: InspectionSumOrderByAggregateInput
  }

  export type InspectionScalarWhereWithAggregatesInput = {
    AND?: InspectionScalarWhereWithAggregatesInput | InspectionScalarWhereWithAggregatesInput[]
    OR?: InspectionScalarWhereWithAggregatesInput[]
    NOT?: InspectionScalarWhereWithAggregatesInput | InspectionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Inspection"> | string
    caseId?: StringWithAggregatesFilter<"Inspection"> | string
    inspectorId?: StringWithAggregatesFilter<"Inspection"> | string
    inspectionDate?: DateTimeWithAggregatesFilter<"Inspection"> | Date | string
    structuralCondition?: StringWithAggregatesFilter<"Inspection"> | string
    crackSeverity?: StringWithAggregatesFilter<"Inspection"> | string
    corrosionLevel?: StringWithAggregatesFilter<"Inspection"> | string
    trafficImportance?: StringWithAggregatesFilter<"Inspection"> | string
    hospitalRoute?: BoolWithAggregatesFilter<"Inspection"> | boolean
    weatherRisk?: StringWithAggregatesFilter<"Inspection"> | string
    heavyRainExpected?: BoolWithAggregatesFilter<"Inspection"> | boolean
    estimatedDailyUsers?: IntNullableWithAggregatesFilter<"Inspection"> | number | null
    inspectionNotes?: StringNullableWithAggregatesFilter<"Inspection"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Inspection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Inspection"> | Date | string
  }

  export type RiskAssessmentWhereInput = {
    AND?: RiskAssessmentWhereInput | RiskAssessmentWhereInput[]
    OR?: RiskAssessmentWhereInput[]
    NOT?: RiskAssessmentWhereInput | RiskAssessmentWhereInput[]
    id?: StringFilter<"RiskAssessment"> | string
    caseId?: StringFilter<"RiskAssessment"> | string
    inspectionId?: StringFilter<"RiskAssessment"> | string
    riskScore?: IntFilter<"RiskAssessment"> | number
    riskLevel?: EnumRiskLevelFilter<"RiskAssessment"> | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFilter<"RiskAssessment"> | $Enums.PriorityLevel
    reasonCodes?: JsonFilter<"RiskAssessment">
    reasons?: JsonFilter<"RiskAssessment">
    assessmentVersion?: StringFilter<"RiskAssessment"> | string
    createdAt?: DateTimeFilter<"RiskAssessment"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    inspection?: XOR<InspectionScalarRelationFilter, InspectionWhereInput>
    operationalResponsePlans?: OperationalResponsePlanListRelationFilter
  }

  export type RiskAssessmentOrderByWithRelationInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectionId?: SortOrder
    riskScore?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    reasonCodes?: SortOrder
    reasons?: SortOrder
    assessmentVersion?: SortOrder
    createdAt?: SortOrder
    case?: CaseOrderByWithRelationInput
    inspection?: InspectionOrderByWithRelationInput
    operationalResponsePlans?: OperationalResponsePlanOrderByRelationAggregateInput
  }

  export type RiskAssessmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RiskAssessmentWhereInput | RiskAssessmentWhereInput[]
    OR?: RiskAssessmentWhereInput[]
    NOT?: RiskAssessmentWhereInput | RiskAssessmentWhereInput[]
    caseId?: StringFilter<"RiskAssessment"> | string
    inspectionId?: StringFilter<"RiskAssessment"> | string
    riskScore?: IntFilter<"RiskAssessment"> | number
    riskLevel?: EnumRiskLevelFilter<"RiskAssessment"> | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFilter<"RiskAssessment"> | $Enums.PriorityLevel
    reasonCodes?: JsonFilter<"RiskAssessment">
    reasons?: JsonFilter<"RiskAssessment">
    assessmentVersion?: StringFilter<"RiskAssessment"> | string
    createdAt?: DateTimeFilter<"RiskAssessment"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    inspection?: XOR<InspectionScalarRelationFilter, InspectionWhereInput>
    operationalResponsePlans?: OperationalResponsePlanListRelationFilter
  }, "id">

  export type RiskAssessmentOrderByWithAggregationInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectionId?: SortOrder
    riskScore?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    reasonCodes?: SortOrder
    reasons?: SortOrder
    assessmentVersion?: SortOrder
    createdAt?: SortOrder
    _count?: RiskAssessmentCountOrderByAggregateInput
    _avg?: RiskAssessmentAvgOrderByAggregateInput
    _max?: RiskAssessmentMaxOrderByAggregateInput
    _min?: RiskAssessmentMinOrderByAggregateInput
    _sum?: RiskAssessmentSumOrderByAggregateInput
  }

  export type RiskAssessmentScalarWhereWithAggregatesInput = {
    AND?: RiskAssessmentScalarWhereWithAggregatesInput | RiskAssessmentScalarWhereWithAggregatesInput[]
    OR?: RiskAssessmentScalarWhereWithAggregatesInput[]
    NOT?: RiskAssessmentScalarWhereWithAggregatesInput | RiskAssessmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RiskAssessment"> | string
    caseId?: StringWithAggregatesFilter<"RiskAssessment"> | string
    inspectionId?: StringWithAggregatesFilter<"RiskAssessment"> | string
    riskScore?: IntWithAggregatesFilter<"RiskAssessment"> | number
    riskLevel?: EnumRiskLevelWithAggregatesFilter<"RiskAssessment"> | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelWithAggregatesFilter<"RiskAssessment"> | $Enums.PriorityLevel
    reasonCodes?: JsonWithAggregatesFilter<"RiskAssessment">
    reasons?: JsonWithAggregatesFilter<"RiskAssessment">
    assessmentVersion?: StringWithAggregatesFilter<"RiskAssessment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RiskAssessment"> | Date | string
  }

  export type OperationalResponsePlanWhereInput = {
    AND?: OperationalResponsePlanWhereInput | OperationalResponsePlanWhereInput[]
    OR?: OperationalResponsePlanWhereInput[]
    NOT?: OperationalResponsePlanWhereInput | OperationalResponsePlanWhereInput[]
    id?: StringFilter<"OperationalResponsePlan"> | string
    caseId?: StringFilter<"OperationalResponsePlan"> | string
    riskAssessmentId?: StringFilter<"OperationalResponsePlan"> | string
    versionNumber?: IntFilter<"OperationalResponsePlan"> | number
    status?: StringFilter<"OperationalResponsePlan"> | string
    urgency?: StringFilter<"OperationalResponsePlan"> | string
    recommendedActionCodes?: JsonFilter<"OperationalResponsePlan">
    temporaryMeasures?: JsonFilter<"OperationalResponsePlan">
    reasons?: JsonFilter<"OperationalResponsePlan">
    alternativeActionCodes?: JsonFilter<"OperationalResponsePlan">
    planVersion?: StringFilter<"OperationalResponsePlan"> | string
    createdAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
    updatedAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    riskAssessment?: XOR<RiskAssessmentScalarRelationFilter, RiskAssessmentWhereInput>
    decisions?: OrpDecisionListRelationFilter
  }

  export type OperationalResponsePlanOrderByWithRelationInput = {
    id?: SortOrder
    caseId?: SortOrder
    riskAssessmentId?: SortOrder
    versionNumber?: SortOrder
    status?: SortOrder
    urgency?: SortOrder
    recommendedActionCodes?: SortOrder
    temporaryMeasures?: SortOrder
    reasons?: SortOrder
    alternativeActionCodes?: SortOrder
    planVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    case?: CaseOrderByWithRelationInput
    riskAssessment?: RiskAssessmentOrderByWithRelationInput
    decisions?: OrpDecisionOrderByRelationAggregateInput
  }

  export type OperationalResponsePlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    caseId_versionNumber?: OperationalResponsePlanCaseIdVersionNumberCompoundUniqueInput
    AND?: OperationalResponsePlanWhereInput | OperationalResponsePlanWhereInput[]
    OR?: OperationalResponsePlanWhereInput[]
    NOT?: OperationalResponsePlanWhereInput | OperationalResponsePlanWhereInput[]
    caseId?: StringFilter<"OperationalResponsePlan"> | string
    riskAssessmentId?: StringFilter<"OperationalResponsePlan"> | string
    versionNumber?: IntFilter<"OperationalResponsePlan"> | number
    status?: StringFilter<"OperationalResponsePlan"> | string
    urgency?: StringFilter<"OperationalResponsePlan"> | string
    recommendedActionCodes?: JsonFilter<"OperationalResponsePlan">
    temporaryMeasures?: JsonFilter<"OperationalResponsePlan">
    reasons?: JsonFilter<"OperationalResponsePlan">
    alternativeActionCodes?: JsonFilter<"OperationalResponsePlan">
    planVersion?: StringFilter<"OperationalResponsePlan"> | string
    createdAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
    updatedAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    riskAssessment?: XOR<RiskAssessmentScalarRelationFilter, RiskAssessmentWhereInput>
    decisions?: OrpDecisionListRelationFilter
  }, "id" | "caseId_versionNumber">

  export type OperationalResponsePlanOrderByWithAggregationInput = {
    id?: SortOrder
    caseId?: SortOrder
    riskAssessmentId?: SortOrder
    versionNumber?: SortOrder
    status?: SortOrder
    urgency?: SortOrder
    recommendedActionCodes?: SortOrder
    temporaryMeasures?: SortOrder
    reasons?: SortOrder
    alternativeActionCodes?: SortOrder
    planVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OperationalResponsePlanCountOrderByAggregateInput
    _avg?: OperationalResponsePlanAvgOrderByAggregateInput
    _max?: OperationalResponsePlanMaxOrderByAggregateInput
    _min?: OperationalResponsePlanMinOrderByAggregateInput
    _sum?: OperationalResponsePlanSumOrderByAggregateInput
  }

  export type OperationalResponsePlanScalarWhereWithAggregatesInput = {
    AND?: OperationalResponsePlanScalarWhereWithAggregatesInput | OperationalResponsePlanScalarWhereWithAggregatesInput[]
    OR?: OperationalResponsePlanScalarWhereWithAggregatesInput[]
    NOT?: OperationalResponsePlanScalarWhereWithAggregatesInput | OperationalResponsePlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    caseId?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    riskAssessmentId?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    versionNumber?: IntWithAggregatesFilter<"OperationalResponsePlan"> | number
    status?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    urgency?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    recommendedActionCodes?: JsonWithAggregatesFilter<"OperationalResponsePlan">
    temporaryMeasures?: JsonWithAggregatesFilter<"OperationalResponsePlan">
    reasons?: JsonWithAggregatesFilter<"OperationalResponsePlan">
    alternativeActionCodes?: JsonWithAggregatesFilter<"OperationalResponsePlan">
    planVersion?: StringWithAggregatesFilter<"OperationalResponsePlan"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OperationalResponsePlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OperationalResponsePlan"> | Date | string
  }

  export type ApprovalAuthorityWhereInput = {
    AND?: ApprovalAuthorityWhereInput | ApprovalAuthorityWhereInput[]
    OR?: ApprovalAuthorityWhereInput[]
    NOT?: ApprovalAuthorityWhereInput | ApprovalAuthorityWhereInput[]
    id?: StringFilter<"ApprovalAuthority"> | string
    userId?: StringFilter<"ApprovalAuthority"> | string
    departmentId?: StringFilter<"ApprovalAuthority"> | string
    jurisdictionId?: StringFilter<"ApprovalAuthority"> | string
    canApprove?: BoolFilter<"ApprovalAuthority"> | boolean
    canReject?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestModification?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestReinspection?: BoolFilter<"ApprovalAuthority"> | boolean
    canEscalate?: BoolFilter<"ApprovalAuthority"> | boolean
    maxPriorityLevel?: EnumPriorityLevelNullableFilter<"ApprovalAuthority"> | $Enums.PriorityLevel | null
    isActive?: BoolFilter<"ApprovalAuthority"> | boolean
    validFrom?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    validUntil?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    createdAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
    updatedAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    decisions?: OrpDecisionListRelationFilter
  }

  export type ApprovalAuthorityOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    canApprove?: SortOrder
    canReject?: SortOrder
    canRequestModification?: SortOrder
    canRequestReinspection?: SortOrder
    canEscalate?: SortOrder
    maxPriorityLevel?: SortOrderInput | SortOrder
    isActive?: SortOrder
    validFrom?: SortOrderInput | SortOrder
    validUntil?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    department?: DepartmentOrderByWithRelationInput
    jurisdiction?: JurisdictionOrderByWithRelationInput
    decisions?: OrpDecisionOrderByRelationAggregateInput
  }

  export type ApprovalAuthorityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApprovalAuthorityWhereInput | ApprovalAuthorityWhereInput[]
    OR?: ApprovalAuthorityWhereInput[]
    NOT?: ApprovalAuthorityWhereInput | ApprovalAuthorityWhereInput[]
    userId?: StringFilter<"ApprovalAuthority"> | string
    departmentId?: StringFilter<"ApprovalAuthority"> | string
    jurisdictionId?: StringFilter<"ApprovalAuthority"> | string
    canApprove?: BoolFilter<"ApprovalAuthority"> | boolean
    canReject?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestModification?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestReinspection?: BoolFilter<"ApprovalAuthority"> | boolean
    canEscalate?: BoolFilter<"ApprovalAuthority"> | boolean
    maxPriorityLevel?: EnumPriorityLevelNullableFilter<"ApprovalAuthority"> | $Enums.PriorityLevel | null
    isActive?: BoolFilter<"ApprovalAuthority"> | boolean
    validFrom?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    validUntil?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    createdAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
    updatedAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    department?: XOR<DepartmentScalarRelationFilter, DepartmentWhereInput>
    jurisdiction?: XOR<JurisdictionScalarRelationFilter, JurisdictionWhereInput>
    decisions?: OrpDecisionListRelationFilter
  }, "id">

  export type ApprovalAuthorityOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    canApprove?: SortOrder
    canReject?: SortOrder
    canRequestModification?: SortOrder
    canRequestReinspection?: SortOrder
    canEscalate?: SortOrder
    maxPriorityLevel?: SortOrderInput | SortOrder
    isActive?: SortOrder
    validFrom?: SortOrderInput | SortOrder
    validUntil?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ApprovalAuthorityCountOrderByAggregateInput
    _max?: ApprovalAuthorityMaxOrderByAggregateInput
    _min?: ApprovalAuthorityMinOrderByAggregateInput
  }

  export type ApprovalAuthorityScalarWhereWithAggregatesInput = {
    AND?: ApprovalAuthorityScalarWhereWithAggregatesInput | ApprovalAuthorityScalarWhereWithAggregatesInput[]
    OR?: ApprovalAuthorityScalarWhereWithAggregatesInput[]
    NOT?: ApprovalAuthorityScalarWhereWithAggregatesInput | ApprovalAuthorityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApprovalAuthority"> | string
    userId?: StringWithAggregatesFilter<"ApprovalAuthority"> | string
    departmentId?: StringWithAggregatesFilter<"ApprovalAuthority"> | string
    jurisdictionId?: StringWithAggregatesFilter<"ApprovalAuthority"> | string
    canApprove?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    canReject?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    canRequestModification?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    canRequestReinspection?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    canEscalate?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    maxPriorityLevel?: EnumPriorityLevelNullableWithAggregatesFilter<"ApprovalAuthority"> | $Enums.PriorityLevel | null
    isActive?: BoolWithAggregatesFilter<"ApprovalAuthority"> | boolean
    validFrom?: DateTimeNullableWithAggregatesFilter<"ApprovalAuthority"> | Date | string | null
    validUntil?: DateTimeNullableWithAggregatesFilter<"ApprovalAuthority"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ApprovalAuthority"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ApprovalAuthority"> | Date | string
  }

  export type OrpDecisionWhereInput = {
    AND?: OrpDecisionWhereInput | OrpDecisionWhereInput[]
    OR?: OrpDecisionWhereInput[]
    NOT?: OrpDecisionWhereInput | OrpDecisionWhereInput[]
    id?: StringFilter<"OrpDecision"> | string
    caseId?: StringFilter<"OrpDecision"> | string
    orpId?: StringFilter<"OrpDecision"> | string
    reviewerId?: StringFilter<"OrpDecision"> | string
    authorityGrantId?: StringFilter<"OrpDecision"> | string
    decisionType?: EnumOrpDecisionTypeFilter<"OrpDecision"> | $Enums.OrpDecisionType
    reason?: StringNullableFilter<"OrpDecision"> | string | null
    remarks?: StringNullableFilter<"OrpDecision"> | string | null
    requestedChanges?: JsonNullableFilter<"OrpDecision">
    forwardToUserId?: StringNullableFilter<"OrpDecision"> | string | null
    createdAt?: DateTimeFilter<"OrpDecision"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    orp?: XOR<OperationalResponsePlanScalarRelationFilter, OperationalResponsePlanWhereInput>
    reviewer?: XOR<UserScalarRelationFilter, UserWhereInput>
    authorityGrant?: XOR<ApprovalAuthorityScalarRelationFilter, ApprovalAuthorityWhereInput>
    forwardedUser?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type OrpDecisionOrderByWithRelationInput = {
    id?: SortOrder
    caseId?: SortOrder
    orpId?: SortOrder
    reviewerId?: SortOrder
    authorityGrantId?: SortOrder
    decisionType?: SortOrder
    reason?: SortOrderInput | SortOrder
    remarks?: SortOrderInput | SortOrder
    requestedChanges?: SortOrderInput | SortOrder
    forwardToUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    case?: CaseOrderByWithRelationInput
    orp?: OperationalResponsePlanOrderByWithRelationInput
    reviewer?: UserOrderByWithRelationInput
    authorityGrant?: ApprovalAuthorityOrderByWithRelationInput
    forwardedUser?: UserOrderByWithRelationInput
  }

  export type OrpDecisionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orpId?: string
    AND?: OrpDecisionWhereInput | OrpDecisionWhereInput[]
    OR?: OrpDecisionWhereInput[]
    NOT?: OrpDecisionWhereInput | OrpDecisionWhereInput[]
    caseId?: StringFilter<"OrpDecision"> | string
    reviewerId?: StringFilter<"OrpDecision"> | string
    authorityGrantId?: StringFilter<"OrpDecision"> | string
    decisionType?: EnumOrpDecisionTypeFilter<"OrpDecision"> | $Enums.OrpDecisionType
    reason?: StringNullableFilter<"OrpDecision"> | string | null
    remarks?: StringNullableFilter<"OrpDecision"> | string | null
    requestedChanges?: JsonNullableFilter<"OrpDecision">
    forwardToUserId?: StringNullableFilter<"OrpDecision"> | string | null
    createdAt?: DateTimeFilter<"OrpDecision"> | Date | string
    case?: XOR<CaseScalarRelationFilter, CaseWhereInput>
    orp?: XOR<OperationalResponsePlanScalarRelationFilter, OperationalResponsePlanWhereInput>
    reviewer?: XOR<UserScalarRelationFilter, UserWhereInput>
    authorityGrant?: XOR<ApprovalAuthorityScalarRelationFilter, ApprovalAuthorityWhereInput>
    forwardedUser?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id" | "orpId">

  export type OrpDecisionOrderByWithAggregationInput = {
    id?: SortOrder
    caseId?: SortOrder
    orpId?: SortOrder
    reviewerId?: SortOrder
    authorityGrantId?: SortOrder
    decisionType?: SortOrder
    reason?: SortOrderInput | SortOrder
    remarks?: SortOrderInput | SortOrder
    requestedChanges?: SortOrderInput | SortOrder
    forwardToUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OrpDecisionCountOrderByAggregateInput
    _max?: OrpDecisionMaxOrderByAggregateInput
    _min?: OrpDecisionMinOrderByAggregateInput
  }

  export type OrpDecisionScalarWhereWithAggregatesInput = {
    AND?: OrpDecisionScalarWhereWithAggregatesInput | OrpDecisionScalarWhereWithAggregatesInput[]
    OR?: OrpDecisionScalarWhereWithAggregatesInput[]
    NOT?: OrpDecisionScalarWhereWithAggregatesInput | OrpDecisionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrpDecision"> | string
    caseId?: StringWithAggregatesFilter<"OrpDecision"> | string
    orpId?: StringWithAggregatesFilter<"OrpDecision"> | string
    reviewerId?: StringWithAggregatesFilter<"OrpDecision"> | string
    authorityGrantId?: StringWithAggregatesFilter<"OrpDecision"> | string
    decisionType?: EnumOrpDecisionTypeWithAggregatesFilter<"OrpDecision"> | $Enums.OrpDecisionType
    reason?: StringNullableWithAggregatesFilter<"OrpDecision"> | string | null
    remarks?: StringNullableWithAggregatesFilter<"OrpDecision"> | string | null
    requestedChanges?: JsonNullableWithAggregatesFilter<"OrpDecision">
    forwardToUserId?: StringNullableWithAggregatesFilter<"OrpDecision"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrpDecision"> | Date | string
  }

  export type DepartmentCreateInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutDepartmentInput
    assets?: AssetCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutDepartmentInput
    assets?: AssetUncheckedCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionUncheckedCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUncheckedUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUncheckedUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentCreateManyInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
  }

  export type DepartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JurisdictionCreateInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    department: DepartmentCreateNestedOneWithoutJurisdictionsInput
    users?: UserCreateNestedManyWithoutJurisdictionInput
    assets?: AssetCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUncheckedCreateInput = {
    id?: string
    name: string
    type: string
    departmentId: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutJurisdictionInput
    assets?: AssetUncheckedCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutJurisdictionsNestedInput
    users?: UserUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUncheckedUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionCreateManyInput = {
    id?: string
    name: string
    type: string
    departmentId: string
    createdAt?: Date | string
  }

  export type JurisdictionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JurisdictionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCreateInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutAssetsInput
    jurisdiction: JurisdictionCreateNestedOneWithoutAssetsInput
    cases?: CaseCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    jurisdictionId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cases?: CaseUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutAssetsNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutAssetsNestedInput
    cases?: CaseUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cases?: CaseUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateManyInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    jurisdictionId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseCreateInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    asset: AssetCreateNestedOneWithoutCasesInput
    inspections?: InspectionCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionUncheckedCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asset?: AssetUpdateOneRequiredWithoutCasesNestedInput
    inspections?: InspectionUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUncheckedUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type CaseCreateManyInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type CaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InspectionCreateInput = {
    id?: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutInspectionsInput
    inspector: UserCreateNestedOneWithoutInspectionsInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutInspectionInput
  }

  export type InspectionUncheckedCreateInput = {
    id?: string
    caseId: string
    inspectorId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutInspectionInput
  }

  export type InspectionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutInspectionsNestedInput
    inspector?: UserUpdateOneRequiredWithoutInspectionsNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectorId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionCreateManyInput = {
    id?: string
    caseId: string
    inspectorId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InspectionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspectionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectorId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskAssessmentCreateInput = {
    id?: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutRiskAssessmentsInput
    inspection: InspectionCreateNestedOneWithoutRiskAssessmentsInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentUncheckedCreateInput = {
    id?: string
    caseId: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutRiskAssessmentsNestedInput
    inspection?: InspectionUpdateOneRequiredWithoutRiskAssessmentsNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectionId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentCreateManyInput = {
    id?: string
    caseId: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
  }

  export type RiskAssessmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskAssessmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectionId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalResponsePlanCreateInput = {
    id?: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutOperationalResponsePlansInput
    riskAssessment: RiskAssessmentCreateNestedOneWithoutOperationalResponsePlansInput
    decisions?: OrpDecisionCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanUncheckedCreateInput = {
    id?: string
    caseId: string
    riskAssessmentId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
    riskAssessment?: RiskAssessmentUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
    decisions?: OrpDecisionUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    riskAssessmentId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanCreateManyInput = {
    id?: string
    caseId: string
    riskAssessmentId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalResponsePlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalResponsePlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    riskAssessmentId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApprovalAuthorityCreateInput = {
    id?: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutApprovalAuthoritiesInput
    department: DepartmentCreateNestedOneWithoutApprovalAuthoritiesInput
    jurisdiction: JurisdictionCreateNestedOneWithoutApprovalAuthoritiesInput
    decisions?: OrpDecisionCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityUncheckedCreateInput = {
    id?: string
    userId: string
    departmentId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    department?: DepartmentUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    decisions?: OrpDecisionUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityCreateManyInput = {
    id?: string
    userId: string
    departmentId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApprovalAuthorityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApprovalAuthorityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionCreateInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutOrpDecisionsInput
    orp: OperationalResponsePlanCreateNestedOneWithoutDecisionsInput
    reviewer: UserCreateNestedOneWithoutReviewedOrpDecisionsInput
    authorityGrant: ApprovalAuthorityCreateNestedOneWithoutDecisionsInput
    forwardedUser?: UserCreateNestedOneWithoutForwardedOrpDecisionsInput
  }

  export type OrpDecisionUncheckedCreateInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput
    orp?: OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput
    reviewer?: UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput
    authorityGrant?: ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput
    forwardedUser?: UserUpdateOneWithoutForwardedOrpDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionCreateManyInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type AssetListRelationFilter = {
    every?: AssetWhereInput
    some?: AssetWhereInput
    none?: AssetWhereInput
  }

  export type JurisdictionListRelationFilter = {
    every?: JurisdictionWhereInput
    some?: JurisdictionWhereInput
    none?: JurisdictionWhereInput
  }

  export type ApprovalAuthorityListRelationFilter = {
    every?: ApprovalAuthorityWhereInput
    some?: ApprovalAuthorityWhereInput
    none?: ApprovalAuthorityWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type JurisdictionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApprovalAuthorityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DepartmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
  }

  export type DepartmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DepartmentScalarRelationFilter = {
    is?: DepartmentWhereInput
    isNot?: DepartmentWhereInput
  }

  export type JurisdictionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    departmentId?: SortOrder
    createdAt?: SortOrder
  }

  export type JurisdictionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    departmentId?: SortOrder
    createdAt?: SortOrder
  }

  export type JurisdictionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    departmentId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumSystemRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.SystemRole | EnumSystemRoleFieldRefInput<$PrismaModel>
    in?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumSystemRoleFilter<$PrismaModel> | $Enums.SystemRole
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type JurisdictionScalarRelationFilter = {
    is?: JurisdictionWhereInput
    isNot?: JurisdictionWhereInput
  }

  export type InspectionListRelationFilter = {
    every?: InspectionWhereInput
    some?: InspectionWhereInput
    none?: InspectionWhereInput
  }

  export type OrpDecisionListRelationFilter = {
    every?: OrpDecisionWhereInput
    some?: OrpDecisionWhereInput
    none?: OrpDecisionWhereInput
  }

  export type InspectionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrpDecisionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    designation?: SortOrder
    role?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    designation?: SortOrder
    role?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    designation?: SortOrder
    role?: SortOrder
    status?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumSystemRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SystemRole | EnumSystemRoleFieldRefInput<$PrismaModel>
    in?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumSystemRoleWithAggregatesFilter<$PrismaModel> | $Enums.SystemRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSystemRoleFilter<$PrismaModel>
    _max?: NestedEnumSystemRoleFilter<$PrismaModel>
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type EnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type CaseListRelationFilter = {
    every?: CaseWhereInput
    some?: CaseWhereInput
    none?: CaseWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CaseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetCountOrderByAggregateInput = {
    id?: SortOrder
    assetCode?: SortOrder
    name?: SortOrder
    assetType?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    constructionYear?: SortOrder
    conditionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    constructionYear?: SortOrder
  }

  export type AssetMaxOrderByAggregateInput = {
    id?: SortOrder
    assetCode?: SortOrder
    name?: SortOrder
    assetType?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    constructionYear?: SortOrder
    conditionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetMinOrderByAggregateInput = {
    id?: SortOrder
    assetCode?: SortOrder
    name?: SortOrder
    assetType?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    constructionYear?: SortOrder
    conditionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    constructionYear?: SortOrder
  }

  export type EnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumCaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CaseStatus | EnumCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCaseStatusFilter<$PrismaModel> | $Enums.CaseStatus
  }

  export type EnumRiskLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRiskLevelNullableFilter<$PrismaModel> | $Enums.RiskLevel | null
  }

  export type EnumPriorityLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPriorityLevelNullableFilter<$PrismaModel> | $Enums.PriorityLevel | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AssetScalarRelationFilter = {
    is?: AssetWhereInput
    isNot?: AssetWhereInput
  }

  export type RiskAssessmentListRelationFilter = {
    every?: RiskAssessmentWhereInput
    some?: RiskAssessmentWhereInput
    none?: RiskAssessmentWhereInput
  }

  export type OperationalResponsePlanListRelationFilter = {
    every?: OperationalResponsePlanWhereInput
    some?: OperationalResponsePlanWhereInput
    none?: OperationalResponsePlanWhereInput
  }

  export type RiskAssessmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OperationalResponsePlanOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CaseCountOrderByAggregateInput = {
    id?: SortOrder
    caseNumber?: SortOrder
    assetId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    emergencyFlag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type CaseMaxOrderByAggregateInput = {
    id?: SortOrder
    caseNumber?: SortOrder
    assetId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    emergencyFlag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type CaseMinOrderByAggregateInput = {
    id?: SortOrder
    caseNumber?: SortOrder
    assetId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    emergencyFlag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type EnumCaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CaseStatus | EnumCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.CaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCaseStatusFilter<$PrismaModel>
    _max?: NestedEnumCaseStatusFilter<$PrismaModel>
  }

  export type EnumRiskLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelNullableFilter<$PrismaModel>
  }

  export type EnumPriorityLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPriorityLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.PriorityLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPriorityLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumPriorityLevelNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CaseScalarRelationFilter = {
    is?: CaseWhereInput
    isNot?: CaseWhereInput
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type InspectionCountOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectorId?: SortOrder
    inspectionDate?: SortOrder
    structuralCondition?: SortOrder
    crackSeverity?: SortOrder
    corrosionLevel?: SortOrder
    trafficImportance?: SortOrder
    hospitalRoute?: SortOrder
    weatherRisk?: SortOrder
    heavyRainExpected?: SortOrder
    estimatedDailyUsers?: SortOrder
    inspectionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InspectionAvgOrderByAggregateInput = {
    estimatedDailyUsers?: SortOrder
  }

  export type InspectionMaxOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectorId?: SortOrder
    inspectionDate?: SortOrder
    structuralCondition?: SortOrder
    crackSeverity?: SortOrder
    corrosionLevel?: SortOrder
    trafficImportance?: SortOrder
    hospitalRoute?: SortOrder
    weatherRisk?: SortOrder
    heavyRainExpected?: SortOrder
    estimatedDailyUsers?: SortOrder
    inspectionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InspectionMinOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectorId?: SortOrder
    inspectionDate?: SortOrder
    structuralCondition?: SortOrder
    crackSeverity?: SortOrder
    corrosionLevel?: SortOrder
    trafficImportance?: SortOrder
    hospitalRoute?: SortOrder
    weatherRisk?: SortOrder
    heavyRainExpected?: SortOrder
    estimatedDailyUsers?: SortOrder
    inspectionNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InspectionSumOrderByAggregateInput = {
    estimatedDailyUsers?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type EnumPriorityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityLevelFilter<$PrismaModel> | $Enums.PriorityLevel
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type InspectionScalarRelationFilter = {
    is?: InspectionWhereInput
    isNot?: InspectionWhereInput
  }

  export type RiskAssessmentCountOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectionId?: SortOrder
    riskScore?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    reasonCodes?: SortOrder
    reasons?: SortOrder
    assessmentVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type RiskAssessmentAvgOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type RiskAssessmentMaxOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectionId?: SortOrder
    riskScore?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    assessmentVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type RiskAssessmentMinOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    inspectionId?: SortOrder
    riskScore?: SortOrder
    riskLevel?: SortOrder
    priorityLevel?: SortOrder
    assessmentVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type RiskAssessmentSumOrderByAggregateInput = {
    riskScore?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type EnumPriorityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityLevelWithAggregatesFilter<$PrismaModel> | $Enums.PriorityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriorityLevelFilter<$PrismaModel>
    _max?: NestedEnumPriorityLevelFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type RiskAssessmentScalarRelationFilter = {
    is?: RiskAssessmentWhereInput
    isNot?: RiskAssessmentWhereInput
  }

  export type OperationalResponsePlanCaseIdVersionNumberCompoundUniqueInput = {
    caseId: string
    versionNumber: number
  }

  export type OperationalResponsePlanCountOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    riskAssessmentId?: SortOrder
    versionNumber?: SortOrder
    status?: SortOrder
    urgency?: SortOrder
    recommendedActionCodes?: SortOrder
    temporaryMeasures?: SortOrder
    reasons?: SortOrder
    alternativeActionCodes?: SortOrder
    planVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalResponsePlanAvgOrderByAggregateInput = {
    versionNumber?: SortOrder
  }

  export type OperationalResponsePlanMaxOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    riskAssessmentId?: SortOrder
    versionNumber?: SortOrder
    status?: SortOrder
    urgency?: SortOrder
    planVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalResponsePlanMinOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    riskAssessmentId?: SortOrder
    versionNumber?: SortOrder
    status?: SortOrder
    urgency?: SortOrder
    planVersion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OperationalResponsePlanSumOrderByAggregateInput = {
    versionNumber?: SortOrder
  }

  export type ApprovalAuthorityCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    canApprove?: SortOrder
    canReject?: SortOrder
    canRequestModification?: SortOrder
    canRequestReinspection?: SortOrder
    canEscalate?: SortOrder
    maxPriorityLevel?: SortOrder
    isActive?: SortOrder
    validFrom?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApprovalAuthorityMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    canApprove?: SortOrder
    canReject?: SortOrder
    canRequestModification?: SortOrder
    canRequestReinspection?: SortOrder
    canEscalate?: SortOrder
    maxPriorityLevel?: SortOrder
    isActive?: SortOrder
    validFrom?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApprovalAuthorityMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    departmentId?: SortOrder
    jurisdictionId?: SortOrder
    canApprove?: SortOrder
    canReject?: SortOrder
    canRequestModification?: SortOrder
    canRequestReinspection?: SortOrder
    canEscalate?: SortOrder
    maxPriorityLevel?: SortOrder
    isActive?: SortOrder
    validFrom?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumOrpDecisionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrpDecisionType | EnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrpDecisionTypeFilter<$PrismaModel> | $Enums.OrpDecisionType
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type OperationalResponsePlanScalarRelationFilter = {
    is?: OperationalResponsePlanWhereInput
    isNot?: OperationalResponsePlanWhereInput
  }

  export type ApprovalAuthorityScalarRelationFilter = {
    is?: ApprovalAuthorityWhereInput
    isNot?: ApprovalAuthorityWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type OrpDecisionCountOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    orpId?: SortOrder
    reviewerId?: SortOrder
    authorityGrantId?: SortOrder
    decisionType?: SortOrder
    reason?: SortOrder
    remarks?: SortOrder
    requestedChanges?: SortOrder
    forwardToUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type OrpDecisionMaxOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    orpId?: SortOrder
    reviewerId?: SortOrder
    authorityGrantId?: SortOrder
    decisionType?: SortOrder
    reason?: SortOrder
    remarks?: SortOrder
    forwardToUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type OrpDecisionMinOrderByAggregateInput = {
    id?: SortOrder
    caseId?: SortOrder
    orpId?: SortOrder
    reviewerId?: SortOrder
    authorityGrantId?: SortOrder
    decisionType?: SortOrder
    reason?: SortOrder
    remarks?: SortOrder
    forwardToUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumOrpDecisionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrpDecisionType | EnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrpDecisionTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrpDecisionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrpDecisionTypeFilter<$PrismaModel>
    _max?: NestedEnumOrpDecisionTypeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type UserCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AssetCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput> | AssetCreateWithoutDepartmentInput[] | AssetUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutDepartmentInput | AssetCreateOrConnectWithoutDepartmentInput[]
    createMany?: AssetCreateManyDepartmentInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type JurisdictionCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput> | JurisdictionCreateWithoutDepartmentInput[] | JurisdictionUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: JurisdictionCreateOrConnectWithoutDepartmentInput | JurisdictionCreateOrConnectWithoutDepartmentInput[]
    createMany?: JurisdictionCreateManyDepartmentInputEnvelope
    connect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
  }

  export type ApprovalAuthorityCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput> | ApprovalAuthorityCreateWithoutDepartmentInput[] | ApprovalAuthorityUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDepartmentInput | ApprovalAuthorityCreateOrConnectWithoutDepartmentInput[]
    createMany?: ApprovalAuthorityCreateManyDepartmentInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AssetUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput> | AssetCreateWithoutDepartmentInput[] | AssetUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutDepartmentInput | AssetCreateOrConnectWithoutDepartmentInput[]
    createMany?: AssetCreateManyDepartmentInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type JurisdictionUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput> | JurisdictionCreateWithoutDepartmentInput[] | JurisdictionUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: JurisdictionCreateOrConnectWithoutDepartmentInput | JurisdictionCreateOrConnectWithoutDepartmentInput[]
    createMany?: JurisdictionCreateManyDepartmentInputEnvelope
    connect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
  }

  export type ApprovalAuthorityUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput> | ApprovalAuthorityCreateWithoutDepartmentInput[] | ApprovalAuthorityUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDepartmentInput | ApprovalAuthorityCreateOrConnectWithoutDepartmentInput[]
    createMany?: ApprovalAuthorityCreateManyDepartmentInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDepartmentInput | UserUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDepartmentInput | UserUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDepartmentInput | UserUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AssetUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput> | AssetCreateWithoutDepartmentInput[] | AssetUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutDepartmentInput | AssetCreateOrConnectWithoutDepartmentInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutDepartmentInput | AssetUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: AssetCreateManyDepartmentInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutDepartmentInput | AssetUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutDepartmentInput | AssetUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type JurisdictionUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput> | JurisdictionCreateWithoutDepartmentInput[] | JurisdictionUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: JurisdictionCreateOrConnectWithoutDepartmentInput | JurisdictionCreateOrConnectWithoutDepartmentInput[]
    upsert?: JurisdictionUpsertWithWhereUniqueWithoutDepartmentInput | JurisdictionUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: JurisdictionCreateManyDepartmentInputEnvelope
    set?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    disconnect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    delete?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    connect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    update?: JurisdictionUpdateWithWhereUniqueWithoutDepartmentInput | JurisdictionUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: JurisdictionUpdateManyWithWhereWithoutDepartmentInput | JurisdictionUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: JurisdictionScalarWhereInput | JurisdictionScalarWhereInput[]
  }

  export type ApprovalAuthorityUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput> | ApprovalAuthorityCreateWithoutDepartmentInput[] | ApprovalAuthorityUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDepartmentInput | ApprovalAuthorityCreateOrConnectWithoutDepartmentInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutDepartmentInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ApprovalAuthorityCreateManyDepartmentInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutDepartmentInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutDepartmentInput | ApprovalAuthorityUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDepartmentInput | UserUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDepartmentInput | UserUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDepartmentInput | UserUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AssetUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput> | AssetCreateWithoutDepartmentInput[] | AssetUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutDepartmentInput | AssetCreateOrConnectWithoutDepartmentInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutDepartmentInput | AssetUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: AssetCreateManyDepartmentInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutDepartmentInput | AssetUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutDepartmentInput | AssetUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type JurisdictionUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput> | JurisdictionCreateWithoutDepartmentInput[] | JurisdictionUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: JurisdictionCreateOrConnectWithoutDepartmentInput | JurisdictionCreateOrConnectWithoutDepartmentInput[]
    upsert?: JurisdictionUpsertWithWhereUniqueWithoutDepartmentInput | JurisdictionUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: JurisdictionCreateManyDepartmentInputEnvelope
    set?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    disconnect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    delete?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    connect?: JurisdictionWhereUniqueInput | JurisdictionWhereUniqueInput[]
    update?: JurisdictionUpdateWithWhereUniqueWithoutDepartmentInput | JurisdictionUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: JurisdictionUpdateManyWithWhereWithoutDepartmentInput | JurisdictionUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: JurisdictionScalarWhereInput | JurisdictionScalarWhereInput[]
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput> | ApprovalAuthorityCreateWithoutDepartmentInput[] | ApprovalAuthorityUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDepartmentInput | ApprovalAuthorityCreateOrConnectWithoutDepartmentInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutDepartmentInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: ApprovalAuthorityCreateManyDepartmentInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutDepartmentInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutDepartmentInput | ApprovalAuthorityUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type DepartmentCreateNestedOneWithoutJurisdictionsInput = {
    create?: XOR<DepartmentCreateWithoutJurisdictionsInput, DepartmentUncheckedCreateWithoutJurisdictionsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutJurisdictionsInput
    connect?: DepartmentWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput> | UserCreateWithoutJurisdictionInput[] | UserUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: UserCreateOrConnectWithoutJurisdictionInput | UserCreateOrConnectWithoutJurisdictionInput[]
    createMany?: UserCreateManyJurisdictionInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AssetCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput> | AssetCreateWithoutJurisdictionInput[] | AssetUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutJurisdictionInput | AssetCreateOrConnectWithoutJurisdictionInput[]
    createMany?: AssetCreateManyJurisdictionInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type ApprovalAuthorityCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput> | ApprovalAuthorityCreateWithoutJurisdictionInput[] | ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput | ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput[]
    createMany?: ApprovalAuthorityCreateManyJurisdictionInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput> | UserCreateWithoutJurisdictionInput[] | UserUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: UserCreateOrConnectWithoutJurisdictionInput | UserCreateOrConnectWithoutJurisdictionInput[]
    createMany?: UserCreateManyJurisdictionInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AssetUncheckedCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput> | AssetCreateWithoutJurisdictionInput[] | AssetUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutJurisdictionInput | AssetCreateOrConnectWithoutJurisdictionInput[]
    createMany?: AssetCreateManyJurisdictionInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type ApprovalAuthorityUncheckedCreateNestedManyWithoutJurisdictionInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput> | ApprovalAuthorityCreateWithoutJurisdictionInput[] | ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput | ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput[]
    createMany?: ApprovalAuthorityCreateManyJurisdictionInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type DepartmentUpdateOneRequiredWithoutJurisdictionsNestedInput = {
    create?: XOR<DepartmentCreateWithoutJurisdictionsInput, DepartmentUncheckedCreateWithoutJurisdictionsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutJurisdictionsInput
    upsert?: DepartmentUpsertWithoutJurisdictionsInput
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutJurisdictionsInput, DepartmentUpdateWithoutJurisdictionsInput>, DepartmentUncheckedUpdateWithoutJurisdictionsInput>
  }

  export type UserUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput> | UserCreateWithoutJurisdictionInput[] | UserUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: UserCreateOrConnectWithoutJurisdictionInput | UserCreateOrConnectWithoutJurisdictionInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutJurisdictionInput | UserUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: UserCreateManyJurisdictionInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutJurisdictionInput | UserUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: UserUpdateManyWithWhereWithoutJurisdictionInput | UserUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AssetUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput> | AssetCreateWithoutJurisdictionInput[] | AssetUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutJurisdictionInput | AssetCreateOrConnectWithoutJurisdictionInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutJurisdictionInput | AssetUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: AssetCreateManyJurisdictionInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutJurisdictionInput | AssetUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutJurisdictionInput | AssetUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type ApprovalAuthorityUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput> | ApprovalAuthorityCreateWithoutJurisdictionInput[] | ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput | ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutJurisdictionInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: ApprovalAuthorityCreateManyJurisdictionInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutJurisdictionInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutJurisdictionInput | ApprovalAuthorityUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput> | UserCreateWithoutJurisdictionInput[] | UserUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: UserCreateOrConnectWithoutJurisdictionInput | UserCreateOrConnectWithoutJurisdictionInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutJurisdictionInput | UserUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: UserCreateManyJurisdictionInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutJurisdictionInput | UserUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: UserUpdateManyWithWhereWithoutJurisdictionInput | UserUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AssetUncheckedUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput> | AssetCreateWithoutJurisdictionInput[] | AssetUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutJurisdictionInput | AssetCreateOrConnectWithoutJurisdictionInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutJurisdictionInput | AssetUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: AssetCreateManyJurisdictionInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutJurisdictionInput | AssetUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutJurisdictionInput | AssetUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput> | ApprovalAuthorityCreateWithoutJurisdictionInput[] | ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput | ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutJurisdictionInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutJurisdictionInput[]
    createMany?: ApprovalAuthorityCreateManyJurisdictionInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutJurisdictionInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutJurisdictionInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutJurisdictionInput | ApprovalAuthorityUpdateManyWithWhereWithoutJurisdictionInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type DepartmentCreateNestedOneWithoutUsersInput = {
    create?: XOR<DepartmentCreateWithoutUsersInput, DepartmentUncheckedCreateWithoutUsersInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutUsersInput
    connect?: DepartmentWhereUniqueInput
  }

  export type JurisdictionCreateNestedOneWithoutUsersInput = {
    create?: XOR<JurisdictionCreateWithoutUsersInput, JurisdictionUncheckedCreateWithoutUsersInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutUsersInput
    connect?: JurisdictionWhereUniqueInput
  }

  export type InspectionCreateNestedManyWithoutInspectorInput = {
    create?: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput> | InspectionCreateWithoutInspectorInput[] | InspectionUncheckedCreateWithoutInspectorInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutInspectorInput | InspectionCreateOrConnectWithoutInspectorInput[]
    createMany?: InspectionCreateManyInspectorInputEnvelope
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
  }

  export type ApprovalAuthorityCreateNestedManyWithoutUserInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput> | ApprovalAuthorityCreateWithoutUserInput[] | ApprovalAuthorityUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutUserInput | ApprovalAuthorityCreateOrConnectWithoutUserInput[]
    createMany?: ApprovalAuthorityCreateManyUserInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type OrpDecisionCreateNestedManyWithoutReviewerInput = {
    create?: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput> | OrpDecisionCreateWithoutReviewerInput[] | OrpDecisionUncheckedCreateWithoutReviewerInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutReviewerInput | OrpDecisionCreateOrConnectWithoutReviewerInput[]
    createMany?: OrpDecisionCreateManyReviewerInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type OrpDecisionCreateNestedManyWithoutForwardedUserInput = {
    create?: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput> | OrpDecisionCreateWithoutForwardedUserInput[] | OrpDecisionUncheckedCreateWithoutForwardedUserInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutForwardedUserInput | OrpDecisionCreateOrConnectWithoutForwardedUserInput[]
    createMany?: OrpDecisionCreateManyForwardedUserInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type InspectionUncheckedCreateNestedManyWithoutInspectorInput = {
    create?: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput> | InspectionCreateWithoutInspectorInput[] | InspectionUncheckedCreateWithoutInspectorInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutInspectorInput | InspectionCreateOrConnectWithoutInspectorInput[]
    createMany?: InspectionCreateManyInspectorInputEnvelope
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
  }

  export type ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput> | ApprovalAuthorityCreateWithoutUserInput[] | ApprovalAuthorityUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutUserInput | ApprovalAuthorityCreateOrConnectWithoutUserInput[]
    createMany?: ApprovalAuthorityCreateManyUserInputEnvelope
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
  }

  export type OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput = {
    create?: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput> | OrpDecisionCreateWithoutReviewerInput[] | OrpDecisionUncheckedCreateWithoutReviewerInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutReviewerInput | OrpDecisionCreateOrConnectWithoutReviewerInput[]
    createMany?: OrpDecisionCreateManyReviewerInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput = {
    create?: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput> | OrpDecisionCreateWithoutForwardedUserInput[] | OrpDecisionUncheckedCreateWithoutForwardedUserInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutForwardedUserInput | OrpDecisionCreateOrConnectWithoutForwardedUserInput[]
    createMany?: OrpDecisionCreateManyForwardedUserInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type EnumSystemRoleFieldUpdateOperationsInput = {
    set?: $Enums.SystemRole
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type DepartmentUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<DepartmentCreateWithoutUsersInput, DepartmentUncheckedCreateWithoutUsersInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutUsersInput
    upsert?: DepartmentUpsertWithoutUsersInput
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutUsersInput, DepartmentUpdateWithoutUsersInput>, DepartmentUncheckedUpdateWithoutUsersInput>
  }

  export type JurisdictionUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<JurisdictionCreateWithoutUsersInput, JurisdictionUncheckedCreateWithoutUsersInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutUsersInput
    upsert?: JurisdictionUpsertWithoutUsersInput
    connect?: JurisdictionWhereUniqueInput
    update?: XOR<XOR<JurisdictionUpdateToOneWithWhereWithoutUsersInput, JurisdictionUpdateWithoutUsersInput>, JurisdictionUncheckedUpdateWithoutUsersInput>
  }

  export type InspectionUpdateManyWithoutInspectorNestedInput = {
    create?: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput> | InspectionCreateWithoutInspectorInput[] | InspectionUncheckedCreateWithoutInspectorInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutInspectorInput | InspectionCreateOrConnectWithoutInspectorInput[]
    upsert?: InspectionUpsertWithWhereUniqueWithoutInspectorInput | InspectionUpsertWithWhereUniqueWithoutInspectorInput[]
    createMany?: InspectionCreateManyInspectorInputEnvelope
    set?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    disconnect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    delete?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    update?: InspectionUpdateWithWhereUniqueWithoutInspectorInput | InspectionUpdateWithWhereUniqueWithoutInspectorInput[]
    updateMany?: InspectionUpdateManyWithWhereWithoutInspectorInput | InspectionUpdateManyWithWhereWithoutInspectorInput[]
    deleteMany?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
  }

  export type ApprovalAuthorityUpdateManyWithoutUserNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput> | ApprovalAuthorityCreateWithoutUserInput[] | ApprovalAuthorityUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutUserInput | ApprovalAuthorityCreateOrConnectWithoutUserInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutUserInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ApprovalAuthorityCreateManyUserInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutUserInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutUserInput | ApprovalAuthorityUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type OrpDecisionUpdateManyWithoutReviewerNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput> | OrpDecisionCreateWithoutReviewerInput[] | OrpDecisionUncheckedCreateWithoutReviewerInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutReviewerInput | OrpDecisionCreateOrConnectWithoutReviewerInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutReviewerInput | OrpDecisionUpsertWithWhereUniqueWithoutReviewerInput[]
    createMany?: OrpDecisionCreateManyReviewerInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutReviewerInput | OrpDecisionUpdateWithWhereUniqueWithoutReviewerInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutReviewerInput | OrpDecisionUpdateManyWithWhereWithoutReviewerInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type OrpDecisionUpdateManyWithoutForwardedUserNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput> | OrpDecisionCreateWithoutForwardedUserInput[] | OrpDecisionUncheckedCreateWithoutForwardedUserInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutForwardedUserInput | OrpDecisionCreateOrConnectWithoutForwardedUserInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutForwardedUserInput | OrpDecisionUpsertWithWhereUniqueWithoutForwardedUserInput[]
    createMany?: OrpDecisionCreateManyForwardedUserInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutForwardedUserInput | OrpDecisionUpdateWithWhereUniqueWithoutForwardedUserInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutForwardedUserInput | OrpDecisionUpdateManyWithWhereWithoutForwardedUserInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type InspectionUncheckedUpdateManyWithoutInspectorNestedInput = {
    create?: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput> | InspectionCreateWithoutInspectorInput[] | InspectionUncheckedCreateWithoutInspectorInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutInspectorInput | InspectionCreateOrConnectWithoutInspectorInput[]
    upsert?: InspectionUpsertWithWhereUniqueWithoutInspectorInput | InspectionUpsertWithWhereUniqueWithoutInspectorInput[]
    createMany?: InspectionCreateManyInspectorInputEnvelope
    set?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    disconnect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    delete?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    update?: InspectionUpdateWithWhereUniqueWithoutInspectorInput | InspectionUpdateWithWhereUniqueWithoutInspectorInput[]
    updateMany?: InspectionUpdateManyWithWhereWithoutInspectorInput | InspectionUpdateManyWithWhereWithoutInspectorInput[]
    deleteMany?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput> | ApprovalAuthorityCreateWithoutUserInput[] | ApprovalAuthorityUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutUserInput | ApprovalAuthorityCreateOrConnectWithoutUserInput[]
    upsert?: ApprovalAuthorityUpsertWithWhereUniqueWithoutUserInput | ApprovalAuthorityUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ApprovalAuthorityCreateManyUserInputEnvelope
    set?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    disconnect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    delete?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    connect?: ApprovalAuthorityWhereUniqueInput | ApprovalAuthorityWhereUniqueInput[]
    update?: ApprovalAuthorityUpdateWithWhereUniqueWithoutUserInput | ApprovalAuthorityUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ApprovalAuthorityUpdateManyWithWhereWithoutUserInput | ApprovalAuthorityUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
  }

  export type OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput> | OrpDecisionCreateWithoutReviewerInput[] | OrpDecisionUncheckedCreateWithoutReviewerInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutReviewerInput | OrpDecisionCreateOrConnectWithoutReviewerInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutReviewerInput | OrpDecisionUpsertWithWhereUniqueWithoutReviewerInput[]
    createMany?: OrpDecisionCreateManyReviewerInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutReviewerInput | OrpDecisionUpdateWithWhereUniqueWithoutReviewerInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutReviewerInput | OrpDecisionUpdateManyWithWhereWithoutReviewerInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput> | OrpDecisionCreateWithoutForwardedUserInput[] | OrpDecisionUncheckedCreateWithoutForwardedUserInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutForwardedUserInput | OrpDecisionCreateOrConnectWithoutForwardedUserInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutForwardedUserInput | OrpDecisionUpsertWithWhereUniqueWithoutForwardedUserInput[]
    createMany?: OrpDecisionCreateManyForwardedUserInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutForwardedUserInput | OrpDecisionUpdateWithWhereUniqueWithoutForwardedUserInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutForwardedUserInput | OrpDecisionUpdateManyWithWhereWithoutForwardedUserInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type DepartmentCreateNestedOneWithoutAssetsInput = {
    create?: XOR<DepartmentCreateWithoutAssetsInput, DepartmentUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutAssetsInput
    connect?: DepartmentWhereUniqueInput
  }

  export type JurisdictionCreateNestedOneWithoutAssetsInput = {
    create?: XOR<JurisdictionCreateWithoutAssetsInput, JurisdictionUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutAssetsInput
    connect?: JurisdictionWhereUniqueInput
  }

  export type CaseCreateNestedManyWithoutAssetInput = {
    create?: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput> | CaseCreateWithoutAssetInput[] | CaseUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CaseCreateOrConnectWithoutAssetInput | CaseCreateOrConnectWithoutAssetInput[]
    createMany?: CaseCreateManyAssetInputEnvelope
    connect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
  }

  export type CaseUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput> | CaseCreateWithoutAssetInput[] | CaseUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CaseCreateOrConnectWithoutAssetInput | CaseCreateOrConnectWithoutAssetInput[]
    createMany?: CaseCreateManyAssetInputEnvelope
    connect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
  }

  export type EnumAssetTypeFieldUpdateOperationsInput = {
    set?: $Enums.AssetType
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DepartmentUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: XOR<DepartmentCreateWithoutAssetsInput, DepartmentUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutAssetsInput
    upsert?: DepartmentUpsertWithoutAssetsInput
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutAssetsInput, DepartmentUpdateWithoutAssetsInput>, DepartmentUncheckedUpdateWithoutAssetsInput>
  }

  export type JurisdictionUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: XOR<JurisdictionCreateWithoutAssetsInput, JurisdictionUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutAssetsInput
    upsert?: JurisdictionUpsertWithoutAssetsInput
    connect?: JurisdictionWhereUniqueInput
    update?: XOR<XOR<JurisdictionUpdateToOneWithWhereWithoutAssetsInput, JurisdictionUpdateWithoutAssetsInput>, JurisdictionUncheckedUpdateWithoutAssetsInput>
  }

  export type CaseUpdateManyWithoutAssetNestedInput = {
    create?: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput> | CaseCreateWithoutAssetInput[] | CaseUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CaseCreateOrConnectWithoutAssetInput | CaseCreateOrConnectWithoutAssetInput[]
    upsert?: CaseUpsertWithWhereUniqueWithoutAssetInput | CaseUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: CaseCreateManyAssetInputEnvelope
    set?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    disconnect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    delete?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    connect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    update?: CaseUpdateWithWhereUniqueWithoutAssetInput | CaseUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: CaseUpdateManyWithWhereWithoutAssetInput | CaseUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: CaseScalarWhereInput | CaseScalarWhereInput[]
  }

  export type CaseUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput> | CaseCreateWithoutAssetInput[] | CaseUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CaseCreateOrConnectWithoutAssetInput | CaseCreateOrConnectWithoutAssetInput[]
    upsert?: CaseUpsertWithWhereUniqueWithoutAssetInput | CaseUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: CaseCreateManyAssetInputEnvelope
    set?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    disconnect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    delete?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    connect?: CaseWhereUniqueInput | CaseWhereUniqueInput[]
    update?: CaseUpdateWithWhereUniqueWithoutAssetInput | CaseUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: CaseUpdateManyWithWhereWithoutAssetInput | CaseUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: CaseScalarWhereInput | CaseScalarWhereInput[]
  }

  export type AssetCreateNestedOneWithoutCasesInput = {
    create?: XOR<AssetCreateWithoutCasesInput, AssetUncheckedCreateWithoutCasesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutCasesInput
    connect?: AssetWhereUniqueInput
  }

  export type InspectionCreateNestedManyWithoutCaseInput = {
    create?: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput> | InspectionCreateWithoutCaseInput[] | InspectionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutCaseInput | InspectionCreateOrConnectWithoutCaseInput[]
    createMany?: InspectionCreateManyCaseInputEnvelope
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
  }

  export type RiskAssessmentCreateNestedManyWithoutCaseInput = {
    create?: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput> | RiskAssessmentCreateWithoutCaseInput[] | RiskAssessmentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutCaseInput | RiskAssessmentCreateOrConnectWithoutCaseInput[]
    createMany?: RiskAssessmentCreateManyCaseInputEnvelope
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
  }

  export type OperationalResponsePlanCreateNestedManyWithoutCaseInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput> | OperationalResponsePlanCreateWithoutCaseInput[] | OperationalResponsePlanUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutCaseInput | OperationalResponsePlanCreateOrConnectWithoutCaseInput[]
    createMany?: OperationalResponsePlanCreateManyCaseInputEnvelope
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
  }

  export type OrpDecisionCreateNestedManyWithoutCaseInput = {
    create?: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput> | OrpDecisionCreateWithoutCaseInput[] | OrpDecisionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutCaseInput | OrpDecisionCreateOrConnectWithoutCaseInput[]
    createMany?: OrpDecisionCreateManyCaseInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type InspectionUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput> | InspectionCreateWithoutCaseInput[] | InspectionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutCaseInput | InspectionCreateOrConnectWithoutCaseInput[]
    createMany?: InspectionCreateManyCaseInputEnvelope
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
  }

  export type RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput> | RiskAssessmentCreateWithoutCaseInput[] | RiskAssessmentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutCaseInput | RiskAssessmentCreateOrConnectWithoutCaseInput[]
    createMany?: RiskAssessmentCreateManyCaseInputEnvelope
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
  }

  export type OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput> | OperationalResponsePlanCreateWithoutCaseInput[] | OperationalResponsePlanUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutCaseInput | OperationalResponsePlanCreateOrConnectWithoutCaseInput[]
    createMany?: OperationalResponsePlanCreateManyCaseInputEnvelope
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
  }

  export type OrpDecisionUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput> | OrpDecisionCreateWithoutCaseInput[] | OrpDecisionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutCaseInput | OrpDecisionCreateOrConnectWithoutCaseInput[]
    createMany?: OrpDecisionCreateManyCaseInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type EnumCaseStatusFieldUpdateOperationsInput = {
    set?: $Enums.CaseStatus
  }

  export type NullableEnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel | null
  }

  export type NullableEnumPriorityLevelFieldUpdateOperationsInput = {
    set?: $Enums.PriorityLevel | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AssetUpdateOneRequiredWithoutCasesNestedInput = {
    create?: XOR<AssetCreateWithoutCasesInput, AssetUncheckedCreateWithoutCasesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutCasesInput
    upsert?: AssetUpsertWithoutCasesInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutCasesInput, AssetUpdateWithoutCasesInput>, AssetUncheckedUpdateWithoutCasesInput>
  }

  export type InspectionUpdateManyWithoutCaseNestedInput = {
    create?: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput> | InspectionCreateWithoutCaseInput[] | InspectionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutCaseInput | InspectionCreateOrConnectWithoutCaseInput[]
    upsert?: InspectionUpsertWithWhereUniqueWithoutCaseInput | InspectionUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: InspectionCreateManyCaseInputEnvelope
    set?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    disconnect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    delete?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    update?: InspectionUpdateWithWhereUniqueWithoutCaseInput | InspectionUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: InspectionUpdateManyWithWhereWithoutCaseInput | InspectionUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
  }

  export type RiskAssessmentUpdateManyWithoutCaseNestedInput = {
    create?: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput> | RiskAssessmentCreateWithoutCaseInput[] | RiskAssessmentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutCaseInput | RiskAssessmentCreateOrConnectWithoutCaseInput[]
    upsert?: RiskAssessmentUpsertWithWhereUniqueWithoutCaseInput | RiskAssessmentUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: RiskAssessmentCreateManyCaseInputEnvelope
    set?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    disconnect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    delete?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    update?: RiskAssessmentUpdateWithWhereUniqueWithoutCaseInput | RiskAssessmentUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: RiskAssessmentUpdateManyWithWhereWithoutCaseInput | RiskAssessmentUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
  }

  export type OperationalResponsePlanUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput> | OperationalResponsePlanCreateWithoutCaseInput[] | OperationalResponsePlanUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutCaseInput | OperationalResponsePlanCreateOrConnectWithoutCaseInput[]
    upsert?: OperationalResponsePlanUpsertWithWhereUniqueWithoutCaseInput | OperationalResponsePlanUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OperationalResponsePlanCreateManyCaseInputEnvelope
    set?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    disconnect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    delete?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    update?: OperationalResponsePlanUpdateWithWhereUniqueWithoutCaseInput | OperationalResponsePlanUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OperationalResponsePlanUpdateManyWithWhereWithoutCaseInput | OperationalResponsePlanUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
  }

  export type OrpDecisionUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput> | OrpDecisionCreateWithoutCaseInput[] | OrpDecisionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutCaseInput | OrpDecisionCreateOrConnectWithoutCaseInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutCaseInput | OrpDecisionUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OrpDecisionCreateManyCaseInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutCaseInput | OrpDecisionUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutCaseInput | OrpDecisionUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type InspectionUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput> | InspectionCreateWithoutCaseInput[] | InspectionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: InspectionCreateOrConnectWithoutCaseInput | InspectionCreateOrConnectWithoutCaseInput[]
    upsert?: InspectionUpsertWithWhereUniqueWithoutCaseInput | InspectionUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: InspectionCreateManyCaseInputEnvelope
    set?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    disconnect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    delete?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    connect?: InspectionWhereUniqueInput | InspectionWhereUniqueInput[]
    update?: InspectionUpdateWithWhereUniqueWithoutCaseInput | InspectionUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: InspectionUpdateManyWithWhereWithoutCaseInput | InspectionUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
  }

  export type RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput> | RiskAssessmentCreateWithoutCaseInput[] | RiskAssessmentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutCaseInput | RiskAssessmentCreateOrConnectWithoutCaseInput[]
    upsert?: RiskAssessmentUpsertWithWhereUniqueWithoutCaseInput | RiskAssessmentUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: RiskAssessmentCreateManyCaseInputEnvelope
    set?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    disconnect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    delete?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    update?: RiskAssessmentUpdateWithWhereUniqueWithoutCaseInput | RiskAssessmentUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: RiskAssessmentUpdateManyWithWhereWithoutCaseInput | RiskAssessmentUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
  }

  export type OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput> | OperationalResponsePlanCreateWithoutCaseInput[] | OperationalResponsePlanUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutCaseInput | OperationalResponsePlanCreateOrConnectWithoutCaseInput[]
    upsert?: OperationalResponsePlanUpsertWithWhereUniqueWithoutCaseInput | OperationalResponsePlanUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OperationalResponsePlanCreateManyCaseInputEnvelope
    set?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    disconnect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    delete?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    update?: OperationalResponsePlanUpdateWithWhereUniqueWithoutCaseInput | OperationalResponsePlanUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OperationalResponsePlanUpdateManyWithWhereWithoutCaseInput | OperationalResponsePlanUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
  }

  export type OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput> | OrpDecisionCreateWithoutCaseInput[] | OrpDecisionUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutCaseInput | OrpDecisionCreateOrConnectWithoutCaseInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutCaseInput | OrpDecisionUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OrpDecisionCreateManyCaseInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutCaseInput | OrpDecisionUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutCaseInput | OrpDecisionUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type CaseCreateNestedOneWithoutInspectionsInput = {
    create?: XOR<CaseCreateWithoutInspectionsInput, CaseUncheckedCreateWithoutInspectionsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutInspectionsInput
    connect?: CaseWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutInspectionsInput = {
    create?: XOR<UserCreateWithoutInspectionsInput, UserUncheckedCreateWithoutInspectionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInspectionsInput
    connect?: UserWhereUniqueInput
  }

  export type RiskAssessmentCreateNestedManyWithoutInspectionInput = {
    create?: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput> | RiskAssessmentCreateWithoutInspectionInput[] | RiskAssessmentUncheckedCreateWithoutInspectionInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutInspectionInput | RiskAssessmentCreateOrConnectWithoutInspectionInput[]
    createMany?: RiskAssessmentCreateManyInspectionInputEnvelope
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
  }

  export type RiskAssessmentUncheckedCreateNestedManyWithoutInspectionInput = {
    create?: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput> | RiskAssessmentCreateWithoutInspectionInput[] | RiskAssessmentUncheckedCreateWithoutInspectionInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutInspectionInput | RiskAssessmentCreateOrConnectWithoutInspectionInput[]
    createMany?: RiskAssessmentCreateManyInspectionInputEnvelope
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
  }

  export type CaseUpdateOneRequiredWithoutInspectionsNestedInput = {
    create?: XOR<CaseCreateWithoutInspectionsInput, CaseUncheckedCreateWithoutInspectionsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutInspectionsInput
    upsert?: CaseUpsertWithoutInspectionsInput
    connect?: CaseWhereUniqueInput
    update?: XOR<XOR<CaseUpdateToOneWithWhereWithoutInspectionsInput, CaseUpdateWithoutInspectionsInput>, CaseUncheckedUpdateWithoutInspectionsInput>
  }

  export type UserUpdateOneRequiredWithoutInspectionsNestedInput = {
    create?: XOR<UserCreateWithoutInspectionsInput, UserUncheckedCreateWithoutInspectionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInspectionsInput
    upsert?: UserUpsertWithoutInspectionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutInspectionsInput, UserUpdateWithoutInspectionsInput>, UserUncheckedUpdateWithoutInspectionsInput>
  }

  export type RiskAssessmentUpdateManyWithoutInspectionNestedInput = {
    create?: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput> | RiskAssessmentCreateWithoutInspectionInput[] | RiskAssessmentUncheckedCreateWithoutInspectionInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutInspectionInput | RiskAssessmentCreateOrConnectWithoutInspectionInput[]
    upsert?: RiskAssessmentUpsertWithWhereUniqueWithoutInspectionInput | RiskAssessmentUpsertWithWhereUniqueWithoutInspectionInput[]
    createMany?: RiskAssessmentCreateManyInspectionInputEnvelope
    set?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    disconnect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    delete?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    update?: RiskAssessmentUpdateWithWhereUniqueWithoutInspectionInput | RiskAssessmentUpdateWithWhereUniqueWithoutInspectionInput[]
    updateMany?: RiskAssessmentUpdateManyWithWhereWithoutInspectionInput | RiskAssessmentUpdateManyWithWhereWithoutInspectionInput[]
    deleteMany?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
  }

  export type RiskAssessmentUncheckedUpdateManyWithoutInspectionNestedInput = {
    create?: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput> | RiskAssessmentCreateWithoutInspectionInput[] | RiskAssessmentUncheckedCreateWithoutInspectionInput[]
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutInspectionInput | RiskAssessmentCreateOrConnectWithoutInspectionInput[]
    upsert?: RiskAssessmentUpsertWithWhereUniqueWithoutInspectionInput | RiskAssessmentUpsertWithWhereUniqueWithoutInspectionInput[]
    createMany?: RiskAssessmentCreateManyInspectionInputEnvelope
    set?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    disconnect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    delete?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    connect?: RiskAssessmentWhereUniqueInput | RiskAssessmentWhereUniqueInput[]
    update?: RiskAssessmentUpdateWithWhereUniqueWithoutInspectionInput | RiskAssessmentUpdateWithWhereUniqueWithoutInspectionInput[]
    updateMany?: RiskAssessmentUpdateManyWithWhereWithoutInspectionInput | RiskAssessmentUpdateManyWithWhereWithoutInspectionInput[]
    deleteMany?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
  }

  export type CaseCreateNestedOneWithoutRiskAssessmentsInput = {
    create?: XOR<CaseCreateWithoutRiskAssessmentsInput, CaseUncheckedCreateWithoutRiskAssessmentsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutRiskAssessmentsInput
    connect?: CaseWhereUniqueInput
  }

  export type InspectionCreateNestedOneWithoutRiskAssessmentsInput = {
    create?: XOR<InspectionCreateWithoutRiskAssessmentsInput, InspectionUncheckedCreateWithoutRiskAssessmentsInput>
    connectOrCreate?: InspectionCreateOrConnectWithoutRiskAssessmentsInput
    connect?: InspectionWhereUniqueInput
  }

  export type OperationalResponsePlanCreateNestedManyWithoutRiskAssessmentInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput> | OperationalResponsePlanCreateWithoutRiskAssessmentInput[] | OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput | OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput[]
    createMany?: OperationalResponsePlanCreateManyRiskAssessmentInputEnvelope
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
  }

  export type OperationalResponsePlanUncheckedCreateNestedManyWithoutRiskAssessmentInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput> | OperationalResponsePlanCreateWithoutRiskAssessmentInput[] | OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput | OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput[]
    createMany?: OperationalResponsePlanCreateManyRiskAssessmentInputEnvelope
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumRiskLevelFieldUpdateOperationsInput = {
    set?: $Enums.RiskLevel
  }

  export type EnumPriorityLevelFieldUpdateOperationsInput = {
    set?: $Enums.PriorityLevel
  }

  export type CaseUpdateOneRequiredWithoutRiskAssessmentsNestedInput = {
    create?: XOR<CaseCreateWithoutRiskAssessmentsInput, CaseUncheckedCreateWithoutRiskAssessmentsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutRiskAssessmentsInput
    upsert?: CaseUpsertWithoutRiskAssessmentsInput
    connect?: CaseWhereUniqueInput
    update?: XOR<XOR<CaseUpdateToOneWithWhereWithoutRiskAssessmentsInput, CaseUpdateWithoutRiskAssessmentsInput>, CaseUncheckedUpdateWithoutRiskAssessmentsInput>
  }

  export type InspectionUpdateOneRequiredWithoutRiskAssessmentsNestedInput = {
    create?: XOR<InspectionCreateWithoutRiskAssessmentsInput, InspectionUncheckedCreateWithoutRiskAssessmentsInput>
    connectOrCreate?: InspectionCreateOrConnectWithoutRiskAssessmentsInput
    upsert?: InspectionUpsertWithoutRiskAssessmentsInput
    connect?: InspectionWhereUniqueInput
    update?: XOR<XOR<InspectionUpdateToOneWithWhereWithoutRiskAssessmentsInput, InspectionUpdateWithoutRiskAssessmentsInput>, InspectionUncheckedUpdateWithoutRiskAssessmentsInput>
  }

  export type OperationalResponsePlanUpdateManyWithoutRiskAssessmentNestedInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput> | OperationalResponsePlanCreateWithoutRiskAssessmentInput[] | OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput | OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput[]
    upsert?: OperationalResponsePlanUpsertWithWhereUniqueWithoutRiskAssessmentInput | OperationalResponsePlanUpsertWithWhereUniqueWithoutRiskAssessmentInput[]
    createMany?: OperationalResponsePlanCreateManyRiskAssessmentInputEnvelope
    set?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    disconnect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    delete?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    update?: OperationalResponsePlanUpdateWithWhereUniqueWithoutRiskAssessmentInput | OperationalResponsePlanUpdateWithWhereUniqueWithoutRiskAssessmentInput[]
    updateMany?: OperationalResponsePlanUpdateManyWithWhereWithoutRiskAssessmentInput | OperationalResponsePlanUpdateManyWithWhereWithoutRiskAssessmentInput[]
    deleteMany?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
  }

  export type OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentNestedInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput> | OperationalResponsePlanCreateWithoutRiskAssessmentInput[] | OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput[]
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput | OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput[]
    upsert?: OperationalResponsePlanUpsertWithWhereUniqueWithoutRiskAssessmentInput | OperationalResponsePlanUpsertWithWhereUniqueWithoutRiskAssessmentInput[]
    createMany?: OperationalResponsePlanCreateManyRiskAssessmentInputEnvelope
    set?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    disconnect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    delete?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    connect?: OperationalResponsePlanWhereUniqueInput | OperationalResponsePlanWhereUniqueInput[]
    update?: OperationalResponsePlanUpdateWithWhereUniqueWithoutRiskAssessmentInput | OperationalResponsePlanUpdateWithWhereUniqueWithoutRiskAssessmentInput[]
    updateMany?: OperationalResponsePlanUpdateManyWithWhereWithoutRiskAssessmentInput | OperationalResponsePlanUpdateManyWithWhereWithoutRiskAssessmentInput[]
    deleteMany?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
  }

  export type CaseCreateNestedOneWithoutOperationalResponsePlansInput = {
    create?: XOR<CaseCreateWithoutOperationalResponsePlansInput, CaseUncheckedCreateWithoutOperationalResponsePlansInput>
    connectOrCreate?: CaseCreateOrConnectWithoutOperationalResponsePlansInput
    connect?: CaseWhereUniqueInput
  }

  export type RiskAssessmentCreateNestedOneWithoutOperationalResponsePlansInput = {
    create?: XOR<RiskAssessmentCreateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedCreateWithoutOperationalResponsePlansInput>
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutOperationalResponsePlansInput
    connect?: RiskAssessmentWhereUniqueInput
  }

  export type OrpDecisionCreateNestedManyWithoutOrpInput = {
    create?: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput> | OrpDecisionCreateWithoutOrpInput[] | OrpDecisionUncheckedCreateWithoutOrpInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutOrpInput | OrpDecisionCreateOrConnectWithoutOrpInput[]
    createMany?: OrpDecisionCreateManyOrpInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type OrpDecisionUncheckedCreateNestedManyWithoutOrpInput = {
    create?: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput> | OrpDecisionCreateWithoutOrpInput[] | OrpDecisionUncheckedCreateWithoutOrpInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutOrpInput | OrpDecisionCreateOrConnectWithoutOrpInput[]
    createMany?: OrpDecisionCreateManyOrpInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type CaseUpdateOneRequiredWithoutOperationalResponsePlansNestedInput = {
    create?: XOR<CaseCreateWithoutOperationalResponsePlansInput, CaseUncheckedCreateWithoutOperationalResponsePlansInput>
    connectOrCreate?: CaseCreateOrConnectWithoutOperationalResponsePlansInput
    upsert?: CaseUpsertWithoutOperationalResponsePlansInput
    connect?: CaseWhereUniqueInput
    update?: XOR<XOR<CaseUpdateToOneWithWhereWithoutOperationalResponsePlansInput, CaseUpdateWithoutOperationalResponsePlansInput>, CaseUncheckedUpdateWithoutOperationalResponsePlansInput>
  }

  export type RiskAssessmentUpdateOneRequiredWithoutOperationalResponsePlansNestedInput = {
    create?: XOR<RiskAssessmentCreateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedCreateWithoutOperationalResponsePlansInput>
    connectOrCreate?: RiskAssessmentCreateOrConnectWithoutOperationalResponsePlansInput
    upsert?: RiskAssessmentUpsertWithoutOperationalResponsePlansInput
    connect?: RiskAssessmentWhereUniqueInput
    update?: XOR<XOR<RiskAssessmentUpdateToOneWithWhereWithoutOperationalResponsePlansInput, RiskAssessmentUpdateWithoutOperationalResponsePlansInput>, RiskAssessmentUncheckedUpdateWithoutOperationalResponsePlansInput>
  }

  export type OrpDecisionUpdateManyWithoutOrpNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput> | OrpDecisionCreateWithoutOrpInput[] | OrpDecisionUncheckedCreateWithoutOrpInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutOrpInput | OrpDecisionCreateOrConnectWithoutOrpInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutOrpInput | OrpDecisionUpsertWithWhereUniqueWithoutOrpInput[]
    createMany?: OrpDecisionCreateManyOrpInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutOrpInput | OrpDecisionUpdateWithWhereUniqueWithoutOrpInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutOrpInput | OrpDecisionUpdateManyWithWhereWithoutOrpInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type OrpDecisionUncheckedUpdateManyWithoutOrpNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput> | OrpDecisionCreateWithoutOrpInput[] | OrpDecisionUncheckedCreateWithoutOrpInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutOrpInput | OrpDecisionCreateOrConnectWithoutOrpInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutOrpInput | OrpDecisionUpsertWithWhereUniqueWithoutOrpInput[]
    createMany?: OrpDecisionCreateManyOrpInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutOrpInput | OrpDecisionUpdateWithWhereUniqueWithoutOrpInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutOrpInput | OrpDecisionUpdateManyWithWhereWithoutOrpInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutApprovalAuthoritiesInput = {
    create?: XOR<UserCreateWithoutApprovalAuthoritiesInput, UserUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: UserCreateOrConnectWithoutApprovalAuthoritiesInput
    connect?: UserWhereUniqueInput
  }

  export type DepartmentCreateNestedOneWithoutApprovalAuthoritiesInput = {
    create?: XOR<DepartmentCreateWithoutApprovalAuthoritiesInput, DepartmentUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutApprovalAuthoritiesInput
    connect?: DepartmentWhereUniqueInput
  }

  export type JurisdictionCreateNestedOneWithoutApprovalAuthoritiesInput = {
    create?: XOR<JurisdictionCreateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutApprovalAuthoritiesInput
    connect?: JurisdictionWhereUniqueInput
  }

  export type OrpDecisionCreateNestedManyWithoutAuthorityGrantInput = {
    create?: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput> | OrpDecisionCreateWithoutAuthorityGrantInput[] | OrpDecisionUncheckedCreateWithoutAuthorityGrantInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutAuthorityGrantInput | OrpDecisionCreateOrConnectWithoutAuthorityGrantInput[]
    createMany?: OrpDecisionCreateManyAuthorityGrantInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type OrpDecisionUncheckedCreateNestedManyWithoutAuthorityGrantInput = {
    create?: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput> | OrpDecisionCreateWithoutAuthorityGrantInput[] | OrpDecisionUncheckedCreateWithoutAuthorityGrantInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutAuthorityGrantInput | OrpDecisionCreateOrConnectWithoutAuthorityGrantInput[]
    createMany?: OrpDecisionCreateManyAuthorityGrantInputEnvelope
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput = {
    create?: XOR<UserCreateWithoutApprovalAuthoritiesInput, UserUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: UserCreateOrConnectWithoutApprovalAuthoritiesInput
    upsert?: UserUpsertWithoutApprovalAuthoritiesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutApprovalAuthoritiesInput, UserUpdateWithoutApprovalAuthoritiesInput>, UserUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type DepartmentUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput = {
    create?: XOR<DepartmentCreateWithoutApprovalAuthoritiesInput, DepartmentUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutApprovalAuthoritiesInput
    upsert?: DepartmentUpsertWithoutApprovalAuthoritiesInput
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutApprovalAuthoritiesInput, DepartmentUpdateWithoutApprovalAuthoritiesInput>, DepartmentUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type JurisdictionUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput = {
    create?: XOR<JurisdictionCreateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedCreateWithoutApprovalAuthoritiesInput>
    connectOrCreate?: JurisdictionCreateOrConnectWithoutApprovalAuthoritiesInput
    upsert?: JurisdictionUpsertWithoutApprovalAuthoritiesInput
    connect?: JurisdictionWhereUniqueInput
    update?: XOR<XOR<JurisdictionUpdateToOneWithWhereWithoutApprovalAuthoritiesInput, JurisdictionUpdateWithoutApprovalAuthoritiesInput>, JurisdictionUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type OrpDecisionUpdateManyWithoutAuthorityGrantNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput> | OrpDecisionCreateWithoutAuthorityGrantInput[] | OrpDecisionUncheckedCreateWithoutAuthorityGrantInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutAuthorityGrantInput | OrpDecisionCreateOrConnectWithoutAuthorityGrantInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutAuthorityGrantInput | OrpDecisionUpsertWithWhereUniqueWithoutAuthorityGrantInput[]
    createMany?: OrpDecisionCreateManyAuthorityGrantInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutAuthorityGrantInput | OrpDecisionUpdateWithWhereUniqueWithoutAuthorityGrantInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutAuthorityGrantInput | OrpDecisionUpdateManyWithWhereWithoutAuthorityGrantInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantNestedInput = {
    create?: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput> | OrpDecisionCreateWithoutAuthorityGrantInput[] | OrpDecisionUncheckedCreateWithoutAuthorityGrantInput[]
    connectOrCreate?: OrpDecisionCreateOrConnectWithoutAuthorityGrantInput | OrpDecisionCreateOrConnectWithoutAuthorityGrantInput[]
    upsert?: OrpDecisionUpsertWithWhereUniqueWithoutAuthorityGrantInput | OrpDecisionUpsertWithWhereUniqueWithoutAuthorityGrantInput[]
    createMany?: OrpDecisionCreateManyAuthorityGrantInputEnvelope
    set?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    disconnect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    delete?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    connect?: OrpDecisionWhereUniqueInput | OrpDecisionWhereUniqueInput[]
    update?: OrpDecisionUpdateWithWhereUniqueWithoutAuthorityGrantInput | OrpDecisionUpdateWithWhereUniqueWithoutAuthorityGrantInput[]
    updateMany?: OrpDecisionUpdateManyWithWhereWithoutAuthorityGrantInput | OrpDecisionUpdateManyWithWhereWithoutAuthorityGrantInput[]
    deleteMany?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
  }

  export type CaseCreateNestedOneWithoutOrpDecisionsInput = {
    create?: XOR<CaseCreateWithoutOrpDecisionsInput, CaseUncheckedCreateWithoutOrpDecisionsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutOrpDecisionsInput
    connect?: CaseWhereUniqueInput
  }

  export type OperationalResponsePlanCreateNestedOneWithoutDecisionsInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutDecisionsInput, OperationalResponsePlanUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutDecisionsInput
    connect?: OperationalResponsePlanWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutReviewedOrpDecisionsInput = {
    create?: XOR<UserCreateWithoutReviewedOrpDecisionsInput, UserUncheckedCreateWithoutReviewedOrpDecisionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReviewedOrpDecisionsInput
    connect?: UserWhereUniqueInput
  }

  export type ApprovalAuthorityCreateNestedOneWithoutDecisionsInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDecisionsInput, ApprovalAuthorityUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDecisionsInput
    connect?: ApprovalAuthorityWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutForwardedOrpDecisionsInput = {
    create?: XOR<UserCreateWithoutForwardedOrpDecisionsInput, UserUncheckedCreateWithoutForwardedOrpDecisionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutForwardedOrpDecisionsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumOrpDecisionTypeFieldUpdateOperationsInput = {
    set?: $Enums.OrpDecisionType
  }

  export type CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput = {
    create?: XOR<CaseCreateWithoutOrpDecisionsInput, CaseUncheckedCreateWithoutOrpDecisionsInput>
    connectOrCreate?: CaseCreateOrConnectWithoutOrpDecisionsInput
    upsert?: CaseUpsertWithoutOrpDecisionsInput
    connect?: CaseWhereUniqueInput
    update?: XOR<XOR<CaseUpdateToOneWithWhereWithoutOrpDecisionsInput, CaseUpdateWithoutOrpDecisionsInput>, CaseUncheckedUpdateWithoutOrpDecisionsInput>
  }

  export type OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput = {
    create?: XOR<OperationalResponsePlanCreateWithoutDecisionsInput, OperationalResponsePlanUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: OperationalResponsePlanCreateOrConnectWithoutDecisionsInput
    upsert?: OperationalResponsePlanUpsertWithoutDecisionsInput
    connect?: OperationalResponsePlanWhereUniqueInput
    update?: XOR<XOR<OperationalResponsePlanUpdateToOneWithWhereWithoutDecisionsInput, OperationalResponsePlanUpdateWithoutDecisionsInput>, OperationalResponsePlanUncheckedUpdateWithoutDecisionsInput>
  }

  export type UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput = {
    create?: XOR<UserCreateWithoutReviewedOrpDecisionsInput, UserUncheckedCreateWithoutReviewedOrpDecisionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReviewedOrpDecisionsInput
    upsert?: UserUpsertWithoutReviewedOrpDecisionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReviewedOrpDecisionsInput, UserUpdateWithoutReviewedOrpDecisionsInput>, UserUncheckedUpdateWithoutReviewedOrpDecisionsInput>
  }

  export type ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput = {
    create?: XOR<ApprovalAuthorityCreateWithoutDecisionsInput, ApprovalAuthorityUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: ApprovalAuthorityCreateOrConnectWithoutDecisionsInput
    upsert?: ApprovalAuthorityUpsertWithoutDecisionsInput
    connect?: ApprovalAuthorityWhereUniqueInput
    update?: XOR<XOR<ApprovalAuthorityUpdateToOneWithWhereWithoutDecisionsInput, ApprovalAuthorityUpdateWithoutDecisionsInput>, ApprovalAuthorityUncheckedUpdateWithoutDecisionsInput>
  }

  export type UserUpdateOneWithoutForwardedOrpDecisionsNestedInput = {
    create?: XOR<UserCreateWithoutForwardedOrpDecisionsInput, UserUncheckedCreateWithoutForwardedOrpDecisionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutForwardedOrpDecisionsInput
    upsert?: UserUpsertWithoutForwardedOrpDecisionsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutForwardedOrpDecisionsInput, UserUpdateWithoutForwardedOrpDecisionsInput>, UserUncheckedUpdateWithoutForwardedOrpDecisionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumSystemRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.SystemRole | EnumSystemRoleFieldRefInput<$PrismaModel>
    in?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumSystemRoleFilter<$PrismaModel> | $Enums.SystemRole
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedEnumSystemRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SystemRole | EnumSystemRoleFieldRefInput<$PrismaModel>
    in?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.SystemRole[] | ListEnumSystemRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumSystemRoleWithAggregatesFilter<$PrismaModel> | $Enums.SystemRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSystemRoleFilter<$PrismaModel>
    _max?: NestedEnumSystemRoleFilter<$PrismaModel>
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type NestedEnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumCaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CaseStatus | EnumCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCaseStatusFilter<$PrismaModel> | $Enums.CaseStatus
  }

  export type NestedEnumRiskLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRiskLevelNullableFilter<$PrismaModel> | $Enums.RiskLevel | null
  }

  export type NestedEnumPriorityLevelNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPriorityLevelNullableFilter<$PrismaModel> | $Enums.PriorityLevel | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumCaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CaseStatus | EnumCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CaseStatus[] | ListEnumCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.CaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCaseStatusFilter<$PrismaModel>
    _max?: NestedEnumCaseStatusFilter<$PrismaModel>
  }

  export type NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumRiskLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelNullableFilter<$PrismaModel>
  }

  export type NestedEnumPriorityLevelNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel> | null
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPriorityLevelNullableWithAggregatesFilter<$PrismaModel> | $Enums.PriorityLevel | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPriorityLevelNullableFilter<$PrismaModel>
    _max?: NestedEnumPriorityLevelNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumRiskLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelFilter<$PrismaModel> | $Enums.RiskLevel
  }

  export type NestedEnumPriorityLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityLevelFilter<$PrismaModel> | $Enums.PriorityLevel
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskLevel | EnumRiskLevelFieldRefInput<$PrismaModel>
    in?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskLevel[] | ListEnumRiskLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskLevelWithAggregatesFilter<$PrismaModel> | $Enums.RiskLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskLevelFilter<$PrismaModel>
    _max?: NestedEnumRiskLevelFilter<$PrismaModel>
  }

  export type NestedEnumPriorityLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriorityLevel | EnumPriorityLevelFieldRefInput<$PrismaModel>
    in?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriorityLevel[] | ListEnumPriorityLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityLevelWithAggregatesFilter<$PrismaModel> | $Enums.PriorityLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriorityLevelFilter<$PrismaModel>
    _max?: NestedEnumPriorityLevelFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumOrpDecisionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrpDecisionType | EnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrpDecisionTypeFilter<$PrismaModel> | $Enums.OrpDecisionType
  }

  export type NestedEnumOrpDecisionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrpDecisionType | EnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrpDecisionType[] | ListEnumOrpDecisionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrpDecisionTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrpDecisionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrpDecisionTypeFilter<$PrismaModel>
    _max?: NestedEnumOrpDecisionTypeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserCreateWithoutDepartmentInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateWithoutDepartmentInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserCreateOrConnectWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput>
  }

  export type UserCreateManyDepartmentInputEnvelope = {
    data: UserCreateManyDepartmentInput | UserCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type AssetCreateWithoutDepartmentInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    jurisdiction: JurisdictionCreateNestedOneWithoutAssetsInput
    cases?: CaseCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutDepartmentInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    jurisdictionId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cases?: CaseUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutDepartmentInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput>
  }

  export type AssetCreateManyDepartmentInputEnvelope = {
    data: AssetCreateManyDepartmentInput | AssetCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type JurisdictionCreateWithoutDepartmentInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutJurisdictionInput
    assets?: AssetCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUncheckedCreateWithoutDepartmentInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutJurisdictionInput
    assets?: AssetUncheckedCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionCreateOrConnectWithoutDepartmentInput = {
    where: JurisdictionWhereUniqueInput
    create: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput>
  }

  export type JurisdictionCreateManyDepartmentInputEnvelope = {
    data: JurisdictionCreateManyDepartmentInput | JurisdictionCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type ApprovalAuthorityCreateWithoutDepartmentInput = {
    id?: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutApprovalAuthoritiesInput
    jurisdiction: JurisdictionCreateNestedOneWithoutApprovalAuthoritiesInput
    decisions?: OrpDecisionCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityUncheckedCreateWithoutDepartmentInput = {
    id?: string
    userId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityCreateOrConnectWithoutDepartmentInput = {
    where: ApprovalAuthorityWhereUniqueInput
    create: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput>
  }

  export type ApprovalAuthorityCreateManyDepartmentInputEnvelope = {
    data: ApprovalAuthorityCreateManyDepartmentInput | ApprovalAuthorityCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutDepartmentInput, UserUncheckedUpdateWithoutDepartmentInput>
    create: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput>
  }

  export type UserUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutDepartmentInput, UserUncheckedUpdateWithoutDepartmentInput>
  }

  export type UserUpdateManyWithWhereWithoutDepartmentInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    employeeCode?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    designation?: StringFilter<"User"> | string
    role?: EnumSystemRoleFilter<"User"> | $Enums.SystemRole
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    departmentId?: StringFilter<"User"> | string
    jurisdictionId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type AssetUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: AssetWhereUniqueInput
    update: XOR<AssetUpdateWithoutDepartmentInput, AssetUncheckedUpdateWithoutDepartmentInput>
    create: XOR<AssetCreateWithoutDepartmentInput, AssetUncheckedCreateWithoutDepartmentInput>
  }

  export type AssetUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: AssetWhereUniqueInput
    data: XOR<AssetUpdateWithoutDepartmentInput, AssetUncheckedUpdateWithoutDepartmentInput>
  }

  export type AssetUpdateManyWithWhereWithoutDepartmentInput = {
    where: AssetScalarWhereInput
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type AssetScalarWhereInput = {
    AND?: AssetScalarWhereInput | AssetScalarWhereInput[]
    OR?: AssetScalarWhereInput[]
    NOT?: AssetScalarWhereInput | AssetScalarWhereInput[]
    id?: StringFilter<"Asset"> | string
    assetCode?: StringFilter<"Asset"> | string
    name?: StringFilter<"Asset"> | string
    assetType?: EnumAssetTypeFilter<"Asset"> | $Enums.AssetType
    departmentId?: StringFilter<"Asset"> | string
    jurisdictionId?: StringFilter<"Asset"> | string
    latitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    longitude?: DecimalNullableFilter<"Asset"> | Decimal | DecimalJsLike | number | string | null
    constructionYear?: IntNullableFilter<"Asset"> | number | null
    conditionStatus?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
  }

  export type JurisdictionUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: JurisdictionWhereUniqueInput
    update: XOR<JurisdictionUpdateWithoutDepartmentInput, JurisdictionUncheckedUpdateWithoutDepartmentInput>
    create: XOR<JurisdictionCreateWithoutDepartmentInput, JurisdictionUncheckedCreateWithoutDepartmentInput>
  }

  export type JurisdictionUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: JurisdictionWhereUniqueInput
    data: XOR<JurisdictionUpdateWithoutDepartmentInput, JurisdictionUncheckedUpdateWithoutDepartmentInput>
  }

  export type JurisdictionUpdateManyWithWhereWithoutDepartmentInput = {
    where: JurisdictionScalarWhereInput
    data: XOR<JurisdictionUpdateManyMutationInput, JurisdictionUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type JurisdictionScalarWhereInput = {
    AND?: JurisdictionScalarWhereInput | JurisdictionScalarWhereInput[]
    OR?: JurisdictionScalarWhereInput[]
    NOT?: JurisdictionScalarWhereInput | JurisdictionScalarWhereInput[]
    id?: StringFilter<"Jurisdiction"> | string
    name?: StringFilter<"Jurisdiction"> | string
    type?: StringFilter<"Jurisdiction"> | string
    departmentId?: StringFilter<"Jurisdiction"> | string
    createdAt?: DateTimeFilter<"Jurisdiction"> | Date | string
  }

  export type ApprovalAuthorityUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: ApprovalAuthorityWhereUniqueInput
    update: XOR<ApprovalAuthorityUpdateWithoutDepartmentInput, ApprovalAuthorityUncheckedUpdateWithoutDepartmentInput>
    create: XOR<ApprovalAuthorityCreateWithoutDepartmentInput, ApprovalAuthorityUncheckedCreateWithoutDepartmentInput>
  }

  export type ApprovalAuthorityUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: ApprovalAuthorityWhereUniqueInput
    data: XOR<ApprovalAuthorityUpdateWithoutDepartmentInput, ApprovalAuthorityUncheckedUpdateWithoutDepartmentInput>
  }

  export type ApprovalAuthorityUpdateManyWithWhereWithoutDepartmentInput = {
    where: ApprovalAuthorityScalarWhereInput
    data: XOR<ApprovalAuthorityUpdateManyMutationInput, ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type ApprovalAuthorityScalarWhereInput = {
    AND?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
    OR?: ApprovalAuthorityScalarWhereInput[]
    NOT?: ApprovalAuthorityScalarWhereInput | ApprovalAuthorityScalarWhereInput[]
    id?: StringFilter<"ApprovalAuthority"> | string
    userId?: StringFilter<"ApprovalAuthority"> | string
    departmentId?: StringFilter<"ApprovalAuthority"> | string
    jurisdictionId?: StringFilter<"ApprovalAuthority"> | string
    canApprove?: BoolFilter<"ApprovalAuthority"> | boolean
    canReject?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestModification?: BoolFilter<"ApprovalAuthority"> | boolean
    canRequestReinspection?: BoolFilter<"ApprovalAuthority"> | boolean
    canEscalate?: BoolFilter<"ApprovalAuthority"> | boolean
    maxPriorityLevel?: EnumPriorityLevelNullableFilter<"ApprovalAuthority"> | $Enums.PriorityLevel | null
    isActive?: BoolFilter<"ApprovalAuthority"> | boolean
    validFrom?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    validUntil?: DateTimeNullableFilter<"ApprovalAuthority"> | Date | string | null
    createdAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
    updatedAt?: DateTimeFilter<"ApprovalAuthority"> | Date | string
  }

  export type DepartmentCreateWithoutJurisdictionsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutDepartmentInput
    assets?: AssetCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutJurisdictionsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutDepartmentInput
    assets?: AssetUncheckedCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutJurisdictionsInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutJurisdictionsInput, DepartmentUncheckedCreateWithoutJurisdictionsInput>
  }

  export type UserCreateWithoutJurisdictionInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateWithoutJurisdictionInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserCreateOrConnectWithoutJurisdictionInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput>
  }

  export type UserCreateManyJurisdictionInputEnvelope = {
    data: UserCreateManyJurisdictionInput | UserCreateManyJurisdictionInput[]
    skipDuplicates?: boolean
  }

  export type AssetCreateWithoutJurisdictionInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutAssetsInput
    cases?: CaseCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutJurisdictionInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cases?: CaseUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutJurisdictionInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput>
  }

  export type AssetCreateManyJurisdictionInputEnvelope = {
    data: AssetCreateManyJurisdictionInput | AssetCreateManyJurisdictionInput[]
    skipDuplicates?: boolean
  }

  export type ApprovalAuthorityCreateWithoutJurisdictionInput = {
    id?: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutApprovalAuthoritiesInput
    department: DepartmentCreateNestedOneWithoutApprovalAuthoritiesInput
    decisions?: OrpDecisionCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput = {
    id?: string
    userId: string
    departmentId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityCreateOrConnectWithoutJurisdictionInput = {
    where: ApprovalAuthorityWhereUniqueInput
    create: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput>
  }

  export type ApprovalAuthorityCreateManyJurisdictionInputEnvelope = {
    data: ApprovalAuthorityCreateManyJurisdictionInput | ApprovalAuthorityCreateManyJurisdictionInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentUpsertWithoutJurisdictionsInput = {
    update: XOR<DepartmentUpdateWithoutJurisdictionsInput, DepartmentUncheckedUpdateWithoutJurisdictionsInput>
    create: XOR<DepartmentCreateWithoutJurisdictionsInput, DepartmentUncheckedCreateWithoutJurisdictionsInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutJurisdictionsInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutJurisdictionsInput, DepartmentUncheckedUpdateWithoutJurisdictionsInput>
  }

  export type DepartmentUpdateWithoutJurisdictionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutJurisdictionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUncheckedUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutJurisdictionInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutJurisdictionInput, UserUncheckedUpdateWithoutJurisdictionInput>
    create: XOR<UserCreateWithoutJurisdictionInput, UserUncheckedCreateWithoutJurisdictionInput>
  }

  export type UserUpdateWithWhereUniqueWithoutJurisdictionInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutJurisdictionInput, UserUncheckedUpdateWithoutJurisdictionInput>
  }

  export type UserUpdateManyWithWhereWithoutJurisdictionInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutJurisdictionInput>
  }

  export type AssetUpsertWithWhereUniqueWithoutJurisdictionInput = {
    where: AssetWhereUniqueInput
    update: XOR<AssetUpdateWithoutJurisdictionInput, AssetUncheckedUpdateWithoutJurisdictionInput>
    create: XOR<AssetCreateWithoutJurisdictionInput, AssetUncheckedCreateWithoutJurisdictionInput>
  }

  export type AssetUpdateWithWhereUniqueWithoutJurisdictionInput = {
    where: AssetWhereUniqueInput
    data: XOR<AssetUpdateWithoutJurisdictionInput, AssetUncheckedUpdateWithoutJurisdictionInput>
  }

  export type AssetUpdateManyWithWhereWithoutJurisdictionInput = {
    where: AssetScalarWhereInput
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyWithoutJurisdictionInput>
  }

  export type ApprovalAuthorityUpsertWithWhereUniqueWithoutJurisdictionInput = {
    where: ApprovalAuthorityWhereUniqueInput
    update: XOR<ApprovalAuthorityUpdateWithoutJurisdictionInput, ApprovalAuthorityUncheckedUpdateWithoutJurisdictionInput>
    create: XOR<ApprovalAuthorityCreateWithoutJurisdictionInput, ApprovalAuthorityUncheckedCreateWithoutJurisdictionInput>
  }

  export type ApprovalAuthorityUpdateWithWhereUniqueWithoutJurisdictionInput = {
    where: ApprovalAuthorityWhereUniqueInput
    data: XOR<ApprovalAuthorityUpdateWithoutJurisdictionInput, ApprovalAuthorityUncheckedUpdateWithoutJurisdictionInput>
  }

  export type ApprovalAuthorityUpdateManyWithWhereWithoutJurisdictionInput = {
    where: ApprovalAuthorityScalarWhereInput
    data: XOR<ApprovalAuthorityUpdateManyMutationInput, ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionInput>
  }

  export type DepartmentCreateWithoutUsersInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    assets?: AssetCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    assets?: AssetUncheckedCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionUncheckedCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutUsersInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutUsersInput, DepartmentUncheckedCreateWithoutUsersInput>
  }

  export type JurisdictionCreateWithoutUsersInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    department: DepartmentCreateNestedOneWithoutJurisdictionsInput
    assets?: AssetCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    type: string
    departmentId: string
    createdAt?: Date | string
    assets?: AssetUncheckedCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionCreateOrConnectWithoutUsersInput = {
    where: JurisdictionWhereUniqueInput
    create: XOR<JurisdictionCreateWithoutUsersInput, JurisdictionUncheckedCreateWithoutUsersInput>
  }

  export type InspectionCreateWithoutInspectorInput = {
    id?: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutInspectionsInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutInspectionInput
  }

  export type InspectionUncheckedCreateWithoutInspectorInput = {
    id?: string
    caseId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutInspectionInput
  }

  export type InspectionCreateOrConnectWithoutInspectorInput = {
    where: InspectionWhereUniqueInput
    create: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput>
  }

  export type InspectionCreateManyInspectorInputEnvelope = {
    data: InspectionCreateManyInspectorInput | InspectionCreateManyInspectorInput[]
    skipDuplicates?: boolean
  }

  export type ApprovalAuthorityCreateWithoutUserInput = {
    id?: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutApprovalAuthoritiesInput
    jurisdiction: JurisdictionCreateNestedOneWithoutApprovalAuthoritiesInput
    decisions?: OrpDecisionCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityUncheckedCreateWithoutUserInput = {
    id?: string
    departmentId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutAuthorityGrantInput
  }

  export type ApprovalAuthorityCreateOrConnectWithoutUserInput = {
    where: ApprovalAuthorityWhereUniqueInput
    create: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput>
  }

  export type ApprovalAuthorityCreateManyUserInputEnvelope = {
    data: ApprovalAuthorityCreateManyUserInput | ApprovalAuthorityCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrpDecisionCreateWithoutReviewerInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutOrpDecisionsInput
    orp: OperationalResponsePlanCreateNestedOneWithoutDecisionsInput
    authorityGrant: ApprovalAuthorityCreateNestedOneWithoutDecisionsInput
    forwardedUser?: UserCreateNestedOneWithoutForwardedOrpDecisionsInput
  }

  export type OrpDecisionUncheckedCreateWithoutReviewerInput = {
    id?: string
    caseId: string
    orpId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionCreateOrConnectWithoutReviewerInput = {
    where: OrpDecisionWhereUniqueInput
    create: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput>
  }

  export type OrpDecisionCreateManyReviewerInputEnvelope = {
    data: OrpDecisionCreateManyReviewerInput | OrpDecisionCreateManyReviewerInput[]
    skipDuplicates?: boolean
  }

  export type OrpDecisionCreateWithoutForwardedUserInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutOrpDecisionsInput
    orp: OperationalResponsePlanCreateNestedOneWithoutDecisionsInput
    reviewer: UserCreateNestedOneWithoutReviewedOrpDecisionsInput
    authorityGrant: ApprovalAuthorityCreateNestedOneWithoutDecisionsInput
  }

  export type OrpDecisionUncheckedCreateWithoutForwardedUserInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type OrpDecisionCreateOrConnectWithoutForwardedUserInput = {
    where: OrpDecisionWhereUniqueInput
    create: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput>
  }

  export type OrpDecisionCreateManyForwardedUserInputEnvelope = {
    data: OrpDecisionCreateManyForwardedUserInput | OrpDecisionCreateManyForwardedUserInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentUpsertWithoutUsersInput = {
    update: XOR<DepartmentUpdateWithoutUsersInput, DepartmentUncheckedUpdateWithoutUsersInput>
    create: XOR<DepartmentCreateWithoutUsersInput, DepartmentUncheckedCreateWithoutUsersInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutUsersInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutUsersInput, DepartmentUncheckedUpdateWithoutUsersInput>
  }

  export type DepartmentUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assets?: AssetUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assets?: AssetUncheckedUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUncheckedUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type JurisdictionUpsertWithoutUsersInput = {
    update: XOR<JurisdictionUpdateWithoutUsersInput, JurisdictionUncheckedUpdateWithoutUsersInput>
    create: XOR<JurisdictionCreateWithoutUsersInput, JurisdictionUncheckedCreateWithoutUsersInput>
    where?: JurisdictionWhereInput
  }

  export type JurisdictionUpdateToOneWithWhereWithoutUsersInput = {
    where?: JurisdictionWhereInput
    data: XOR<JurisdictionUpdateWithoutUsersInput, JurisdictionUncheckedUpdateWithoutUsersInput>
  }

  export type JurisdictionUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutJurisdictionsNestedInput
    assets?: AssetUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assets?: AssetUncheckedUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionNestedInput
  }

  export type InspectionUpsertWithWhereUniqueWithoutInspectorInput = {
    where: InspectionWhereUniqueInput
    update: XOR<InspectionUpdateWithoutInspectorInput, InspectionUncheckedUpdateWithoutInspectorInput>
    create: XOR<InspectionCreateWithoutInspectorInput, InspectionUncheckedCreateWithoutInspectorInput>
  }

  export type InspectionUpdateWithWhereUniqueWithoutInspectorInput = {
    where: InspectionWhereUniqueInput
    data: XOR<InspectionUpdateWithoutInspectorInput, InspectionUncheckedUpdateWithoutInspectorInput>
  }

  export type InspectionUpdateManyWithWhereWithoutInspectorInput = {
    where: InspectionScalarWhereInput
    data: XOR<InspectionUpdateManyMutationInput, InspectionUncheckedUpdateManyWithoutInspectorInput>
  }

  export type InspectionScalarWhereInput = {
    AND?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
    OR?: InspectionScalarWhereInput[]
    NOT?: InspectionScalarWhereInput | InspectionScalarWhereInput[]
    id?: StringFilter<"Inspection"> | string
    caseId?: StringFilter<"Inspection"> | string
    inspectorId?: StringFilter<"Inspection"> | string
    inspectionDate?: DateTimeFilter<"Inspection"> | Date | string
    structuralCondition?: StringFilter<"Inspection"> | string
    crackSeverity?: StringFilter<"Inspection"> | string
    corrosionLevel?: StringFilter<"Inspection"> | string
    trafficImportance?: StringFilter<"Inspection"> | string
    hospitalRoute?: BoolFilter<"Inspection"> | boolean
    weatherRisk?: StringFilter<"Inspection"> | string
    heavyRainExpected?: BoolFilter<"Inspection"> | boolean
    estimatedDailyUsers?: IntNullableFilter<"Inspection"> | number | null
    inspectionNotes?: StringNullableFilter<"Inspection"> | string | null
    createdAt?: DateTimeFilter<"Inspection"> | Date | string
    updatedAt?: DateTimeFilter<"Inspection"> | Date | string
  }

  export type ApprovalAuthorityUpsertWithWhereUniqueWithoutUserInput = {
    where: ApprovalAuthorityWhereUniqueInput
    update: XOR<ApprovalAuthorityUpdateWithoutUserInput, ApprovalAuthorityUncheckedUpdateWithoutUserInput>
    create: XOR<ApprovalAuthorityCreateWithoutUserInput, ApprovalAuthorityUncheckedCreateWithoutUserInput>
  }

  export type ApprovalAuthorityUpdateWithWhereUniqueWithoutUserInput = {
    where: ApprovalAuthorityWhereUniqueInput
    data: XOR<ApprovalAuthorityUpdateWithoutUserInput, ApprovalAuthorityUncheckedUpdateWithoutUserInput>
  }

  export type ApprovalAuthorityUpdateManyWithWhereWithoutUserInput = {
    where: ApprovalAuthorityScalarWhereInput
    data: XOR<ApprovalAuthorityUpdateManyMutationInput, ApprovalAuthorityUncheckedUpdateManyWithoutUserInput>
  }

  export type OrpDecisionUpsertWithWhereUniqueWithoutReviewerInput = {
    where: OrpDecisionWhereUniqueInput
    update: XOR<OrpDecisionUpdateWithoutReviewerInput, OrpDecisionUncheckedUpdateWithoutReviewerInput>
    create: XOR<OrpDecisionCreateWithoutReviewerInput, OrpDecisionUncheckedCreateWithoutReviewerInput>
  }

  export type OrpDecisionUpdateWithWhereUniqueWithoutReviewerInput = {
    where: OrpDecisionWhereUniqueInput
    data: XOR<OrpDecisionUpdateWithoutReviewerInput, OrpDecisionUncheckedUpdateWithoutReviewerInput>
  }

  export type OrpDecisionUpdateManyWithWhereWithoutReviewerInput = {
    where: OrpDecisionScalarWhereInput
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyWithoutReviewerInput>
  }

  export type OrpDecisionScalarWhereInput = {
    AND?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
    OR?: OrpDecisionScalarWhereInput[]
    NOT?: OrpDecisionScalarWhereInput | OrpDecisionScalarWhereInput[]
    id?: StringFilter<"OrpDecision"> | string
    caseId?: StringFilter<"OrpDecision"> | string
    orpId?: StringFilter<"OrpDecision"> | string
    reviewerId?: StringFilter<"OrpDecision"> | string
    authorityGrantId?: StringFilter<"OrpDecision"> | string
    decisionType?: EnumOrpDecisionTypeFilter<"OrpDecision"> | $Enums.OrpDecisionType
    reason?: StringNullableFilter<"OrpDecision"> | string | null
    remarks?: StringNullableFilter<"OrpDecision"> | string | null
    requestedChanges?: JsonNullableFilter<"OrpDecision">
    forwardToUserId?: StringNullableFilter<"OrpDecision"> | string | null
    createdAt?: DateTimeFilter<"OrpDecision"> | Date | string
  }

  export type OrpDecisionUpsertWithWhereUniqueWithoutForwardedUserInput = {
    where: OrpDecisionWhereUniqueInput
    update: XOR<OrpDecisionUpdateWithoutForwardedUserInput, OrpDecisionUncheckedUpdateWithoutForwardedUserInput>
    create: XOR<OrpDecisionCreateWithoutForwardedUserInput, OrpDecisionUncheckedCreateWithoutForwardedUserInput>
  }

  export type OrpDecisionUpdateWithWhereUniqueWithoutForwardedUserInput = {
    where: OrpDecisionWhereUniqueInput
    data: XOR<OrpDecisionUpdateWithoutForwardedUserInput, OrpDecisionUncheckedUpdateWithoutForwardedUserInput>
  }

  export type OrpDecisionUpdateManyWithWhereWithoutForwardedUserInput = {
    where: OrpDecisionScalarWhereInput
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyWithoutForwardedUserInput>
  }

  export type DepartmentCreateWithoutAssetsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutAssetsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionUncheckedCreateNestedManyWithoutDepartmentInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutAssetsInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutAssetsInput, DepartmentUncheckedCreateWithoutAssetsInput>
  }

  export type JurisdictionCreateWithoutAssetsInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    department: DepartmentCreateNestedOneWithoutJurisdictionsInput
    users?: UserCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUncheckedCreateWithoutAssetsInput = {
    id?: string
    name: string
    type: string
    departmentId: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutJurisdictionInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionCreateOrConnectWithoutAssetsInput = {
    where: JurisdictionWhereUniqueInput
    create: XOR<JurisdictionCreateWithoutAssetsInput, JurisdictionUncheckedCreateWithoutAssetsInput>
  }

  export type CaseCreateWithoutAssetInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateWithoutAssetInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionUncheckedCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseCreateOrConnectWithoutAssetInput = {
    where: CaseWhereUniqueInput
    create: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput>
  }

  export type CaseCreateManyAssetInputEnvelope = {
    data: CaseCreateManyAssetInput | CaseCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentUpsertWithoutAssetsInput = {
    update: XOR<DepartmentUpdateWithoutAssetsInput, DepartmentUncheckedUpdateWithoutAssetsInput>
    create: XOR<DepartmentCreateWithoutAssetsInput, DepartmentUncheckedCreateWithoutAssetsInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutAssetsInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutAssetsInput, DepartmentUncheckedUpdateWithoutAssetsInput>
  }

  export type DepartmentUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUncheckedUpdateManyWithoutDepartmentNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type JurisdictionUpsertWithoutAssetsInput = {
    update: XOR<JurisdictionUpdateWithoutAssetsInput, JurisdictionUncheckedUpdateWithoutAssetsInput>
    create: XOR<JurisdictionCreateWithoutAssetsInput, JurisdictionUncheckedCreateWithoutAssetsInput>
    where?: JurisdictionWhereInput
  }

  export type JurisdictionUpdateToOneWithWhereWithoutAssetsInput = {
    where?: JurisdictionWhereInput
    data: XOR<JurisdictionUpdateWithoutAssetsInput, JurisdictionUncheckedUpdateWithoutAssetsInput>
  }

  export type JurisdictionUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutJurisdictionsNestedInput
    users?: UserUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionNestedInput
  }

  export type CaseUpsertWithWhereUniqueWithoutAssetInput = {
    where: CaseWhereUniqueInput
    update: XOR<CaseUpdateWithoutAssetInput, CaseUncheckedUpdateWithoutAssetInput>
    create: XOR<CaseCreateWithoutAssetInput, CaseUncheckedCreateWithoutAssetInput>
  }

  export type CaseUpdateWithWhereUniqueWithoutAssetInput = {
    where: CaseWhereUniqueInput
    data: XOR<CaseUpdateWithoutAssetInput, CaseUncheckedUpdateWithoutAssetInput>
  }

  export type CaseUpdateManyWithWhereWithoutAssetInput = {
    where: CaseScalarWhereInput
    data: XOR<CaseUpdateManyMutationInput, CaseUncheckedUpdateManyWithoutAssetInput>
  }

  export type CaseScalarWhereInput = {
    AND?: CaseScalarWhereInput | CaseScalarWhereInput[]
    OR?: CaseScalarWhereInput[]
    NOT?: CaseScalarWhereInput | CaseScalarWhereInput[]
    id?: StringFilter<"Case"> | string
    caseNumber?: StringFilter<"Case"> | string
    assetId?: StringFilter<"Case"> | string
    title?: StringFilter<"Case"> | string
    description?: StringNullableFilter<"Case"> | string | null
    status?: EnumCaseStatusFilter<"Case"> | $Enums.CaseStatus
    riskLevel?: EnumRiskLevelNullableFilter<"Case"> | $Enums.RiskLevel | null
    priorityLevel?: EnumPriorityLevelNullableFilter<"Case"> | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFilter<"Case"> | boolean
    createdAt?: DateTimeFilter<"Case"> | Date | string
    updatedAt?: DateTimeFilter<"Case"> | Date | string
    closedAt?: DateTimeNullableFilter<"Case"> | Date | string | null
  }

  export type AssetCreateWithoutCasesInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutAssetsInput
    jurisdiction: JurisdictionCreateNestedOneWithoutAssetsInput
  }

  export type AssetUncheckedCreateWithoutCasesInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    jurisdictionId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetCreateOrConnectWithoutCasesInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutCasesInput, AssetUncheckedCreateWithoutCasesInput>
  }

  export type InspectionCreateWithoutCaseInput = {
    id?: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    inspector: UserCreateNestedOneWithoutInspectionsInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutInspectionInput
  }

  export type InspectionUncheckedCreateWithoutCaseInput = {
    id?: string
    inspectorId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutInspectionInput
  }

  export type InspectionCreateOrConnectWithoutCaseInput = {
    where: InspectionWhereUniqueInput
    create: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput>
  }

  export type InspectionCreateManyCaseInputEnvelope = {
    data: InspectionCreateManyCaseInput | InspectionCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type RiskAssessmentCreateWithoutCaseInput = {
    id?: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    inspection: InspectionCreateNestedOneWithoutRiskAssessmentsInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentUncheckedCreateWithoutCaseInput = {
    id?: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentCreateOrConnectWithoutCaseInput = {
    where: RiskAssessmentWhereUniqueInput
    create: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput>
  }

  export type RiskAssessmentCreateManyCaseInputEnvelope = {
    data: RiskAssessmentCreateManyCaseInput | RiskAssessmentCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type OperationalResponsePlanCreateWithoutCaseInput = {
    id?: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    riskAssessment: RiskAssessmentCreateNestedOneWithoutOperationalResponsePlansInput
    decisions?: OrpDecisionCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanUncheckedCreateWithoutCaseInput = {
    id?: string
    riskAssessmentId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanCreateOrConnectWithoutCaseInput = {
    where: OperationalResponsePlanWhereUniqueInput
    create: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput>
  }

  export type OperationalResponsePlanCreateManyCaseInputEnvelope = {
    data: OperationalResponsePlanCreateManyCaseInput | OperationalResponsePlanCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type OrpDecisionCreateWithoutCaseInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    orp: OperationalResponsePlanCreateNestedOneWithoutDecisionsInput
    reviewer: UserCreateNestedOneWithoutReviewedOrpDecisionsInput
    authorityGrant: ApprovalAuthorityCreateNestedOneWithoutDecisionsInput
    forwardedUser?: UserCreateNestedOneWithoutForwardedOrpDecisionsInput
  }

  export type OrpDecisionUncheckedCreateWithoutCaseInput = {
    id?: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionCreateOrConnectWithoutCaseInput = {
    where: OrpDecisionWhereUniqueInput
    create: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput>
  }

  export type OrpDecisionCreateManyCaseInputEnvelope = {
    data: OrpDecisionCreateManyCaseInput | OrpDecisionCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithoutCasesInput = {
    update: XOR<AssetUpdateWithoutCasesInput, AssetUncheckedUpdateWithoutCasesInput>
    create: XOR<AssetCreateWithoutCasesInput, AssetUncheckedCreateWithoutCasesInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutCasesInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutCasesInput, AssetUncheckedUpdateWithoutCasesInput>
  }

  export type AssetUpdateWithoutCasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutAssetsNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutAssetsNestedInput
  }

  export type AssetUncheckedUpdateWithoutCasesInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspectionUpsertWithWhereUniqueWithoutCaseInput = {
    where: InspectionWhereUniqueInput
    update: XOR<InspectionUpdateWithoutCaseInput, InspectionUncheckedUpdateWithoutCaseInput>
    create: XOR<InspectionCreateWithoutCaseInput, InspectionUncheckedCreateWithoutCaseInput>
  }

  export type InspectionUpdateWithWhereUniqueWithoutCaseInput = {
    where: InspectionWhereUniqueInput
    data: XOR<InspectionUpdateWithoutCaseInput, InspectionUncheckedUpdateWithoutCaseInput>
  }

  export type InspectionUpdateManyWithWhereWithoutCaseInput = {
    where: InspectionScalarWhereInput
    data: XOR<InspectionUpdateManyMutationInput, InspectionUncheckedUpdateManyWithoutCaseInput>
  }

  export type RiskAssessmentUpsertWithWhereUniqueWithoutCaseInput = {
    where: RiskAssessmentWhereUniqueInput
    update: XOR<RiskAssessmentUpdateWithoutCaseInput, RiskAssessmentUncheckedUpdateWithoutCaseInput>
    create: XOR<RiskAssessmentCreateWithoutCaseInput, RiskAssessmentUncheckedCreateWithoutCaseInput>
  }

  export type RiskAssessmentUpdateWithWhereUniqueWithoutCaseInput = {
    where: RiskAssessmentWhereUniqueInput
    data: XOR<RiskAssessmentUpdateWithoutCaseInput, RiskAssessmentUncheckedUpdateWithoutCaseInput>
  }

  export type RiskAssessmentUpdateManyWithWhereWithoutCaseInput = {
    where: RiskAssessmentScalarWhereInput
    data: XOR<RiskAssessmentUpdateManyMutationInput, RiskAssessmentUncheckedUpdateManyWithoutCaseInput>
  }

  export type RiskAssessmentScalarWhereInput = {
    AND?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
    OR?: RiskAssessmentScalarWhereInput[]
    NOT?: RiskAssessmentScalarWhereInput | RiskAssessmentScalarWhereInput[]
    id?: StringFilter<"RiskAssessment"> | string
    caseId?: StringFilter<"RiskAssessment"> | string
    inspectionId?: StringFilter<"RiskAssessment"> | string
    riskScore?: IntFilter<"RiskAssessment"> | number
    riskLevel?: EnumRiskLevelFilter<"RiskAssessment"> | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFilter<"RiskAssessment"> | $Enums.PriorityLevel
    reasonCodes?: JsonFilter<"RiskAssessment">
    reasons?: JsonFilter<"RiskAssessment">
    assessmentVersion?: StringFilter<"RiskAssessment"> | string
    createdAt?: DateTimeFilter<"RiskAssessment"> | Date | string
  }

  export type OperationalResponsePlanUpsertWithWhereUniqueWithoutCaseInput = {
    where: OperationalResponsePlanWhereUniqueInput
    update: XOR<OperationalResponsePlanUpdateWithoutCaseInput, OperationalResponsePlanUncheckedUpdateWithoutCaseInput>
    create: XOR<OperationalResponsePlanCreateWithoutCaseInput, OperationalResponsePlanUncheckedCreateWithoutCaseInput>
  }

  export type OperationalResponsePlanUpdateWithWhereUniqueWithoutCaseInput = {
    where: OperationalResponsePlanWhereUniqueInput
    data: XOR<OperationalResponsePlanUpdateWithoutCaseInput, OperationalResponsePlanUncheckedUpdateWithoutCaseInput>
  }

  export type OperationalResponsePlanUpdateManyWithWhereWithoutCaseInput = {
    where: OperationalResponsePlanScalarWhereInput
    data: XOR<OperationalResponsePlanUpdateManyMutationInput, OperationalResponsePlanUncheckedUpdateManyWithoutCaseInput>
  }

  export type OperationalResponsePlanScalarWhereInput = {
    AND?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
    OR?: OperationalResponsePlanScalarWhereInput[]
    NOT?: OperationalResponsePlanScalarWhereInput | OperationalResponsePlanScalarWhereInput[]
    id?: StringFilter<"OperationalResponsePlan"> | string
    caseId?: StringFilter<"OperationalResponsePlan"> | string
    riskAssessmentId?: StringFilter<"OperationalResponsePlan"> | string
    versionNumber?: IntFilter<"OperationalResponsePlan"> | number
    status?: StringFilter<"OperationalResponsePlan"> | string
    urgency?: StringFilter<"OperationalResponsePlan"> | string
    recommendedActionCodes?: JsonFilter<"OperationalResponsePlan">
    temporaryMeasures?: JsonFilter<"OperationalResponsePlan">
    reasons?: JsonFilter<"OperationalResponsePlan">
    alternativeActionCodes?: JsonFilter<"OperationalResponsePlan">
    planVersion?: StringFilter<"OperationalResponsePlan"> | string
    createdAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
    updatedAt?: DateTimeFilter<"OperationalResponsePlan"> | Date | string
  }

  export type OrpDecisionUpsertWithWhereUniqueWithoutCaseInput = {
    where: OrpDecisionWhereUniqueInput
    update: XOR<OrpDecisionUpdateWithoutCaseInput, OrpDecisionUncheckedUpdateWithoutCaseInput>
    create: XOR<OrpDecisionCreateWithoutCaseInput, OrpDecisionUncheckedCreateWithoutCaseInput>
  }

  export type OrpDecisionUpdateWithWhereUniqueWithoutCaseInput = {
    where: OrpDecisionWhereUniqueInput
    data: XOR<OrpDecisionUpdateWithoutCaseInput, OrpDecisionUncheckedUpdateWithoutCaseInput>
  }

  export type OrpDecisionUpdateManyWithWhereWithoutCaseInput = {
    where: OrpDecisionScalarWhereInput
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyWithoutCaseInput>
  }

  export type CaseCreateWithoutInspectionsInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    asset: AssetCreateNestedOneWithoutCasesInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateWithoutInspectionsInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseCreateOrConnectWithoutInspectionsInput = {
    where: CaseWhereUniqueInput
    create: XOR<CaseCreateWithoutInspectionsInput, CaseUncheckedCreateWithoutInspectionsInput>
  }

  export type UserCreateWithoutInspectionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateWithoutInspectionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserCreateOrConnectWithoutInspectionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInspectionsInput, UserUncheckedCreateWithoutInspectionsInput>
  }

  export type RiskAssessmentCreateWithoutInspectionInput = {
    id?: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutRiskAssessmentsInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentUncheckedCreateWithoutInspectionInput = {
    id?: string
    caseId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutRiskAssessmentInput
  }

  export type RiskAssessmentCreateOrConnectWithoutInspectionInput = {
    where: RiskAssessmentWhereUniqueInput
    create: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput>
  }

  export type RiskAssessmentCreateManyInspectionInputEnvelope = {
    data: RiskAssessmentCreateManyInspectionInput | RiskAssessmentCreateManyInspectionInput[]
    skipDuplicates?: boolean
  }

  export type CaseUpsertWithoutInspectionsInput = {
    update: XOR<CaseUpdateWithoutInspectionsInput, CaseUncheckedUpdateWithoutInspectionsInput>
    create: XOR<CaseCreateWithoutInspectionsInput, CaseUncheckedCreateWithoutInspectionsInput>
    where?: CaseWhereInput
  }

  export type CaseUpdateToOneWithWhereWithoutInspectionsInput = {
    where?: CaseWhereInput
    data: XOR<CaseUpdateWithoutInspectionsInput, CaseUncheckedUpdateWithoutInspectionsInput>
  }

  export type CaseUpdateWithoutInspectionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asset?: AssetUpdateOneRequiredWithoutCasesNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateWithoutInspectionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type UserUpsertWithoutInspectionsInput = {
    update: XOR<UserUpdateWithoutInspectionsInput, UserUncheckedUpdateWithoutInspectionsInput>
    create: XOR<UserCreateWithoutInspectionsInput, UserUncheckedCreateWithoutInspectionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutInspectionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutInspectionsInput, UserUncheckedUpdateWithoutInspectionsInput>
  }

  export type UserUpdateWithoutInspectionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateWithoutInspectionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type RiskAssessmentUpsertWithWhereUniqueWithoutInspectionInput = {
    where: RiskAssessmentWhereUniqueInput
    update: XOR<RiskAssessmentUpdateWithoutInspectionInput, RiskAssessmentUncheckedUpdateWithoutInspectionInput>
    create: XOR<RiskAssessmentCreateWithoutInspectionInput, RiskAssessmentUncheckedCreateWithoutInspectionInput>
  }

  export type RiskAssessmentUpdateWithWhereUniqueWithoutInspectionInput = {
    where: RiskAssessmentWhereUniqueInput
    data: XOR<RiskAssessmentUpdateWithoutInspectionInput, RiskAssessmentUncheckedUpdateWithoutInspectionInput>
  }

  export type RiskAssessmentUpdateManyWithWhereWithoutInspectionInput = {
    where: RiskAssessmentScalarWhereInput
    data: XOR<RiskAssessmentUpdateManyMutationInput, RiskAssessmentUncheckedUpdateManyWithoutInspectionInput>
  }

  export type CaseCreateWithoutRiskAssessmentsInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    asset: AssetCreateNestedOneWithoutCasesInput
    inspections?: InspectionCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateWithoutRiskAssessmentsInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionUncheckedCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseCreateOrConnectWithoutRiskAssessmentsInput = {
    where: CaseWhereUniqueInput
    create: XOR<CaseCreateWithoutRiskAssessmentsInput, CaseUncheckedCreateWithoutRiskAssessmentsInput>
  }

  export type InspectionCreateWithoutRiskAssessmentsInput = {
    id?: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutInspectionsInput
    inspector: UserCreateNestedOneWithoutInspectionsInput
  }

  export type InspectionUncheckedCreateWithoutRiskAssessmentsInput = {
    id?: string
    caseId: string
    inspectorId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InspectionCreateOrConnectWithoutRiskAssessmentsInput = {
    where: InspectionWhereUniqueInput
    create: XOR<InspectionCreateWithoutRiskAssessmentsInput, InspectionUncheckedCreateWithoutRiskAssessmentsInput>
  }

  export type OperationalResponsePlanCreateWithoutRiskAssessmentInput = {
    id?: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutOperationalResponsePlansInput
    decisions?: OrpDecisionCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput = {
    id?: string
    caseId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: OrpDecisionUncheckedCreateNestedManyWithoutOrpInput
  }

  export type OperationalResponsePlanCreateOrConnectWithoutRiskAssessmentInput = {
    where: OperationalResponsePlanWhereUniqueInput
    create: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput>
  }

  export type OperationalResponsePlanCreateManyRiskAssessmentInputEnvelope = {
    data: OperationalResponsePlanCreateManyRiskAssessmentInput | OperationalResponsePlanCreateManyRiskAssessmentInput[]
    skipDuplicates?: boolean
  }

  export type CaseUpsertWithoutRiskAssessmentsInput = {
    update: XOR<CaseUpdateWithoutRiskAssessmentsInput, CaseUncheckedUpdateWithoutRiskAssessmentsInput>
    create: XOR<CaseCreateWithoutRiskAssessmentsInput, CaseUncheckedCreateWithoutRiskAssessmentsInput>
    where?: CaseWhereInput
  }

  export type CaseUpdateToOneWithWhereWithoutRiskAssessmentsInput = {
    where?: CaseWhereInput
    data: XOR<CaseUpdateWithoutRiskAssessmentsInput, CaseUncheckedUpdateWithoutRiskAssessmentsInput>
  }

  export type CaseUpdateWithoutRiskAssessmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asset?: AssetUpdateOneRequiredWithoutCasesNestedInput
    inspections?: InspectionUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateWithoutRiskAssessmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUncheckedUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type InspectionUpsertWithoutRiskAssessmentsInput = {
    update: XOR<InspectionUpdateWithoutRiskAssessmentsInput, InspectionUncheckedUpdateWithoutRiskAssessmentsInput>
    create: XOR<InspectionCreateWithoutRiskAssessmentsInput, InspectionUncheckedCreateWithoutRiskAssessmentsInput>
    where?: InspectionWhereInput
  }

  export type InspectionUpdateToOneWithWhereWithoutRiskAssessmentsInput = {
    where?: InspectionWhereInput
    data: XOR<InspectionUpdateWithoutRiskAssessmentsInput, InspectionUncheckedUpdateWithoutRiskAssessmentsInput>
  }

  export type InspectionUpdateWithoutRiskAssessmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutInspectionsNestedInput
    inspector?: UserUpdateOneRequiredWithoutInspectionsNestedInput
  }

  export type InspectionUncheckedUpdateWithoutRiskAssessmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectorId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalResponsePlanUpsertWithWhereUniqueWithoutRiskAssessmentInput = {
    where: OperationalResponsePlanWhereUniqueInput
    update: XOR<OperationalResponsePlanUpdateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedUpdateWithoutRiskAssessmentInput>
    create: XOR<OperationalResponsePlanCreateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedCreateWithoutRiskAssessmentInput>
  }

  export type OperationalResponsePlanUpdateWithWhereUniqueWithoutRiskAssessmentInput = {
    where: OperationalResponsePlanWhereUniqueInput
    data: XOR<OperationalResponsePlanUpdateWithoutRiskAssessmentInput, OperationalResponsePlanUncheckedUpdateWithoutRiskAssessmentInput>
  }

  export type OperationalResponsePlanUpdateManyWithWhereWithoutRiskAssessmentInput = {
    where: OperationalResponsePlanScalarWhereInput
    data: XOR<OperationalResponsePlanUpdateManyMutationInput, OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentInput>
  }

  export type CaseCreateWithoutOperationalResponsePlansInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    asset: AssetCreateNestedOneWithoutCasesInput
    inspections?: InspectionCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateWithoutOperationalResponsePlansInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionUncheckedCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput
    orpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseCreateOrConnectWithoutOperationalResponsePlansInput = {
    where: CaseWhereUniqueInput
    create: XOR<CaseCreateWithoutOperationalResponsePlansInput, CaseUncheckedCreateWithoutOperationalResponsePlansInput>
  }

  export type RiskAssessmentCreateWithoutOperationalResponsePlansInput = {
    id?: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutRiskAssessmentsInput
    inspection: InspectionCreateNestedOneWithoutRiskAssessmentsInput
  }

  export type RiskAssessmentUncheckedCreateWithoutOperationalResponsePlansInput = {
    id?: string
    caseId: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
  }

  export type RiskAssessmentCreateOrConnectWithoutOperationalResponsePlansInput = {
    where: RiskAssessmentWhereUniqueInput
    create: XOR<RiskAssessmentCreateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedCreateWithoutOperationalResponsePlansInput>
  }

  export type OrpDecisionCreateWithoutOrpInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutOrpDecisionsInput
    reviewer: UserCreateNestedOneWithoutReviewedOrpDecisionsInput
    authorityGrant: ApprovalAuthorityCreateNestedOneWithoutDecisionsInput
    forwardedUser?: UserCreateNestedOneWithoutForwardedOrpDecisionsInput
  }

  export type OrpDecisionUncheckedCreateWithoutOrpInput = {
    id?: string
    caseId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionCreateOrConnectWithoutOrpInput = {
    where: OrpDecisionWhereUniqueInput
    create: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput>
  }

  export type OrpDecisionCreateManyOrpInputEnvelope = {
    data: OrpDecisionCreateManyOrpInput | OrpDecisionCreateManyOrpInput[]
    skipDuplicates?: boolean
  }

  export type CaseUpsertWithoutOperationalResponsePlansInput = {
    update: XOR<CaseUpdateWithoutOperationalResponsePlansInput, CaseUncheckedUpdateWithoutOperationalResponsePlansInput>
    create: XOR<CaseCreateWithoutOperationalResponsePlansInput, CaseUncheckedCreateWithoutOperationalResponsePlansInput>
    where?: CaseWhereInput
  }

  export type CaseUpdateToOneWithWhereWithoutOperationalResponsePlansInput = {
    where?: CaseWhereInput
    data: XOR<CaseUpdateWithoutOperationalResponsePlansInput, CaseUncheckedUpdateWithoutOperationalResponsePlansInput>
  }

  export type CaseUpdateWithoutOperationalResponsePlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asset?: AssetUpdateOneRequiredWithoutCasesNestedInput
    inspections?: InspectionUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateWithoutOperationalResponsePlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUncheckedUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type RiskAssessmentUpsertWithoutOperationalResponsePlansInput = {
    update: XOR<RiskAssessmentUpdateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedUpdateWithoutOperationalResponsePlansInput>
    create: XOR<RiskAssessmentCreateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedCreateWithoutOperationalResponsePlansInput>
    where?: RiskAssessmentWhereInput
  }

  export type RiskAssessmentUpdateToOneWithWhereWithoutOperationalResponsePlansInput = {
    where?: RiskAssessmentWhereInput
    data: XOR<RiskAssessmentUpdateWithoutOperationalResponsePlansInput, RiskAssessmentUncheckedUpdateWithoutOperationalResponsePlansInput>
  }

  export type RiskAssessmentUpdateWithoutOperationalResponsePlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutRiskAssessmentsNestedInput
    inspection?: InspectionUpdateOneRequiredWithoutRiskAssessmentsNestedInput
  }

  export type RiskAssessmentUncheckedUpdateWithoutOperationalResponsePlansInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectionId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUpsertWithWhereUniqueWithoutOrpInput = {
    where: OrpDecisionWhereUniqueInput
    update: XOR<OrpDecisionUpdateWithoutOrpInput, OrpDecisionUncheckedUpdateWithoutOrpInput>
    create: XOR<OrpDecisionCreateWithoutOrpInput, OrpDecisionUncheckedCreateWithoutOrpInput>
  }

  export type OrpDecisionUpdateWithWhereUniqueWithoutOrpInput = {
    where: OrpDecisionWhereUniqueInput
    data: XOR<OrpDecisionUpdateWithoutOrpInput, OrpDecisionUncheckedUpdateWithoutOrpInput>
  }

  export type OrpDecisionUpdateManyWithWhereWithoutOrpInput = {
    where: OrpDecisionScalarWhereInput
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyWithoutOrpInput>
  }

  export type UserCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserCreateOrConnectWithoutApprovalAuthoritiesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutApprovalAuthoritiesInput, UserUncheckedCreateWithoutApprovalAuthoritiesInput>
  }

  export type DepartmentCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserCreateNestedManyWithoutDepartmentInput
    assets?: AssetCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutDepartmentInput
    assets?: AssetUncheckedCreateNestedManyWithoutDepartmentInput
    jurisdictions?: JurisdictionUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutApprovalAuthoritiesInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutApprovalAuthoritiesInput, DepartmentUncheckedCreateWithoutApprovalAuthoritiesInput>
  }

  export type JurisdictionCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
    department: DepartmentCreateNestedOneWithoutJurisdictionsInput
    users?: UserCreateNestedManyWithoutJurisdictionInput
    assets?: AssetCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionUncheckedCreateWithoutApprovalAuthoritiesInput = {
    id?: string
    name: string
    type: string
    departmentId: string
    createdAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutJurisdictionInput
    assets?: AssetUncheckedCreateNestedManyWithoutJurisdictionInput
  }

  export type JurisdictionCreateOrConnectWithoutApprovalAuthoritiesInput = {
    where: JurisdictionWhereUniqueInput
    create: XOR<JurisdictionCreateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedCreateWithoutApprovalAuthoritiesInput>
  }

  export type OrpDecisionCreateWithoutAuthorityGrantInput = {
    id?: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    case: CaseCreateNestedOneWithoutOrpDecisionsInput
    orp: OperationalResponsePlanCreateNestedOneWithoutDecisionsInput
    reviewer: UserCreateNestedOneWithoutReviewedOrpDecisionsInput
    forwardedUser?: UserCreateNestedOneWithoutForwardedOrpDecisionsInput
  }

  export type OrpDecisionUncheckedCreateWithoutAuthorityGrantInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionCreateOrConnectWithoutAuthorityGrantInput = {
    where: OrpDecisionWhereUniqueInput
    create: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput>
  }

  export type OrpDecisionCreateManyAuthorityGrantInputEnvelope = {
    data: OrpDecisionCreateManyAuthorityGrantInput | OrpDecisionCreateManyAuthorityGrantInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutApprovalAuthoritiesInput = {
    update: XOR<UserUpdateWithoutApprovalAuthoritiesInput, UserUncheckedUpdateWithoutApprovalAuthoritiesInput>
    create: XOR<UserCreateWithoutApprovalAuthoritiesInput, UserUncheckedCreateWithoutApprovalAuthoritiesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutApprovalAuthoritiesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutApprovalAuthoritiesInput, UserUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type UserUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type DepartmentUpsertWithoutApprovalAuthoritiesInput = {
    update: XOR<DepartmentUpdateWithoutApprovalAuthoritiesInput, DepartmentUncheckedUpdateWithoutApprovalAuthoritiesInput>
    create: XOR<DepartmentCreateWithoutApprovalAuthoritiesInput, DepartmentUncheckedCreateWithoutApprovalAuthoritiesInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutApprovalAuthoritiesInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutApprovalAuthoritiesInput, DepartmentUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type DepartmentUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
    assets?: AssetUncheckedUpdateManyWithoutDepartmentNestedInput
    jurisdictions?: JurisdictionUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type JurisdictionUpsertWithoutApprovalAuthoritiesInput = {
    update: XOR<JurisdictionUpdateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedUpdateWithoutApprovalAuthoritiesInput>
    create: XOR<JurisdictionCreateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedCreateWithoutApprovalAuthoritiesInput>
    where?: JurisdictionWhereInput
  }

  export type JurisdictionUpdateToOneWithWhereWithoutApprovalAuthoritiesInput = {
    where?: JurisdictionWhereInput
    data: XOR<JurisdictionUpdateWithoutApprovalAuthoritiesInput, JurisdictionUncheckedUpdateWithoutApprovalAuthoritiesInput>
  }

  export type JurisdictionUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutJurisdictionsNestedInput
    users?: UserUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateWithoutApprovalAuthoritiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUncheckedUpdateManyWithoutJurisdictionNestedInput
  }

  export type OrpDecisionUpsertWithWhereUniqueWithoutAuthorityGrantInput = {
    where: OrpDecisionWhereUniqueInput
    update: XOR<OrpDecisionUpdateWithoutAuthorityGrantInput, OrpDecisionUncheckedUpdateWithoutAuthorityGrantInput>
    create: XOR<OrpDecisionCreateWithoutAuthorityGrantInput, OrpDecisionUncheckedCreateWithoutAuthorityGrantInput>
  }

  export type OrpDecisionUpdateWithWhereUniqueWithoutAuthorityGrantInput = {
    where: OrpDecisionWhereUniqueInput
    data: XOR<OrpDecisionUpdateWithoutAuthorityGrantInput, OrpDecisionUncheckedUpdateWithoutAuthorityGrantInput>
  }

  export type OrpDecisionUpdateManyWithWhereWithoutAuthorityGrantInput = {
    where: OrpDecisionScalarWhereInput
    data: XOR<OrpDecisionUpdateManyMutationInput, OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantInput>
  }

  export type CaseCreateWithoutOrpDecisionsInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    asset: AssetCreateNestedOneWithoutCasesInput
    inspections?: InspectionCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanCreateNestedManyWithoutCaseInput
  }

  export type CaseUncheckedCreateWithoutOrpDecisionsInput = {
    id?: string
    caseNumber: string
    assetId: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    inspections?: InspectionUncheckedCreateNestedManyWithoutCaseInput
    riskAssessments?: RiskAssessmentUncheckedCreateNestedManyWithoutCaseInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedCreateNestedManyWithoutCaseInput
  }

  export type CaseCreateOrConnectWithoutOrpDecisionsInput = {
    where: CaseWhereUniqueInput
    create: XOR<CaseCreateWithoutOrpDecisionsInput, CaseUncheckedCreateWithoutOrpDecisionsInput>
  }

  export type OperationalResponsePlanCreateWithoutDecisionsInput = {
    id?: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    case: CaseCreateNestedOneWithoutOperationalResponsePlansInput
    riskAssessment: RiskAssessmentCreateNestedOneWithoutOperationalResponsePlansInput
  }

  export type OperationalResponsePlanUncheckedCreateWithoutDecisionsInput = {
    id?: string
    caseId: string
    riskAssessmentId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalResponsePlanCreateOrConnectWithoutDecisionsInput = {
    where: OperationalResponsePlanWhereUniqueInput
    create: XOR<OperationalResponsePlanCreateWithoutDecisionsInput, OperationalResponsePlanUncheckedCreateWithoutDecisionsInput>
  }

  export type UserCreateWithoutReviewedOrpDecisionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    forwardedOrpDecisions?: OrpDecisionCreateNestedManyWithoutForwardedUserInput
  }

  export type UserUncheckedCreateWithoutReviewedOrpDecisionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    forwardedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutForwardedUserInput
  }

  export type UserCreateOrConnectWithoutReviewedOrpDecisionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReviewedOrpDecisionsInput, UserUncheckedCreateWithoutReviewedOrpDecisionsInput>
  }

  export type ApprovalAuthorityCreateWithoutDecisionsInput = {
    id?: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutApprovalAuthoritiesInput
    department: DepartmentCreateNestedOneWithoutApprovalAuthoritiesInput
    jurisdiction: JurisdictionCreateNestedOneWithoutApprovalAuthoritiesInput
  }

  export type ApprovalAuthorityUncheckedCreateWithoutDecisionsInput = {
    id?: string
    userId: string
    departmentId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApprovalAuthorityCreateOrConnectWithoutDecisionsInput = {
    where: ApprovalAuthorityWhereUniqueInput
    create: XOR<ApprovalAuthorityCreateWithoutDecisionsInput, ApprovalAuthorityUncheckedCreateWithoutDecisionsInput>
  }

  export type UserCreateWithoutForwardedOrpDecisionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    department: DepartmentCreateNestedOneWithoutUsersInput
    jurisdiction: JurisdictionCreateNestedOneWithoutUsersInput
    inspections?: InspectionCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionCreateNestedManyWithoutReviewerInput
  }

  export type UserUncheckedCreateWithoutForwardedOrpDecisionsInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    inspections?: InspectionUncheckedCreateNestedManyWithoutInspectorInput
    approvalAuthorities?: ApprovalAuthorityUncheckedCreateNestedManyWithoutUserInput
    reviewedOrpDecisions?: OrpDecisionUncheckedCreateNestedManyWithoutReviewerInput
  }

  export type UserCreateOrConnectWithoutForwardedOrpDecisionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutForwardedOrpDecisionsInput, UserUncheckedCreateWithoutForwardedOrpDecisionsInput>
  }

  export type CaseUpsertWithoutOrpDecisionsInput = {
    update: XOR<CaseUpdateWithoutOrpDecisionsInput, CaseUncheckedUpdateWithoutOrpDecisionsInput>
    create: XOR<CaseCreateWithoutOrpDecisionsInput, CaseUncheckedCreateWithoutOrpDecisionsInput>
    where?: CaseWhereInput
  }

  export type CaseUpdateToOneWithWhereWithoutOrpDecisionsInput = {
    where?: CaseWhereInput
    data: XOR<CaseUpdateWithoutOrpDecisionsInput, CaseUncheckedUpdateWithoutOrpDecisionsInput>
  }

  export type CaseUpdateWithoutOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    asset?: AssetUpdateOneRequiredWithoutCasesNestedInput
    inspections?: InspectionUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateWithoutOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUncheckedUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type OperationalResponsePlanUpsertWithoutDecisionsInput = {
    update: XOR<OperationalResponsePlanUpdateWithoutDecisionsInput, OperationalResponsePlanUncheckedUpdateWithoutDecisionsInput>
    create: XOR<OperationalResponsePlanCreateWithoutDecisionsInput, OperationalResponsePlanUncheckedCreateWithoutDecisionsInput>
    where?: OperationalResponsePlanWhereInput
  }

  export type OperationalResponsePlanUpdateToOneWithWhereWithoutDecisionsInput = {
    where?: OperationalResponsePlanWhereInput
    data: XOR<OperationalResponsePlanUpdateWithoutDecisionsInput, OperationalResponsePlanUncheckedUpdateWithoutDecisionsInput>
  }

  export type OperationalResponsePlanUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
    riskAssessment?: RiskAssessmentUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    riskAssessmentId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutReviewedOrpDecisionsInput = {
    update: XOR<UserUpdateWithoutReviewedOrpDecisionsInput, UserUncheckedUpdateWithoutReviewedOrpDecisionsInput>
    create: XOR<UserCreateWithoutReviewedOrpDecisionsInput, UserUncheckedCreateWithoutReviewedOrpDecisionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReviewedOrpDecisionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReviewedOrpDecisionsInput, UserUncheckedUpdateWithoutReviewedOrpDecisionsInput>
  }

  export type UserUpdateWithoutReviewedOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateWithoutReviewedOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type ApprovalAuthorityUpsertWithoutDecisionsInput = {
    update: XOR<ApprovalAuthorityUpdateWithoutDecisionsInput, ApprovalAuthorityUncheckedUpdateWithoutDecisionsInput>
    create: XOR<ApprovalAuthorityCreateWithoutDecisionsInput, ApprovalAuthorityUncheckedCreateWithoutDecisionsInput>
    where?: ApprovalAuthorityWhereInput
  }

  export type ApprovalAuthorityUpdateToOneWithWhereWithoutDecisionsInput = {
    where?: ApprovalAuthorityWhereInput
    data: XOR<ApprovalAuthorityUpdateWithoutDecisionsInput, ApprovalAuthorityUncheckedUpdateWithoutDecisionsInput>
  }

  export type ApprovalAuthorityUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    department?: DepartmentUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutForwardedOrpDecisionsInput = {
    update: XOR<UserUpdateWithoutForwardedOrpDecisionsInput, UserUncheckedUpdateWithoutForwardedOrpDecisionsInput>
    create: XOR<UserCreateWithoutForwardedOrpDecisionsInput, UserUncheckedCreateWithoutForwardedOrpDecisionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutForwardedOrpDecisionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutForwardedOrpDecisionsInput, UserUncheckedUpdateWithoutForwardedOrpDecisionsInput>
  }

  export type UserUpdateWithoutForwardedOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
  }

  export type UserUncheckedUpdateWithoutForwardedOrpDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
  }

  export type UserCreateManyDepartmentInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    jurisdictionId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetCreateManyDepartmentInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    jurisdictionId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JurisdictionCreateManyDepartmentInput = {
    id?: string
    name: string
    type: string
    createdAt?: Date | string
  }

  export type ApprovalAuthorityCreateManyDepartmentInput = {
    id?: string
    userId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutAssetsNestedInput
    cases?: CaseUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cases?: CaseUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JurisdictionUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutJurisdictionNestedInput
    assets?: AssetUncheckedUpdateManyWithoutJurisdictionNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionNestedInput
  }

  export type JurisdictionUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApprovalAuthorityUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    decisions?: OrpDecisionUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyJurisdictionInput = {
    id?: string
    employeeCode: string
    name: string
    email: string
    passwordHash: string
    designation: string
    role?: $Enums.SystemRole
    status?: $Enums.UserStatus
    departmentId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetCreateManyJurisdictionInput = {
    id?: string
    assetCode: string
    name: string
    assetType: $Enums.AssetType
    departmentId: string
    latitude?: Decimal | DecimalJsLike | number | string | null
    longitude?: Decimal | DecimalJsLike | number | string | null
    constructionYear?: number | null
    conditionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApprovalAuthorityCreateManyJurisdictionInput = {
    id?: string
    userId: string
    departmentId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutUsersNestedInput
    inspections?: InspectionUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspections?: InspectionUncheckedUpdateManyWithoutInspectorNestedInput
    approvalAuthorities?: ApprovalAuthorityUncheckedUpdateManyWithoutUserNestedInput
    reviewedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutReviewerNestedInput
    forwardedOrpDecisions?: OrpDecisionUncheckedUpdateManyWithoutForwardedUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    designation?: StringFieldUpdateOperationsInput | string
    role?: EnumSystemRoleFieldUpdateOperationsInput | $Enums.SystemRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    departmentId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutAssetsNestedInput
    cases?: CaseUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    departmentId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cases?: CaseUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateManyWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    departmentId?: StringFieldUpdateOperationsInput | string
    latitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    longitude?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    constructionYear?: NullableIntFieldUpdateOperationsInput | number | null
    conditionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApprovalAuthorityUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    department?: DepartmentUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    decisions?: OrpDecisionUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutJurisdictionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InspectionCreateManyInspectorInput = {
    id?: string
    caseId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApprovalAuthorityCreateManyUserInput = {
    id?: string
    departmentId: string
    jurisdictionId: string
    canApprove?: boolean
    canReject?: boolean
    canRequestModification?: boolean
    canRequestReinspection?: boolean
    canEscalate?: boolean
    maxPriorityLevel?: $Enums.PriorityLevel | null
    isActive?: boolean
    validFrom?: Date | string | null
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrpDecisionCreateManyReviewerInput = {
    id?: string
    caseId: string
    orpId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionCreateManyForwardedUserInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type InspectionUpdateWithoutInspectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutInspectionsNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionUncheckedUpdateWithoutInspectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionUncheckedUpdateManyWithoutInspectorInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApprovalAuthorityUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    department?: DepartmentUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    jurisdiction?: JurisdictionUpdateOneRequiredWithoutApprovalAuthoritiesNestedInput
    decisions?: OrpDecisionUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantNestedInput
  }

  export type ApprovalAuthorityUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    departmentId?: StringFieldUpdateOperationsInput | string
    jurisdictionId?: StringFieldUpdateOperationsInput | string
    canApprove?: BoolFieldUpdateOperationsInput | boolean
    canReject?: BoolFieldUpdateOperationsInput | boolean
    canRequestModification?: BoolFieldUpdateOperationsInput | boolean
    canRequestReinspection?: BoolFieldUpdateOperationsInput | boolean
    canEscalate?: BoolFieldUpdateOperationsInput | boolean
    maxPriorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUpdateWithoutReviewerInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput
    orp?: OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput
    authorityGrant?: ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput
    forwardedUser?: UserUpdateOneWithoutForwardedOrpDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateWithoutReviewerInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyWithoutReviewerInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUpdateWithoutForwardedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput
    orp?: OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput
    reviewer?: UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput
    authorityGrant?: ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateWithoutForwardedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyWithoutForwardedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CaseCreateManyAssetInput = {
    id?: string
    caseNumber: string
    title: string
    description?: string | null
    status?: $Enums.CaseStatus
    riskLevel?: $Enums.RiskLevel | null
    priorityLevel?: $Enums.PriorityLevel | null
    emergencyFlag?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type CaseUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    inspections?: InspectionUncheckedUpdateManyWithoutCaseNestedInput
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutCaseNestedInput
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutCaseNestedInput
    orpDecisions?: OrpDecisionUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type CaseUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseNumber?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCaseStatusFieldUpdateOperationsInput | $Enums.CaseStatus
    riskLevel?: NullableEnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel | null
    priorityLevel?: NullableEnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel | null
    emergencyFlag?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type InspectionCreateManyCaseInput = {
    id?: string
    inspectorId: string
    inspectionDate: Date | string
    structuralCondition: string
    crackSeverity: string
    corrosionLevel: string
    trafficImportance: string
    hospitalRoute: boolean
    weatherRisk: string
    heavyRainExpected: boolean
    estimatedDailyUsers?: number | null
    inspectionNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RiskAssessmentCreateManyCaseInput = {
    id?: string
    inspectionId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
  }

  export type OperationalResponsePlanCreateManyCaseInput = {
    id?: string
    riskAssessmentId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrpDecisionCreateManyCaseInput = {
    id?: string
    orpId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type InspectionUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspector?: UserUpdateOneRequiredWithoutInspectionsNestedInput
    riskAssessments?: RiskAssessmentUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectorId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    riskAssessments?: RiskAssessmentUncheckedUpdateManyWithoutInspectionNestedInput
  }

  export type InspectionUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectorId?: StringFieldUpdateOperationsInput | string
    inspectionDate?: DateTimeFieldUpdateOperationsInput | Date | string
    structuralCondition?: StringFieldUpdateOperationsInput | string
    crackSeverity?: StringFieldUpdateOperationsInput | string
    corrosionLevel?: StringFieldUpdateOperationsInput | string
    trafficImportance?: StringFieldUpdateOperationsInput | string
    hospitalRoute?: BoolFieldUpdateOperationsInput | boolean
    weatherRisk?: StringFieldUpdateOperationsInput | string
    heavyRainExpected?: BoolFieldUpdateOperationsInput | boolean
    estimatedDailyUsers?: NullableIntFieldUpdateOperationsInput | number | null
    inspectionNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskAssessmentUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inspection?: InspectionUpdateOneRequiredWithoutRiskAssessmentsNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    inspectionId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalResponsePlanUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    riskAssessment?: RiskAssessmentUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
    decisions?: OrpDecisionUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskAssessmentId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskAssessmentId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orp?: OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput
    reviewer?: UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput
    authorityGrant?: ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput
    forwardedUser?: UserUpdateOneWithoutForwardedOrpDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskAssessmentCreateManyInspectionInput = {
    id?: string
    caseId: string
    riskScore: number
    riskLevel: $Enums.RiskLevel
    priorityLevel: $Enums.PriorityLevel
    reasonCodes: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    assessmentVersion?: string
    createdAt?: Date | string
  }

  export type RiskAssessmentUpdateWithoutInspectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutRiskAssessmentsNestedInput
    operationalResponsePlans?: OperationalResponsePlanUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentUncheckedUpdateWithoutInspectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    operationalResponsePlans?: OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentNestedInput
  }

  export type RiskAssessmentUncheckedUpdateManyWithoutInspectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    riskScore?: IntFieldUpdateOperationsInput | number
    riskLevel?: EnumRiskLevelFieldUpdateOperationsInput | $Enums.RiskLevel
    priorityLevel?: EnumPriorityLevelFieldUpdateOperationsInput | $Enums.PriorityLevel
    reasonCodes?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    assessmentVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OperationalResponsePlanCreateManyRiskAssessmentInput = {
    id?: string
    caseId: string
    versionNumber: number
    status?: string
    urgency: string
    recommendedActionCodes: JsonNullValueInput | InputJsonValue
    temporaryMeasures: JsonNullValueInput | InputJsonValue
    reasons: JsonNullValueInput | InputJsonValue
    alternativeActionCodes: JsonNullValueInput | InputJsonValue
    planVersion?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OperationalResponsePlanUpdateWithoutRiskAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOperationalResponsePlansNestedInput
    decisions?: OrpDecisionUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateWithoutRiskAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: OrpDecisionUncheckedUpdateManyWithoutOrpNestedInput
  }

  export type OperationalResponsePlanUncheckedUpdateManyWithoutRiskAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    versionNumber?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    urgency?: StringFieldUpdateOperationsInput | string
    recommendedActionCodes?: JsonNullValueInput | InputJsonValue
    temporaryMeasures?: JsonNullValueInput | InputJsonValue
    reasons?: JsonNullValueInput | InputJsonValue
    alternativeActionCodes?: JsonNullValueInput | InputJsonValue
    planVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionCreateManyOrpInput = {
    id?: string
    caseId: string
    reviewerId: string
    authorityGrantId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionUpdateWithoutOrpInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput
    reviewer?: UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput
    authorityGrant?: ApprovalAuthorityUpdateOneRequiredWithoutDecisionsNestedInput
    forwardedUser?: UserUpdateOneWithoutForwardedOrpDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateWithoutOrpInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyWithoutOrpInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    authorityGrantId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionCreateManyAuthorityGrantInput = {
    id?: string
    caseId: string
    orpId: string
    reviewerId: string
    decisionType: $Enums.OrpDecisionType
    reason?: string | null
    remarks?: string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: string | null
    createdAt?: Date | string
  }

  export type OrpDecisionUpdateWithoutAuthorityGrantInput = {
    id?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: CaseUpdateOneRequiredWithoutOrpDecisionsNestedInput
    orp?: OperationalResponsePlanUpdateOneRequiredWithoutDecisionsNestedInput
    reviewer?: UserUpdateOneRequiredWithoutReviewedOrpDecisionsNestedInput
    forwardedUser?: UserUpdateOneWithoutForwardedOrpDecisionsNestedInput
  }

  export type OrpDecisionUncheckedUpdateWithoutAuthorityGrantInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrpDecisionUncheckedUpdateManyWithoutAuthorityGrantInput = {
    id?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    orpId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    decisionType?: EnumOrpDecisionTypeFieldUpdateOperationsInput | $Enums.OrpDecisionType
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    remarks?: NullableStringFieldUpdateOperationsInput | string | null
    requestedChanges?: NullableJsonNullValueInput | InputJsonValue
    forwardToUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}