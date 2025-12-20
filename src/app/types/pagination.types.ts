import { QueryDocumentSnapshot, WhereFilterOp } from '@angular/fire/firestore';

// A reusable type for the where clause
export type WhereClause = {
  field: string;
  operator: WhereFilterOp;
  value: any;
};

/**
 * A reusable type for the order by clause
 */
export type OrderByClause = {
  field: string;
  direction: 'asc' | 'desc';
};
/**
 * Initial configuration for pagination service
*/
export interface PaginationConfig {
  collectionPath: string;
  limit?: number;
  orderBy?: OrderByClause[];
  where?: WhereClause[];
  useCollectionGroup?: boolean;
}

/**
 * Cursor document interface for Firestore pagination navigation
 * Stores the last document snapshot for efficient cursor-based pagination
 */
export interface CursorDoc {
  snapshot: QueryDocumentSnapshot;
}
/**
 * Pagination state managed by signals
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  cursors: Map<number, CursorDoc>;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

/**
 * Paginated result from Firestore queries
 */
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

/**
 * Direction for pagination navigation
 */
export type PaginationDirection = 'next' | 'prev' | 'first' | 'last';

/**
 * Page change event from MatPaginator
 */
export interface PageChangeEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

/**
 * Pagination service interface for type safety
 */
export interface PaginationServiceInterface<T> {
  readonly state: () => PaginationState;
  readonly items: () => T[];
  readonly currentPage: () => number;
  readonly totalPages: () => number;
  readonly hasNextPage: () => boolean;
  readonly hasPreviousPage: () => boolean;
  readonly isLoading: () => boolean;
  readonly error: () => string | null;
  readonly total: () => number;


  setQuery(where: WhereClause[], orderBy: { field: string; direction: 'asc' | 'desc' }[]): Promise<void>;
  setFilter(where: WhereClause[]): Promise<void>;
  loadPage(direction: PaginationDirection): Promise<void>;
  setPageSize(limit: number): Promise<void>;
  refresh(): Promise<void>;
  reset(): Promise<void>;
}
