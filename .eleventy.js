const { HtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // Rewrites root-relative URLs (/assets, /img, /floor-plans/…) to respect
  // pathPrefix — needed when served from a subpath like GitHub Pages.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Static passthrough — images, css, js, and root files served as-is
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/root": "/" });

  // Current year helper
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
    // "/" for Cloudflare (root domain); set PATH_PREFIX=/mona-shores-flats/ for GitHub Pages
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
};
