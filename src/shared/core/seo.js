const DEFAULT_SITE_URL = "https://breaking-ice.pages.dev";

function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  return DEFAULT_SITE_URL;
}

function buildAbsoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();

  try {
    return new URL(path, `${siteUrl}/`).toString();
  } catch {
    return siteUrl;
  }
}

export { buildAbsoluteUrl, getSiteUrl };
