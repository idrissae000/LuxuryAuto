import { rm, access } from "node:fs/promises";
import { constants } from "node:fs";

const conflicts = ["pages/api/availability.js", "pages/book.js"];

const exists = async (path) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  let removed = 0;

  for (const filePath of conflicts) {
    if (await exists(filePath)) {
      await rm(filePath, { force: true });
      removed += 1;
      console.log(`[prebuild] removed conflicting legacy route: ${filePath}`);
    }
  }

  if (removed === 0) {
    console.log("[prebuild] no legacy pages/app route conflicts found");
  }
};

run().catch((error) => {
  console.error("[prebuild] failed to resolve router conflicts", error);
  process.exit(1);
});
