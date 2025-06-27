import { healthCheck } from "./queries";

export const HealthResolvers = {
  Query: {
    healthCheck,
  },
};
