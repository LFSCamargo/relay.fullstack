/* eslint-disable @typescript-eslint/no-explicit-any */
import { cursorToOffset, offsetToCursor } from "graphql-relay";
import { SelectQueryBuilder } from "kysely";
import { Connection, Edge, PageInfo } from "../types/graphql.types";

// Define TypeScript types for the Connection pattern

/**
 * Paginate a Kysely query builder according to Relay's cursor-based spec.
 * Supports `first`/`after` for forward pagination and `last`/`before` for backward pagination:contentReference[oaicite:2]{index=2}.
 *
 * @param query - A Kysely SelectQueryBuilder for the base query (without pagination applied).
 * @param args  - Relay pagination args: first, after, last, before.
 * @returns A Promise resolving to a Connection object with edges, nodes, and pageInfo.
 */
export async function createGraphQLRelayConnection<Type>(
  query: SelectQueryBuilder<any, any, Type>,
  args: { first?: number; last?: number; before?: string; after?: string },
): Promise<Connection<Type>> {
  const { first, last, before, after } = args;

  // Validate that a valid combination of pagination arguments is provided
  if (first == null && last == null) {
    throw new Error(
      "You must provide a 'first' or 'last' value for pagination.",
    );
  }
  if (first != null && last != null) {
    // Having both is discouraged by the Relay spec:contentReference[oaicite:3]{index=3}
    throw new Error("Provide either 'first' or 'last', not both.");
  }

  // Decode the cursors to numeric offsets (using graphql-relay helpers)
  const afterOffset = after ? cursorToOffset(after) : -1;
  let beforeOffset: number;
  let totalCount: number | undefined;

  if (before) {
    // Decode 'before' cursor to get the index of the item to exclude
    beforeOffset = cursorToOffset(before);
  } else {
    // No 'before' provided, treat end of list as the boundary.
    // We need the total count of results to define the end index.
    const countQuery = query
      .clearSelect() // remove selected columns:contentReference[oaicite:4]{index=4}
      .clearOrderBy() // remove ordering, not needed for counting:contentReference[oaicite:5]{index=5}
      .select((eb) => eb.fn.countAll().as("count"));
    const countResult = await countQuery.executeTakeFirst();
    totalCount = Number(countResult?.count ?? 0);
    beforeOffset = totalCount;
  }

  // Determine the slice of items to fetch (start index inclusive, end index exclusive)
  let startIndex = afterOffset + 1; // start after the `after` cursor
  let endIndex = beforeOffset; // end before the `before` cursor
  if (startIndex < 0) startIndex = 0;
  if (endIndex < startIndex) endIndex = startIndex;

  // Apply forward pagination (first N results after `after`)
  if (first != null) {
    if (first < 0) {
      throw new Error("'first' must be a non-negative integer");
    }
    const maxEndIndex = startIndex + first;
    if (maxEndIndex < endIndex) {
      endIndex = maxEndIndex; // limit to at most `first` items
    }
  }

  // Apply backward pagination (last N results before `before`)
  if (last != null) {
    if (last < 0) {
      throw new Error("'last' must be a non-negative integer");
    }
    // If no 'before' was provided, we should have totalCount from above to calculate the tail of the list
    if (!before) {
      if (totalCount === undefined) {
        const countQuery = query
          .clearSelect()
          .clearOrderBy()
          .select((eb) => eb.fn.countAll().as("count"));
        const countResult = await countQuery.executeTakeFirst();
        totalCount = Number(countResult?.count ?? 0);
      }
      // `beforeOffset` was set to totalCount in this case
    }
    const available = endIndex - startIndex;
    if (last < available) {
      // Take the last N items from the [startIndex, endIndex) range
      startIndex = endIndex - last;
      if (startIndex < 0) startIndex = 0;
    }
  }

  // Fetch the slice of data from the database using LIMIT/OFFSET
  const sliceCount = endIndex - startIndex;
  const nodes: Type[] =
    sliceCount > 0
      ? await query.offset(startIndex).limit(sliceCount).execute()
      : [];

  // Create edges for each node, including an opaque cursor
  const edges: Edge<Type>[] = nodes.map((node, idx) => {
    const cursor = offsetToCursor(startIndex + idx);
    return { node, cursor };
  });

  // Derive start and end cursors from the edges
  const startCursor = edges.length > 0 ? edges[0].cursor : null;
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  // Determine if there are more items before or after the returned slice
  if (totalCount === undefined) {
    // Compute totalCount if not done already (e.g., when 'before' was provided)
    const countQuery = query
      .clearSelect()
      .clearOrderBy()
      .select((eb) => eb.fn.countAll().as("count"));
    const countResult = await countQuery.executeTakeFirst();
    totalCount = Number(countResult?.count ?? 0);
  }
  const hasPreviousPage = startIndex > 0;
  const hasNextPage = endIndex < (totalCount ?? 0);

  const pageInfo: PageInfo = {
    startCursor,
    endCursor,
    hasPreviousPage,
    hasNextPage,
  };

  return { edges, pageInfo };
}
