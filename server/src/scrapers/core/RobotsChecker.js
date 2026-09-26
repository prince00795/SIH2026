import https from 'https';
import http from 'http';
import { URL } from 'url';

export class RobotsChecker {
  static cache = new Map();
  static CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  static async checkPermission(targetUrl, userAgent = 'Aerostat-APIx') {
    try {
      const parsed = new URL(targetUrl);
      const domain = parsed.hostname;
      const now = Date.now();

      const cached = this.cache.get(domain);
      if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
        const isAllowed = this.evaluateRules(cached.rules, parsed.pathname);
        return {
          status: cached.status,
          isAllowed,
          reason: isAllowed ? 'Allowed by cached robots.txt policy' : 'Path disallowed in robots.txt',
        };
      }

      const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
      const result = await this.fetchRobotsTxt(robotsUrl);

      if (result.status === 'ERROR' || !result.content) {
        // Strict compliance: if robots.txt cannot be verified, do NOT automatically assume permission
        this.cache.set(domain, { rules: [], status: 'ROBOTS_UNVERIFIED', timestamp: now });
        return {
          status: 'ROBOTS_UNVERIFIED',
          isAllowed: false,
          reason: 'robots.txt was unreachable or timed out; statutory policy prohibits scraping when permissions are unverified.',
        };
      }

      const rules = result.content.split('\n').map((l) => l.trim());
      const isAllowed = this.evaluateRules(rules, parsed.pathname);
      const status = isAllowed ? 'ALLOWED' : 'DISALLOWED';

      this.cache.set(domain, { rules, status, timestamp: now });

      return {
        status,
        isAllowed,
        reason: isAllowed ? 'Explicitly permitted by robots.txt' : 'Explicitly disallowed by robots.txt',
      };
    } catch (err) {
      return {
        status: 'ROBOTS_UNVERIFIED',
        isAllowed: false,
        reason: `Error checking robots.txt: ${err.message}`,
      };
    }
  }

  static async isAllowed(targetUrl) {
    const res = await this.checkPermission(targetUrl);
    return res.isAllowed;
  }

  static fetchRobotsTxt(urlStr) {
    return new Promise((resolve) => {
      try {
        const client = urlStr.startsWith('https') ? https : http;
        const req = client.get(urlStr, { timeout: 4000 }, (res) => {
          if (res.statusCode === 200) {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: 'OK', content: data }));
          } else {
            resolve({ status: 'ERROR', content: '' });
          }
        });
        req.on('error', () => resolve({ status: 'ERROR', content: '' }));
        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 'ERROR', content: '' });
        });
      } catch {
        resolve({ status: 'ERROR', content: '' });
      }
    });
  }

  static evaluateRules(rules, path) {
    let appliesToBot = true;

    for (const line of rules) {
      const lower = line.toLowerCase();
      if (lower.startsWith('user-agent:')) {
        const ua = line.substring(11).trim();
        appliesToBot = ua === '*' || ua.toLowerCase().includes('aerostat') || ua.toLowerCase().includes('vayusutra');
      } else if (appliesToBot && lower.startsWith('disallow:')) {
        const disallowPath = line.substring(9).trim();
        if (disallowPath && (disallowPath === '/' || path.startsWith(disallowPath))) {
          return false;
        }
      }
    }
    return true;
  }
}
