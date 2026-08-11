import { execFileSync } from "child_process";
import { createHash } from "crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// This file lives at either src/lib/mermaid.ts or dist/lib/mermaid.js, both
// two directories below the package root, so the relative path to the
// mermaid-cli binary is the same in either case.
const MMDC_BIN = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "node_modules",
  ".bin",
  "mmdc"
);

const CACHE_DIR = join(tmpdir(), "mdsite-mermaid-cache");
const ASSET_DIR = "/assets/mermaid";

let assets: Record<string, Buffer> = {};

export function resetMermaidAssets(): void {
  assets = {};
}

export function getMermaidAssets(): Record<string, Buffer> {
  return { ...assets };
}

export function mermaidImageTag(source: string): string {
  const hash = hashOf(source);
  const path = `${ASSET_DIR}/${hash}.svg`;
  assets[path] ??= renderMermaidToSvg(source, hash);
  return `<img src="${path}" alt="Mermaid diagram">`;
}

function renderMermaidToSvg(source: string, hash: string): Buffer {
  const cachePath = join(CACHE_DIR, `${hash}.svg`);
  if (existsSync(cachePath)) {
    return readFileSync(cachePath);
  }

  const workDir = mkdtempSync(join(tmpdir(), "mdsite-mmd-"));
  try {
    const inputPath = join(workDir, "diagram.mmd");
    const outputPath = join(workDir, "diagram.svg");
    writeFileSync(inputPath, source);
    execFileSync(MMDC_BIN, ["-q", "-i", inputPath, "-o", outputPath], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    const svg = readFileSync(outputPath);
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cachePath, svg);
    return svg;
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

function hashOf(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}
