export const HealthTypes = `#graphql
  type HealthOutput {
    message: String
  }

  type Query {
    healthCheck: HealthOutput
  }
`;
