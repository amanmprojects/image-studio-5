/** True while `next build` is collecting page data (no DB / env required). */
export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
