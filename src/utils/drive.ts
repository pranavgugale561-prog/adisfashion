export function convertGDriveUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // Already a data URI or Firebase Storage
  if (url.startsWith('data:')) return url;
  if (url.includes('firebasestorage.googleapis.com')) return url;
        // Already a working thumbnail URL — upgrade resolution to s3000 if it has sz=
        if (url.includes('drive.google.com/thumbnail')) {
            return url.replace(/sz=[^&]+/, 'sz=s3000');
        }
  if (url.includes('drive.usercontent.google.com/download')) return url;

  // Extract Google Drive file ID from various link formats
  const driveRegex = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /file\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (let reg of driveRegex) {
    const match = url.match(reg);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=s3000`;
    }
  }
  
  // Old lh3 format
  if (url.includes('lh3.googleusercontent.com')) return url;
  
  return url;
}

export function parseImageLinks(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/(?:\\n|\n|,|\s)+/)
    .map((url) => convertGDriveUrl(url.trim()))
    .filter((url): url is string => Boolean(url));
}
