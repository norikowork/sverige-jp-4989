// アップロード前の写真を軽くリサイズする共通ヘルパー(投稿フォーム・サービス投稿の写真・プロフィール画像)。
// iPhoneの写真(HEIC等)や高解像度の画像も、ブラウザで読み込めればJPEGにして長辺MAX_DIMENSIONまで縮小する。
// WebP等への変換はしない。表示サイズや形式(WebP等)の最適化はKlivのサーバーが配信時に自動で行う。

export const ABUSE_MAX_BYTES = 25 * 1024 * 1024; // 25MB — これを超える生ファイルは拒否
const MAX_DIMENSION = 2560; // 長辺の最大ピクセル数
const JPEG_QUALITY = 0.88;

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
      // JPEGは透明を持てないため、透過PNGの背景は白にする
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('画像の変換に失敗しました'));
          return;
        }
        const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        resolve(new File([blob], newName, { type: 'image/jpeg' }));
      }, 'image/jpeg', JPEG_QUALITY);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('画像を読み込めませんでした(対応していない形式の可能性があります)'));
    };
    img.src = objectUrl;
  });
};
