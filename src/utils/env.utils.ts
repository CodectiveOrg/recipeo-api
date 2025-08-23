const keys: string[] = ["DATABASE_URL", "TOKEN_SECRET", "TOKEN_KEY"];

export const validateEnv = (): void => {
  for (const key of keys) {
    if (!(key in process.env)) {
      throw new Error(`${key} does not exist in .env file.`);
    }
  }
};
