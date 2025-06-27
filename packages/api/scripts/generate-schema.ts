// scripts/generate-schema.ts
import fs from "fs";
import path from "path";
import { printSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Modules } from "../src/modules";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the schema from your modules, same as in your server.ts
const schema = makeExecutableSchema({
  typeDefs: Modules.map((module) => module.types),
  resolvers: Modules.map((module) => module.resolvers),
});

// Convert the schema to string representation
const schemaString = printSchema(schema);

// Write to file
const outputPath = path.join(__dirname, "../../web/schema.graphql");
fs.writeFileSync(outputPath, schemaString);

console.log(`Schema generated at ${outputPath}`);
