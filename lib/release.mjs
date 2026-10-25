const SOURCE = process.env.RELEASE_REPOSITORY || "cybereun/J-Dir";
let cached,
  until = 0;
export function selectRelease(data) {
  if (
    data.draft ||
    data.prerelease ||
    !/^v?\d+\.\d+\.\d+(?:[.-][\w.-]+)?$/.test(data.tag_name || "")
  )
    throw new Error("Invalid release");
  const version = data.tag_name.replace(/^v/, "");
  const asset = data.assets?.find(
    (a) =>
      a.state === "uploaded" &&
      a.name === `J-Dir_${version}_x64-setup.exe` &&
      a.size > 0,
  );
  if (!asset) throw new Error("Installer unavailable");
  const url = new URL(asset.browser_download_url);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    !url.pathname.startsWith(`/${SOURCE}/releases/download/`)
  )
    throw new Error("Invalid asset");
  return {
    version,
    name: asset.name,
    size: asset.size,
    published: data.published_at,
    digest: /^sha256:[a-f0-9]{64}$/.test(asset.digest || "")
      ? asset.digest
      : null,
    url: url.href,
  };
}
export async function latestRelease() {
  if (cached && Date.now() < until) return cached;
  const response = await fetch(
    `https://api.github.com/repos/${SOURCE}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "J-Dir-Download",
        ...(process.env.RELEASE_TOKEN
          ? { Authorization: `Bearer ${process.env.RELEASE_TOKEN}` }
          : {}),
      },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error("Release unavailable");
  cached = selectRelease(await response.json());
  until = Date.now() + 60000;
  return cached;
}
export function publicRelease({ url, ...release }) {
  return { ...release, download: "/api/download" };
}
