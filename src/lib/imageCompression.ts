// iPhoneの写真(HEIC等)や高解像度の画像でも、アップロード前にブラウザ側で
// 自動的にリサイズ・再圧縮してJPEGに変換する共通ヘルパー。
// PostModal.tsx(投稿フォーム)とPostDetail.tsx(サービス投稿への写真投稿)の両方で使用する。

export const ABUSE_MAX_BYTES = 25 * 1024 * 1024; // 25MB — これを超える生ファイルは拒否
export const TARGET_MAX_BYTES = 1 * 1024 * 1024; // 1MB — 圧縮後の目標サイズ
export const MAX_DIMENSION = 1920; // 長辺の最大ピクセル数

export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const tryEncode = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('画像の変換に失敗しました'));
            return;
          }
          if (blob.size > TARGET_MAX_BYTES && quality > 0.4) {
            tryEncode(quality - 0.15);
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      tryEncode(0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('画像を読み込めませんでした(対応していない形式の可能性があります)'));
    };
    img.src = objectUrl;
  });
};
