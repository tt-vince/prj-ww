import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// This dir sits inside a larger checkout (git worktrees under .claude/), so
// several lockfiles / pnpm-workspace.yaml files exist above us and Next infers
// the wrong workspace root. Pin the Turbopack root to THIS project directory
// (resolved dynamically so it's correct in any checkout or worktree).
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
