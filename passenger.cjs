// cPanel/Passenger-friendly bootstrap that can load ESM entrypoints.
(async () => {
  await import("./server/index.js");
})().catch((error) => {
  console.error("[bootstrap] failed to start application:", error);
  process.exit(1);
});
