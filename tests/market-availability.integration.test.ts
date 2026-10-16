import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("partial API responses preserve pricing and product eligibility independently", { skip: !process.env.TEST_DATABASE_URL }, () => {
  for (const available of ["GOLD", "SILVER", "NONE"]) {
    const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", fileURLToPath(new URL("./helpers/market-availability-scenario.ts", import.meta.url)), available], {
      encoding: "utf8", env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }, timeout: 60_000,
    });
    assert.equal(result.status, 0, `${available}: ${result.stdout}\n${result.stderr}`);
  }
});
