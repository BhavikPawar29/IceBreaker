import { useEffect } from "react";
import { buildAbsoluteUrl } from "../utils/seo";

const DEFAULT_IMAGE_PATH = "/icon.png";
const DEFAULT_SITE_NAME = "Breaking Ice";
const DEFAULT_TITLE = "Breaking Ice";
const DEFAULT_DESCRIPTION =
  "Instant conversation lines for awkward moments, dates, new friends, and group chats.";
const DEFAULT_TYPE = "website";

function setMetaAttribute(selector, attributeName, value) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    const [selectorName, rawSelectorValue] = selector
      .replace("meta[", "")
      .replace("]", "")
      .split("=");
    element.setAttribute(selectorName, rawSelectorValue.replace(/"/g, ""));
    document.head.appendChild(element);
  }

  element.setAttribute(attributeName, value);
}

function setLinkAttribute(selector, attributeName, value) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    const [selectorName, rawSelectorValue] = selector
      .replace("link[", "")
      .replace("]", "")
      .split("=");
    element.setAttribute(selectorName, rawSelectorValue.replace(/"/g, ""));
    document.head.appendChild(element);
  }

  element.setAttribute(attributeName, value);
}

function normalizeTitle(title) {
  return title?.trim() || DEFAULT_TITLE;
}

function normalizeDescription(description) {
  return description?.trim() || DEFAULT_DESCRIPTION;
}

function Seo({
  canonicalPath = "/",
  description = DEFAULT_DESCRIPTION,
  imagePath = DEFAULT_IMAGE_PATH,
  robots = "index,follow",
  title = DEFAULT_TITLE,
  type = DEFAULT_TYPE,
}) {
  useEffect(() => {
    const nextTitle = normalizeTitle(title);
    const nextDescription = normalizeDescription(description);
    const canonicalUrl = buildAbsoluteUrl(canonicalPath);
    const imageUrl = buildAbsoluteUrl(imagePath);

    document.title = nextTitle;
    setMetaAttribute('meta[name="description"]', "content", nextDescription);
    setMetaAttribute('meta[name="robots"]', "content", robots);
    setLinkAttribute('link[rel="canonical"]', "href", canonicalUrl);

    setMetaAttribute('meta[property="og:type"]', "content", type);
    setMetaAttribute('meta[property="og:title"]', "content", nextTitle);
    setMetaAttribute(
      'meta[property="og:description"]',
      "content",
      nextDescription,
    );
    setMetaAttribute('meta[property="og:url"]', "content", canonicalUrl);
    setMetaAttribute(
      'meta[property="og:site_name"]',
      "content",
      DEFAULT_SITE_NAME,
    );
    setMetaAttribute('meta[property="og:image"]', "content", imageUrl);

    setMetaAttribute(
      'meta[name="twitter:card"]',
      "content",
      "summary_large_image",
    );
    setMetaAttribute('meta[name="twitter:title"]', "content", nextTitle);
    setMetaAttribute(
      'meta[name="twitter:description"]',
      "content",
      nextDescription,
    );
    setMetaAttribute('meta[name="twitter:image"]', "content", imageUrl);
  }, [canonicalPath, description, imagePath, robots, title, type]);

  return null;
}

export default Seo;
