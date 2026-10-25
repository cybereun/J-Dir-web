import test from "node:test";
import assert from "node:assert/strict";
import { selectRelease, publicRelease } from "../lib/release.mjs";
const release = (v) => ({
  tag_name: "v" + v,
  published_at: "2026-10-25T00:00:00Z",
  assets: [
    {
      name: `J-Dir_${v}_x64-setup.exe`,
      size: 100,
      state: "uploaded",
      browser_download_url: `https://github.com/cybereun/J-Dir/releases/download/v${v}/J-Dir_${v}_x64-setup.exe`,
    },
  ],
});
test("new versions select their matching installer without a site edit", () => {
  for (const v of ["1.1.7", "1.2.0", "2.0.0"])
    assert.equal(selectRelease(release(v)).version, v);
});
test("public response strips repository and upstream download URLs", () => {
  const body = JSON.stringify(publicRelease(selectRelease(release("1.2.0"))));
  assert.doesNotMatch(body, /github|cybereun/i);
  assert.match(body, /api\/download/);
});
test("missing installer never falls back to wrong version", () => {
  const r = release("1.2.0");
  r.assets[0].name = "J-Dir_1.1.7_x64-setup.exe";
  assert.throws(() => selectRelease(r));
});
test("reject preview releases and external asset hosts", () => {
  const r = release("1.2.0");
  assert.throws(() => selectRelease({ ...r, prerelease: true }));
  r.assets[0].browser_download_url = "https://example.com/setup.exe";
  assert.throws(() => selectRelease(r));
});
