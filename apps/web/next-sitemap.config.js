/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://thesyntraa.com",
  generateRobotsTxt: true,
  exclude: ["/admin/*"],
};
