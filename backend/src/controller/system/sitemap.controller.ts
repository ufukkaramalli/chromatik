import { Request, Response, NextFunction, Router } from 'express';
import IController from '../../interfaces/controller.interface';
import { ISitemapEntry, ISitemapCache } from '../../interfaces/sitemap.interface';
import trackModel from '../../model/track.model';
import userModel from '../../model/user.model';
import logger from '../../utils/logger';

const escapeXml = (str: string): string => {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

const formatDate = (date?: Date | string | null): string | undefined => {
  if (!date) return undefined;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
};

class SitemapController implements IController {
  public path = '';
  public router: Router = Router();

  private cache: ISitemapCache | null = null;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.get('/sitemap.xml', this.getSitemap);
    this.router.get('/robots.txt', this.getRobots);
  }

  /**
   * Resolves the canonical base URL from environment or request headers.
   * Handles reverse proxies (X-Forwarded-Proto, X-Forwarded-Host).
   */
  public getBaseUrl(req: Request): string {
    const envUrl = process.env.CLIENT_URL;
    if (envUrl && envUrl.trim().length > 0) {
      return envUrl.trim().replace(/\/+$/, '');
    }

    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto =
      typeof forwardedProto === 'string'
        ? forwardedProto.split(',')[0].trim()
        : req.protocol || 'http';

    const forwardedHost = req.headers['x-forwarded-host'];
    const host =
      typeof forwardedHost === 'string'
        ? forwardedHost.split(',')[0].trim()
        : req.get('host') || 'localhost:8080';

    return `${proto}://${host}`.replace(/\/+$/, '');
  }

  /**
   * @openapi
   * /sitemap.xml:
   *   get:
   *     tags:
   *       - SEO
   *     summary: Dynamic XML Sitemap for search engines
   *     responses:
   *       200:
   *         description: XML sitemap
   *         content:
   *           application/xml:
   *             schema:
   *               type: string
   */
  public getSitemap = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const baseUrl = this.getBaseUrl(req);
      const now = Date.now();

      // Return cached version if still valid for the same baseUrl
      if (
        this.cache &&
        now - this.cache.generatedAt < this.CACHE_TTL_MS &&
        this.cache.baseUrl === baseUrl
      ) {
        res.header('Content-Type', 'application/xml; charset=utf-8');
        res.header('X-Sitemap-Cache', 'HIT');
        res.send(this.cache.xml);
        return;
      }

      const entries: ISitemapEntry[] = [];

      // 1. Static Core Pages
      entries.push(
        { loc: '/', changefreq: 'daily', priority: '1.0' },
        { loc: '/explore/tracks', changefreq: 'hourly', priority: '0.9' },
        { loc: '/explore/producers', changefreq: 'daily', priority: '0.8' },
        { loc: '/explore/soundkits', changefreq: 'daily', priority: '0.8' },
        { loc: '/support', changefreq: 'monthly', priority: '0.5' },
        { loc: '/legal/terms', changefreq: 'monthly', priority: '0.3' },
        { loc: '/legal/privacy', changefreq: 'monthly', priority: '0.3' },
        { loc: '/legal/license', changefreq: 'monthly', priority: '0.3' }
      );

      // 2. Active User Profiles
      try {
        const users = await userModel
          .find({}, 'slug updatedAt')
          .lean();

        for (const user of users) {
          if (user.slug && typeof user.slug === 'string') {
            entries.push({
              loc: `/${encodeURIComponent(user.slug)}`,
              changefreq: 'weekly',
              priority: '0.8',
              lastmod: formatDate((user as any).updatedAt)
            });
          }
        }
      } catch (err) {
        logger.error('Sitemap: Failed to query users', err);
      }

      // 3. Public Tracks
      try {
        const tracks = await trackModel
          .find({ status: 'public' }, 'slug userId updatedAt')
          .populate<{ userId: { slug?: string } }>('userId', 'slug')
          .lean();

        for (const track of tracks) {
          const userSlug = track.userId?.slug;
          const trackSlug = track.slug;
          if (userSlug && trackSlug) {
            entries.push({
              loc: `/${encodeURIComponent(userSlug)}/${encodeURIComponent(trackSlug)}`,
              changefreq: 'weekly',
              priority: '0.7',
              lastmod: formatDate((track as any).updatedAt)
            });
          }
        }
      } catch (err) {
        logger.error('Sitemap: Failed to query tracks', err);
      }

      // 4. Build XML String
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      for (const entry of entries) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(`${baseUrl}${entry.loc}`)}</loc>\n`;
        if (entry.lastmod) {
          xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
        }
        if (entry.changefreq) {
          xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
        }
        if (entry.priority) {
          xml += `    <priority>${entry.priority}</priority>\n`;
        }
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      // Update in-memory cache
      this.cache = {
        xml,
        generatedAt: now,
        baseUrl
      };

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('X-Sitemap-Cache', 'MISS');
      res.send(xml);
    } catch (error) {
      logger.error('Sitemap generation error', error);
      next(error);
    }
  };

  /**
   * @openapi
   * /robots.txt:
   *   get:
   *     tags:
   *       - SEO
   *     summary: Dynamic robots.txt pointing to the dynamic sitemap
   *     responses:
   *       200:
   *         description: Text robots file
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   */
  public getRobots = (req: Request, res: Response): void => {
    const baseUrl = this.getBaseUrl(req);
    const content = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /explore/
Allow: /legal/
Allow: /support

# Disallow private user portals and dashboards to protect crawl budget
Disallow: /Dashboard
Disallow: /Settings
Disallow: /Tracks
Disallow: /Soundkits
Disallow: /Login
Disallow: /Register

# Disallow internal search query results
Disallow: /search

# Dynamic Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  };
}

export default SitemapController;
