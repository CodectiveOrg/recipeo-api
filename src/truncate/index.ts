import fs from "node:fs/promises";

import "dotenv/config";

import { DatabaseService } from "@/services/database.service";

import { validateEnv } from "@/utils/env.utils";

async function main(): Promise<void> {
  validateEnv();

  const databaseService = new DatabaseService();
  const isDatabaseInitialized = await databaseService.init();

  if (!isDatabaseInitialized) {
    return;
  }

  await dropAndSync(databaseService);
  await wipeFileStorage();
}

async function dropAndSync(databaseService: DatabaseService): Promise<void> {
  console.log("Starting drop and sync...");

  await databaseService.dataSource.synchronize(true);

  console.log("Drop and sync finished successfully.");
}

async function wipeFileStorage(): Promise<void> {
  console.log("Starting wipe file storage...");

  await fs.rm(process.env.FILE_STORAGE_PATH!, { recursive: true, force: true });
  await fs.mkdir(process.env.FILE_STORAGE_PATH!, { recursive: true });

  console.log("Wipe file storage finished successfully.");
}

main().then();
