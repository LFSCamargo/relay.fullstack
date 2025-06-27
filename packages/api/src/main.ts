import { Env } from "./env";
import { createHttpServer } from "./server";
import { LoggingUtility } from "./utils/logger.utils";

async function main() {
  const { httpServer } = await createHttpServer();

  httpServer.listen(Env.PORT, () => {
    LoggingUtility.info(`Server is running at http://localhost:${Env.PORT}`);
  });
}

main();
