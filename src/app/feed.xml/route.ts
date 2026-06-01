import { blogPosts } from '@/lib/blog-data';

export async function GET() {
  const siteUrl = 'https://optigroup.dev';
  const blogUrl = `${siteUrl}/blog`;

  const items = blogPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title.en} | ${post.title.ar}]]></title>
      <description><![CDATA[${post.excerpt.en}]]></description>
      <link>${blogUrl}/${post.slug}</link>
      <guid isPermaLink="true">${blogUrl}/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Opti Group Blog | مدونة مجموعة أوبتي</title>
    <description>Latest news and articles from Opti Group — آخر الأخبار والمقالات من مجموعة أوبتي</description>
    <link>${blogUrl}</link>
    <language>ar-en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
