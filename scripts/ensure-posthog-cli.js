// @posthog/cli ships as a wrapper that downloads its Rust binary from a GitHub
// release via Node's https (HTTP/1.1 only). Some networks reset HTTP/1.1
// connections to github.com, which breaks both the package postinstall and the
// runtime download triggered from the Xcode build phase ("socket hang up").
// curl negotiates HTTP/2 and works, so this script falls back to it.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const pkgDir = path.join(__dirname, "..", "node_modules", "@posthog", "cli");
const binaryPath = path.join(pkgDir, "node_modules", ".bin_real", "posthog-cli");

if (fs.existsSync(binaryPath)) {
  process.exit(0);
}

// posthog-xcode.sh checks ~/.posthog/posthog-cli before node_modules, so a
// user-level install covers the Xcode phase even without the project binary.
const home = process.env.HOME;
const homeBinaryPath = home ? path.join(home, ".posthog", "posthog-cli") : null;
if (homeBinaryPath && fs.existsSync(homeBinaryPath)) {
  process.exit(0);
}

const { artifactDownloadUrls } = require(path.join(pkgDir, "package.json"));

const artifacts = {
  "darwin-arm64": "posthog-cli-aarch64-apple-darwin.tar.gz",
  "darwin-x64": "posthog-cli-x86_64-apple-darwin.tar.gz",
  "linux-x64": "posthog-cli-x86_64-unknown-linux-gnu.tar.gz",
  "linux-arm64": "posthog-cli-aarch64-unknown-linux-gnu.tar.gz",
};

const key = `${process.platform}-${process.arch}`;
const artifact = artifacts[key];
if (!artifact) {
  console.error(`ensure-posthog-cli: no artifact for ${key}`);
  process.exit(1);
}

const url = `${artifactDownloadUrls[0].replace(/\/$/, "")}/${artifact}`;
console.log(`ensure-posthog-cli: downloading ${url}`);

const tmpDir = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "posthog-cli-"));
const tarball = path.join(tmpDir, artifact);

const curl = spawnSync(
  "curl",
  [
    "-fsSL",
    "--retry", "10",
    "--retry-all-errors",
    "--retry-delay", "3",
    "--retry-max-time", "300",
    "--connect-timeout", "30",
    "-o", tarball,
    url,
  ],
  { stdio: "inherit" },
);
if (curl.status !== 0) {
  console.error(`ensure-posthog-cli: curl failed with exit code ${curl.status}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(binaryPath), { recursive: true });
const tar = spawnSync(
  "tar",
  ["xzf", tarball, "--strip-components", "1", "-C", path.dirname(binaryPath)],
  { stdio: "inherit" },
);
fs.rmSync(tmpDir, { recursive: true, force: true });

if (tar.status !== 0 || !fs.existsSync(binaryPath)) {
  console.error("ensure-posthog-cli: extraction failed");
  process.exit(1);
}

console.log("ensure-posthog-cli: binary installed");
