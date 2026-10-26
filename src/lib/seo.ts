// 各ページで検索エンジン向けのtitle/description/canonicalを正しく設定するための共通ヘルパー。
// SPA(クライアント側レンダリング)のため、index.htmlの値は全ページ共通のフォールバックに過ぎず、
// ここで各ページの内容に合わせて上書きする必要がある。

import { useEffect } from 'react';

const SITE_URL = 'https://sverige.jp';

const setNameMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const setPropertyMetaTag = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const setCanonical = (path: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  const url = path.startsWith('http') ? path : `${SITE_URL}${path}`;
  link.setAttribute('href', url);
  return url;
};

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  type?: string;
}

// title/description/canonical(+og/twitterの対応するタグ)をまとめて設定する
export const setPageSeo = ({ title, description, path, type = 'website' }: SeoOptions) => {
  document.title = title;
  setNameMetaTag('description', description);
  const canonicalUrl = setCanonical(path);

  setPropertyMetaTag('og:title', title);
  setPropertyMetaTag('og:description', description);
  setPropertyMetaTag('og:url', canonicalUrl);
  setPropertyMetaTag('og:type', type);

  setNameMetaTag('twitter:title', title);
  setNameMetaTag('twitter:description', description);
};

const DEFAULT_TITLE = 'Sverige.JP｜スウェーデン在住日本人のコミュニティサイト';
const DEFAULT_DESCRIPTION = 'Sverige.JPは、スウェーデンのローカル情報満載の日本語情報サイトです。スウェーデンでの売ります買います、お仕事探し、住居、イベント情報、掲示板など、スウェーデン×日本の生活に役立つ情報を日本語で投稿・検索できます。';

// index.htmlの既定値に戻す(トップページなど、ページ固有の内容がない場合に使用)
export const resetPageSeo = (path: string = '/') => {
  setPageSeo({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path });
};

// 内容が固定の静的ページ(About/Help/利用規約など)で使う、マウント時に一度だけ
// title/description/canonicalを設定するためのフック
export const usePageSeo = ({ title, description, path, type }: SeoOptions) => {
  useEffect(() => {
    setPageSeo({ title, description, path, type });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, type]);
};
