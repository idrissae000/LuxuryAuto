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

  // prevent stale generated route typings from previous cached builds
  await rm(".next/types", { recursive: true, force: true });
  console.log("[prebuild] cleared stale .next/types cache");
};

run().catch((error) => {
  console.error("[prebuild] failed to resolve router conflicts", error);
  process.exit(1);
});
