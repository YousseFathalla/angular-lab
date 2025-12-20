import { computed, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import {
  collection,
  collectionGroup,
  DocumentData,
  Firestore,
  getCountFromServer,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  where,
  getDocs,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import { runInContextHelper$ } from '@shared/utilities/runInInjection-factory';
import {
  CursorDoc,
  PaginationConfig,
  PaginationDirection,
  PaginationServiceInterface,
  PaginationState,
  WhereClause,
} from '@shared/types/pagination.types';
import { LoggerService } from '@shared/services/logger/logger.service';

export class PaginationService<T extends DocumentData> implements PaginationServiceInterface<T> {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private logger = inject(LoggerService);
  private runWithContext = runInContextHelper$();

  // * Collection path and configuration
  private config: Required<PaginationConfig> & { useCollectionGroup: boolean } = {
    collectionPath: '',
    limit: 10,
    orderBy: [{ field: 'updatedAt', direction: 'desc' }],
    where: [],
    useCollectionGroup: false,
  };

  // * Signal-based state
  private _state = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    cursors: new Map<number, CursorDoc>(),
    isLoading: false,
    error: null,
    hasMore: true,
  });

  // * Items signal
  private _items = signal<T[]>([]);

  // * Flag to prevent duplicate count queries
  private _isUpdatingCount = false;

  // * Public computed signals
  readonly state = this._state.asReadonly();
  readonly items = this._items.asReadonly();
  readonly currentPage = computed(() => this._state().page);
  readonly totalPages = computed(() => {
    const { total, limit } = this._state();
    return Math.ceil(total / limit) || 1;
  });
  readonly hasNextPage = computed(() => this._state().hasMore);
  readonly hasPreviousPage = computed(() => this._state().page > 1);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);
  readonly total = computed(() => this._state().total);

  // * Initialize the pagination service for a specific collection
  initialize(config: PaginationConfig): void {
    this.config = {
      collectionPath: config.collectionPath,
      limit: config.limit ?? 10,
      orderBy: config.orderBy ?? [{ field: 'updatedAt', direction: 'desc' }],
      where: config.where ?? [],
      useCollectionGroup: config.useCollectionGroup ?? false,
    };

    this._state.update((state) => ({
      ...state,
      limit: this.config.limit,
    }));
  }

  // * Load a page based on direction
  async loadPage(direction: PaginationDirection): Promise<void> {
    this._state.update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      let targetPage = this._state().page;

      switch (direction) {
        case 'next':
          targetPage = this._state().page + 1;
          break;
        case 'prev':
          targetPage = Math.max(1, this._state().page - 1);
          break;
        case 'first':
          // Clear cursors when going to first page
          this._state.update((state) => ({
            ...state,
            cursors: new Map(),
          }));
          targetPage = 1;
          break;
        case 'last':
          // Optimized: Use reverse pagination to fetch last page in a single request
          // Instead of making N sequential requests, reverse the order and get the first page
          const totalPages = this.totalPages();
          if (totalPages > 1) {
            await this.fetchLastPageOptimized();
            return;
          } else {
            targetPage = 1;
          }
          break;
      }

      await this.fetchPage(targetPage);
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to load page',
        isLoading: false,
      }));
    }
  }


  // * Change page size
  async setPageSize(limit: number): Promise<void> {
    this.config.limit = limit;
    this._state.update((state) => ({
      ...state,
      limit,
      page: 1,
      cursors: new Map(),
    }));

    await this.refresh();
  }
  // * Set query
  async setQuery(where: WhereClause[], orderBy: { field: string; direction: 'asc' | 'desc' }[]): Promise<void> {
    // 1. Update the internal config
    this.config.where = where ?? [];
    this.config.orderBy = orderBy ?? [{ field: 'updatedAt', direction: 'desc' }];

    // 2. Reset state to page 1
    this._state.update((state) => ({
      ...state,
      page: 1,
      cursors: new Map(),
      total: 0, // Force total count to reload
    }));

    // 3. Refresh (fetches page 1 with new query and new total)
    await this.refresh();
  }
  // * Set filter
  async setFilter(where: WhereClause[]): Promise<void> {
    // It just calls the main function, keeping the *current* sort order
    await this.setQuery(where, this.config.orderBy);
  }

  // * Refresh current page
  async refresh(): Promise<void> {
    const currentPage = this._state().page;
    this._state.update((state) => ({
      ...state,
      cursors: new Map(),
      isLoading: true,
      error: null,
    }));

    try {
      const [pageResult] = await Promise.all([
        this.fetchPageData(currentPage),
        this.updateTotalCount(true),
      ]);

      if (pageResult.lastDoc) {
        this.storeCursor(currentPage, pageResult.lastDoc);
      }

      this._items.set(pageResult.items);
      this.ensureTotalFloor(
        currentPage,
        this._state().limit,
        pageResult.items.length,
        pageResult.hasMore
      );
      this._state.update((state) => ({
        ...state,
        page: currentPage,
        hasMore: pageResult.hasMore,
        isLoading: false,
      }));
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh',
      }));
      throw error;
    }
  }

  // * Reset pagination to initial state and load first page
  async reset(): Promise<void> {
    this._state.set({
      page: 1,
      limit: this.config.limit,
      total: 0,
      cursors: new Map(),
      isLoading: true,
      error: null,
      hasMore: true,
    });
    this._items.set([]);

    try {
      const [pageResult] = await Promise.all([
        this.fetchPageData(1),
        this.updateTotalCount(true),
      ]);

      if (pageResult.lastDoc) {
        this.storeCursor(1, pageResult.lastDoc);
      }

      this._items.set(pageResult.items);
      this._state.update((state) => ({
        ...state,
        hasMore: pageResult.hasMore,
        isLoading: false,
      }));
    } catch (error) {
      this._state.update((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset pagination',
      }));
      throw error;
    }
  }

  // * Update total count from Firestore
  // * Prevents duplicate concurrent count queries
  async updateTotalCount(force: boolean = false): Promise<void> {
    // Skip if count query is already in progress
    if (this._isUpdatingCount) {
      return;
    }

    // Skip if total is already set (unless forced refresh)
    const currentTotal = this._state().total;
    if (currentTotal > 0 && !force) {
      return;
    }

    try {
      this._isUpdatingCount = true;
      const count = await firstValueFrom(this.getTotalCount$(this.config.collectionPath));
      this._state.update((state) => ({ ...state, total: count }));
    } catch (error) {
      this.logger.error('Failed to update total count', error);
    } finally {
      this._isUpdatingCount = false;
    }
  }

  // * Get total count observable
  private getTotalCount$(collectionPath: string): Observable<number> {
    return this.runWithContext(() => {
      const collectionRef = this.config.useCollectionGroup
        ? this.withInjection(() => collectionGroup(this.firestore, collectionPath))
        : this.withInjection(() => collection(this.firestore, collectionPath));
      const constraints = this.buildWhereConstraints();
      const q = constraints.length > 0
        ? this.withInjection(() => query(collectionRef, ...constraints))
        : collectionRef;
      return this.runWithInjection(() => getCountFromServer(q));
    }, `Failed to get total count for ${collectionPath}`).pipe(map((snapshot) => snapshot.data().count));
  }

  private async fetchPageData(targetPage: number): Promise<{
    items: T[];
    hasMore: boolean;
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    const snapshot = await firstValueFrom(
      this.runWithContext(() => {
        const collectionRef = this.config.useCollectionGroup
          ? this.withInjection(() => collectionGroup(this.firestore, this.config.collectionPath))
          : this.withInjection(() => collection(this.firestore, this.config.collectionPath));
        const constraints: QueryConstraint[] = [];

        // Add where constraints
        constraints.push(...this.buildWhereConstraints());

        // Add orderBy constraints
        this.config.orderBy.forEach((order) => {
          constraints.push(orderBy(order.field, order.direction));
        });

        // Add cursor for pagination (skip if page 1)
        if (targetPage > 1) {
          const cursor = this._state().cursors.get(targetPage - 1);
          if (cursor && cursor.snapshot) {
            constraints.push(startAfter(cursor.snapshot));
          }
        }

        constraints.push(limit(this._state().limit));

        const q = this.withInjection(() => query(collectionRef, ...constraints));

        return this.runWithInjection(() => getDocs(q));
      }, `Failed to fetch page ${targetPage}`)
    );

    const items = snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          uid: doc.id,
        } as unknown as T)
    );

    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    const hasMore = snapshot.docs.length === this._state().limit;

    return { items, hasMore, lastDoc };
  }

  // * Fetch a specific page of data and commit to state
  private async fetchPage(targetPage: number, setLoadingToFalse: boolean = true): Promise<void> {
    try {
      const { items, hasMore, lastDoc } = await this.fetchPageData(targetPage);

      if (lastDoc) {
        this.storeCursor(targetPage, lastDoc);
      }

      // Update total count if not set (only when called directly, not from refresh)
      // Wait for it to complete before setting loading to false
      if (this._state().total === 0 && setLoadingToFalse) {
        await this.updateTotalCount();
      }

      this._items.set(items);
      this.ensureTotalFloor(
        targetPage,
        this._state().limit,
        items.length,
        hasMore
      );

      // Set loading to false after both data fetch and total count are complete
      this._state.update((state) => ({
        ...state,
        page: targetPage,
        hasMore,
        isLoading: setLoadingToFalse ? false : state.isLoading,
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch page');
    }
  }

  // * Build where constraints from config
  private buildWhereConstraints(): QueryConstraint[] {
    return this.config.where.map((w) => where(w.field, w.operator, w.value));
  }

  // * Store cursor for a page
  private storeCursor(page: number, doc: QueryDocumentSnapshot<DocumentData>): void {
    const cursor: CursorDoc = {
      snapshot: doc,
    };

    this._state.update((state) => {
      const cursors = new Map(state.cursors);
      cursors.set(page, cursor);
      return { ...state, cursors };
    });
  }

  // * Fetch last page using reverse pagination (optimized - single request)
  private async fetchLastPageOptimized(): Promise<void> {
    try {
      // Reverse the order direction to query from the end
      const reversedOrderBy = this.config.orderBy.map((order) => ({
        field: order.field,
        direction: order.direction === 'asc' ? 'desc' : 'asc' as 'asc' | 'desc',
      }));

      const snapshot = await firstValueFrom(
        this.runWithContext(() => {
          const collectionRef = this.config.useCollectionGroup
            ? this.withInjection(() => collectionGroup(this.firestore, this.config.collectionPath))
            : this.withInjection(() => collection(this.firestore, this.config.collectionPath));
          const constraints: QueryConstraint[] = [];

          // Add where constraints
          constraints.push(...this.buildWhereConstraints());

          // Add reversed orderBy constraints
          reversedOrderBy.forEach((order) => {
            constraints.push(orderBy(order.field, order.direction));
          });

          // Add limit (get first page of reversed order = last page of original order)
          constraints.push(limit(this._state().limit));

          const q = this.withInjection(() => query(collectionRef, ...constraints));
          return this.runWithInjection(() => getDocs(q));
        }, `Failed to fetch last page`)
      );

      // Reverse the results to match the original order
      const reversedDocs = [...snapshot.docs].reverse();

      const items = reversedDocs.map(
        (doc) =>
          ({
            ...doc.data(),
            uid: doc.id,
          } as unknown as T)
      );

      // Ensure total count is updated before calculating totalPages
      // This guarantees the computed signal has the correct value
      await this.updateTotalCount();

      // Calculate totalPages after total count is guaranteed to be updated
      const totalPages = this.totalPages();

      // Store cursor for potential next page (though there shouldn't be one on last page)
      if (reversedDocs.length > 0) {
        const lastDoc = reversedDocs[reversedDocs.length - 1];
        this.storeCursor(totalPages, lastDoc);
      }

      this._items.set(items);

      // Update state with the correct page number
      this._state.update((state) => ({
        ...state,
        page: totalPages,
        hasMore: false, // Always false on the last page
        isLoading: false,
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch last page');
    }
  }

  private withInjection<T>(operation: () => T): T {
    return runInInjectionContext(this.injector, operation);
  }

  private runWithInjection<T>(operation: () => Promise<T> | T): Promise<T> {
    return Promise.resolve(runInInjectionContext(this.injector, operation));
  }

  private ensureTotalFloor(page: number, limit: number, itemsLength: number, hasMore: boolean): void {
    const base = (page - 1) * limit + itemsLength;
    const minimumTotal = hasMore ? base + 1 : base;

    this._state.update((state) => {
      if (state.total >= minimumTotal) {
        return state;
      }
      return { ...state, total: minimumTotal };
    });
  }
}
