export function getAppOrigin(requestUrl: string) {
  const url = new URL(requestUrl);
  if (url.hostname === "0.0.0.0") {
    url.hostname = "localhost";
  }
  return url.origin;
}

export function getAppUrl(requestUrl: string, path: string) {
  return new URL(path, getAppOrigin(requestUrl));
}
