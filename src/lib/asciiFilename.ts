// LINE/Facebookなどのリンクプレビュー用クローラーは、日本語(マルチバイト)や
// 半角スペースを含む画像URLを取りこぼすことがある。
// そのためアップロード時点でファイル名をASCII英数字のみの安全な名前に変換する。

const SAFE_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** 既に安全なASCII名かどうか(英数字・ドット・ハイフン・アンダースコアのみ) */
export function isSafeAsciiName(name: string): boolean {
  return name.length <= 100 && SAFE_NAME_RE.test(name);
}

/**
 * 元のファイル名から安全なASCIIファイル名を生成する。
 * 拡張子(png/jpg等のASCII)は可能な限り保持し、
 * 名前部分は「prefix-タイムスタンプ-乱数」で一意にする。
 */
export function buildAsciiFileName(originalName: string, prefix = 'img'): string {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(originalName);
  const ext = m ? m[1].toLowerCase() : 'png';
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${rand}.${ext}`;
}

/**
 * ファイル名が安全なASCII名ならそのまま、
 * 日本語・スペース等を含む場合は同じ内容でASCII名の新しいFileを返す。
 */
export function toAsciiFile(file: File, prefix = 'img'): File {
  if (isSafeAsciiName(file.name)) return file;
  return new File([file], buildAsciiFileName(file.name, prefix), {
    type: file.type || 'image/png',
  });
}
