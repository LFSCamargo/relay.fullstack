import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { createTestUser } from "../../test/create-test-user";
import { cleanupDb } from "../../test/cleanup-db";
import { createGraphQLRelayConnection } from "../connection.utils";
import { db } from "../../db";
import { cursorToOffset, offsetToCursor } from "graphql-relay";

describe("Connection Utils", () => {
  // Create 10 test users for pagination testing
  const TEST_USERS = Array.from({ length: 10 }, (_, i) => ({
    email: `test-user-${i}@example.com`,
    password: "Password123!",
    name: `Test User ${i}`,
  }));

  beforeAll(async () => {
    // Clean the database and create test users
    await cleanupDb();

    // Create all test users sequentially
    for (const user of TEST_USERS) {
      await createTestUser(user.email, user.password, user.name);
    }
  });

  afterAll(async () => {
    // Clean up after tests
    await cleanupDb();
  });

  test("should return first N users with forward pagination", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Get first 3 users
    const connection = await createGraphQLRelayConnection(query, { first: 3 });

    // Assertions
    expect(connection.edges).toHaveLength(3);
    expect(connection.pageInfo.hasNextPage).toBe(true);
    expect(connection.pageInfo.hasPreviousPage).toBe(false);
    expect(connection.pageInfo.startCursor).not.toBeNull();
    expect(connection.pageInfo.endCursor).not.toBeNull();

    // Check user data
    expect(connection.edges[0].node.name).toBe(TEST_USERS[0].name);
    expect(connection.edges[1].node.name).toBe(TEST_USERS[1].name);
    expect(connection.edges[2].node.name).toBe(TEST_USERS[2].name);
  });

  test("should navigate forward with after cursor", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Get first 2 users to get a cursor
    const firstConnection = await createGraphQLRelayConnection(query, {
      first: 2,
    });

    // Get next 3 users after the second user
    const afterCursor = firstConnection.pageInfo.endCursor!;
    const nextConnection = await createGraphQLRelayConnection(query, {
      first: 3,
      after: afterCursor,
    });

    // Assertions
    expect(nextConnection.edges).toHaveLength(3);
    expect(nextConnection.pageInfo.hasPreviousPage).toBe(true);
    expect(nextConnection.edges[0].node.name).toBe(TEST_USERS[2].name);
    expect(nextConnection.edges[1].node.name).toBe(TEST_USERS[3].name);
    expect(nextConnection.edges[2].node.name).toBe(TEST_USERS[4].name);
  });

  test("should return last N users with backward pagination", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Get last 3 users
    const connection = await createGraphQLRelayConnection(query, { last: 3 });

    // Assertions
    expect(connection.edges).toHaveLength(3);
    expect(connection.pageInfo.hasNextPage).toBe(false);
    expect(connection.pageInfo.hasPreviousPage).toBe(true);

    // Check that we got the last 3 users
    expect(connection.edges[0].node.name).toBe(TEST_USERS[7].name);
    expect(connection.edges[1].node.name).toBe(TEST_USERS[8].name);
    expect(connection.edges[2].node.name).toBe(TEST_USERS[9].name);
  });

  test("should navigate backward with before cursor", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Get last 2 users to get a cursor
    const lastConnection = await createGraphQLRelayConnection(query, {
      last: 2,
    });

    // Get 3 users before the second-to-last user
    const beforeCursor = lastConnection.pageInfo.startCursor!;
    const prevConnection = await createGraphQLRelayConnection(query, {
      last: 3,
      before: beforeCursor,
    });

    // Assertions
    expect(prevConnection.edges).toHaveLength(3);
    expect(prevConnection.pageInfo.hasNextPage).toBe(true);
  });

  test("should handle empty results", async () => {
    // Build a query for users with an impossible condition
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .where("email", "=", "nonexistent@example.com")
      .orderBy("id", "asc");

    // Get first 5 users (should be empty)
    const connection = await createGraphQLRelayConnection(query, { first: 5 });

    // Assertions
    expect(connection.edges).toHaveLength(0);
    expect(connection.pageInfo.hasNextPage).toBe(false);
    expect(connection.pageInfo.hasPreviousPage).toBe(false);
    expect(connection.pageInfo.startCursor).toBeNull();
    expect(connection.pageInfo.endCursor).toBeNull();
  });

  test("should throw error for missing pagination arguments", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Attempt to call without first or last
    await expect(createGraphQLRelayConnection(query, {})).rejects.toThrow(
      "You must provide a 'first' or 'last' value for pagination.",
    );
  });

  test("should throw error for negative 'first' value", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Attempt to call with negative first
    await expect(
      createGraphQLRelayConnection(query, { first: -5 }),
    ).rejects.toThrow("'first' must be a non-negative integer");
  });

  test("should throw error for negative 'last' value", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Attempt to call with negative last
    await expect(
      createGraphQLRelayConnection(query, { last: -5 }),
    ).rejects.toThrow("'last' must be a non-negative integer");
  });

  test("should throw error when both 'first' and 'last' are provided", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Attempt to call with both first and last
    await expect(
      createGraphQLRelayConnection(query, { first: 5, last: 5 }),
    ).rejects.toThrow("Provide either 'first' or 'last', not both.");
  });

  test("should handle cursor decoding and encoding correctly", async () => {
    // Build a query for users
    const query = db
      .selectFrom("user_data")
      .select(["id", "email", "name"])
      .orderBy("id", "asc");

    // Get all users and create a cursor for the middle
    const allUsers = await query.execute();
    const middleIndex = Math.floor(allUsers.length / 2);
    const middleCursor = offsetToCursor(middleIndex);

    // Get users after the middle
    const connection = await createGraphQLRelayConnection(query, {
      first: 3,
      after: middleCursor,
    });

    // Assertions for correct cursor decoding
    expect(connection.edges).toHaveLength(3);
    expect(connection.edges[0].node.name).toBe(allUsers[middleIndex + 1].name);

    // Verify the decoded offset matches what we expect
    expect(cursorToOffset(connection.edges[0].cursor)).toBe(middleIndex + 1);
  });
});
