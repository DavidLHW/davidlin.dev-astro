import rss from "@astrojs/rss";
import { blog } from "@/lib/markdoc/frontmatter.schema";
import { readAll } from "@/lib/markdoc/read";
import config from "@/config";

export const get = async () => {
  const posts = await readAll({
    directory: config.NAV.BLOG.NAME.toLowerCase(),
    frontmatterSchema: blog,
  });

  const sortedPosts = posts
    .filter((p) =>
      import.meta.env.MODE !== "production"
        ? true
        : p.frontmatter.draft !== true
    )
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).valueOf() -
        new Date(a.frontmatter.date).valueOf()
    );

  let baseUrl = config.SITE_URL;
  // removing trailing slash if found
  // https://example.com/ => https://example.com
  baseUrl = baseUrl.replace(/\/+$/g, "");

  const rssItems = sortedPosts.map(({ frontmatter, slug }) => {
    if (frontmatter.external) {
      const title = frontmatter.title;
      const pubDate = frontmatter.date;
      const link = frontmatter.url;

      return {
        title,
        pubDate,
        link,
      };
    }

    const title = frontmatter.title;
    const pubDate = frontmatter.date;
    const description = frontmatter.description;
    const link = `${baseUrl}/blog/${slug}`;

    return {
      title,
      pubDate,
      description,
      link,
    };
  });

  return rss({
    title: config.SITE_TITLE,
    description: config.SITE_DESCRIPTION,
    site: baseUrl,
    items: rssItems,
  });
};
