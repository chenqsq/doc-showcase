export function makeCatalogItemId(relativePath: string) {
  let hash = 2166136261;

  for (let index = 0; index < relativePath.length; index += 1) {
    hash ^= relativePath.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `r${(hash >>> 0).toString(36)}`;
}
