let baseUrl = '';

export function setAssetBase(url: string) {
  baseUrl = url.replace(/\/$/, '');
}

export function resolveAsset(scenarioId: string, relativePath: string): string {
  if (baseUrl) {
    return `${baseUrl}/${relativePath}`;
  }
  return `/scenarios/${scenarioId}/${relativePath}`;
}
