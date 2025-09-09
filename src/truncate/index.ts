import fs from "node:fs/promises";

import "dotenv/config";

import { DatabaseService } from "@/services/database.service";

import { validateEnv } from "@/utils/env.utils";

async function main(): Promise<void> {
  validateEnv();

  console.log("Starting drop and sync...");

  const databaseService = new DatabaseService({
    synchronize: true,
    dropSchema: true,
  });

  const isDatabaseInitialized = await databaseService.init();

  if (!isDatabaseInitialized) {
    return;
  }

  console.log("Drop and sync finished successfully.");

  await wipeFileStorage();

  await databaseService.dataSource.destroy();
}

async function wipeFileStorage(): Promise<void> {
  console.log("Starting wipe file storage...");

  await fs.rm(process.env.FILE_STORAGE_PATH!, { recursive: true, force: true });
  await fs.mkdir(process.env.FILE_STORAGE_PATH!, { recursive: true });

  console.log("Wipe file storage finished successfully.");
}

main().then();
