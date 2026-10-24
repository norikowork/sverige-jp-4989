// Klivのサーバーが自動でリサイズ・WebP変換してくれる画像URLを組み立てるヘルパー。
// 対象は /content/... 配下の画像のみ(アップロード画像・テンプレート画像)。
// SVGや外部サイトの画像はリサイズ対象外。
const SUPPORTED_WIDTHS = [160, 320, 640, 960, 1280, 1920, 2560];

export const isResizableImageUrl = (url?: string | null): boolean => {
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return false;
  if (!url.startsWith('/content/')) return false;
  if (url.toLowerCase().endsWith('.svg')) return false;
  return true;
};

// 指定した幅以上で最小の対応幅に切り上げる
const roundUpWidth = (width: number): number => {
  return SUPPORTED_WIDTHS.find((w) => w >= width) || SUPPORTED_WIDTHS[SUPPORTED_WIDTHS.length - 1];
};

export const resizedImageUrl = (url: string, width: number): string => {
  if (!isResizableImageUrl(url)) return url;
  const w = roundUpWidth(width);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${w}`;
};

export const imageSrcSet = (url: string, widths: number[] = [320, 640, 1280]): string | undefined => {
  if (!isResizableImageUrl(url)) return undefined;
  return widths.map((w) => `${resizedImageUrl(url, w)} ${roundUpWidth(w)}w`).join(', ');
};
