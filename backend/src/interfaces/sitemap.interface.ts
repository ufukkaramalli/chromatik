export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface ISitemapEntry {
  loc: string;
  changefreq?: SitemapChangeFreq;
  priority?: string;
  lastmod?: string;
}

export interface ISitemapCache {
  xml: string;
  generatedAt: number;
  baseUrl: string;
}
