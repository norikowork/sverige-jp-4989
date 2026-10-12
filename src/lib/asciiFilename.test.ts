import { describe, it, expect } from 'vitest';
import { isSafeAsciiName, buildAsciiFileName, toAsciiFile } from './asciiFilename';

// @kliv-spec-derived — ユーザー意図「アップロード時に日本語ファイル名(スクリーンショット等)をASCII英数字へ自動変換する」
describe('toAsciiFile', () => {
  it('日本語+スペース入りのスクリーンショット名をASCII名に変換する', () => {
    const f = new File([new Blob(['x'])], 'スクリーンショット 2026-04-15 20.11.26.png', { type: 'image/png' });
    const out = toAsciiFile(f, 'post');
    expect(out.name).toMatch(/^post-[a-z0-9]+-[a-z0-9]+\.png$/);
    // 内容と形式は変わらない
    expect(out.size).toBe(f.size);
    expect(out.type).toBe('image/png');
  });

  it('英数字・ハイフン・アンダースコアのみの名前はそのまま保持する', () => {
    const f = new File([new Blob(['x'])], 'bike-photo-1.png', { type: 'image/png' });
    expect(toAsciiFile(f, 'post').name).toBe('bike-photo-1.png');
  });

  it('半角スペース入りのASCII名も変換する', () => {
    const f = new File([new Blob(['x'])], 'my photo.png', { type: 'image/png' });
    expect(toAsciiFile(f).name).toMatch(/^img-[a-z0-9]+-[a-z0-9]+\.png$/);
  });

  it('拡張子が読み取れない場合はpngを補う', () => {
    expect(buildAsciiFileName('スクリーンショット')).toMatch(/\.png$/);
  });

  it('拡張子の大文字は小文字に正規化される', () => {
    expect(buildAsciiFileName('写真.JPG')).toMatch(/\.jpg$/);
  });
});

describe('isSafeAsciiName', () => {
  it('ASCII英数字のみの名前を安全と判定する', () => {
    expect(isSafeAsciiName('photo-1_a.png')).toBe(true);
  });
  it('日本語・スペース・全角を含む名前は安全ではない', () => {
    expect(isSafeAsciiName('スクリーンショット 2026.png')).toBe(false);
    expect(isSafeAsciiName('my photo.png')).toBe(false);
    expect(isSafeAsciiName('全角.png')).toBe(false);
  });
});
