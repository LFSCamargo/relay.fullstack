import { GraphQLRequest } from "@apollo/server/dist/esm/externalTypes";
import { debug } from "debug";
import { IncomingHttpHeaders } from "http";

const baseWorkspace = "api";
const workspaceSeparator = ":";

export const LoggingUtility = {
  debug: (message: string) => {
    const logFn = debug(`${baseWorkspace}${workspaceSeparator}debug`);
    const timestamp = new Date().toISOString();
    logFn(message, timestamp);
  },
  info: (message: string) => {
    const logFn = debug(`${baseWorkspace}${workspaceSeparator}info`);
    const timestamp = new Date().toISOString();
    logFn(message, timestamp);
  },
  error: (message: string) => {
    const logFn = debug(`${baseWorkspace}${workspaceSeparator}error`);
    const timestamp = new Date().toISOString();
    logFn(message, timestamp);
  },

  logGraphQLRequest: (
    request: GraphQLRequest,
    headers?: IncomingHttpHeaders,
  ) => {
    const { query, variables } = request;

    const logFn = debug(`${baseWorkspace}${workspaceSeparator}info`);
    const timestamp = new Date().toISOString();
    logFn(
      `Incoming GraphQL Request: ${query} ${JSON.stringify(variables || {}, null, 2)}`,
      timestamp,
      headers,
    );
  },
};
