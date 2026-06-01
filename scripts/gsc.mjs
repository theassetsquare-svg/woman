// GSC CLI — quick inspection from the terminal.
//   node scripts/gsc.mjs sites
//   node scripts/gsc.mjs queries [site] [days]
//   node scripts/gsc.mjs pages   [site] [days]
//   node scripts/gsc.mjs sitemaps [site]
//   node scripts/gsc.mjs submit-sitemap [site] [feedpath]
//   node scripts/gsc.mjs inspect <url> [site]
import { gscClient } from './gsc-lib.mjs';

const DEFAULT_SITE =
  process.env.GSC_SITE || 'https://woman-5nj.pages.dev/';

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

const [cmd, ...args] = process.argv.slice(2);

const main = async () => {
  const gsc = await gscClient();
  switch (cmd) {
    case 'sites': {
      const r = await gsc.listSites();
      console.log(JSON.stringify(r, null, 2));
      break;
    }
    case 'queries': {
      const site = args[0] || DEFAULT_SITE;
      const days = Number(args[1] || 28);
      const r = await gsc.query(site, {
        ...dateRange(days),
        dimensions: ['query'],
        rowLimit: 200,
      });
      console.log(JSON.stringify(r, null, 2));
      break;
    }
    case 'pages': {
      const site = args[0] || DEFAULT_SITE;
      const days = Number(args[1] || 28);
      const r = await gsc.query(site, {
        ...dateRange(days),
        dimensions: ['page'],
        rowLimit: 500,
      });
      console.log(JSON.stringify(r, null, 2));
      break;
    }
    case 'querypage': {
      const site = args[0] || DEFAULT_SITE;
      const days = Number(args[1] || 28);
      const r = await gsc.query(site, {
        ...dateRange(days),
        dimensions: ['query', 'page'],
        rowLimit: 1000,
      });
      console.log(JSON.stringify(r, null, 2));
      break;
    }
    case 'sitemaps': {
      const site = args[0] || DEFAULT_SITE;
      console.log(JSON.stringify(await gsc.listSitemaps(site), null, 2));
      break;
    }
    case 'submit-sitemap': {
      const site = args[0] || DEFAULT_SITE;
      const feed = args[1] || `${site.replace(/\/$/, '')}/sitemap.xml`;
      await gsc.submitSitemap(site, feed);
      console.log(`submitted ${feed}`);
      break;
    }
    case 'inspect': {
      const url = args[0];
      const site = args[1] || DEFAULT_SITE;
      console.log(JSON.stringify(await gsc.inspect(site, url), null, 2));
      break;
    }
    default:
      console.log(
        'usage: sites | queries | pages | querypage | sitemaps | submit-sitemap | inspect <url>',
      );
  }
};

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
