import { type PubSub } from "graphql-subscriptions";
import { type Request } from "express";

export type GraphQLContext = {
  user?: {
    id: number;
    name: string;
    email: string;
    password: string;
    picture: string | null;
    created_at: Date;
  } | null;
  pubsub?: PubSub;
  req: Request;
};

export interface Edge<T> {
  node: T;
  cursor: string;
}
export interface PageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}
