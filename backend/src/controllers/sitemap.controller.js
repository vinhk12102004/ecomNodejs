import Product from "../models/product.model.js";

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function sitemap(req, res) {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

    const products = await Product.find({ isActive: true })
      .select({ _id: 1, updatedAt: 1 })
      .lean();

    const urls = [];

    // Home
    urls.push({ loc: `${baseUrl}/`, changefreq: "daily", priority: 1.0 });

    // Products list
    urls.push({ loc: `${baseUrl}/products`, changefreq: "daily", priority: 0.8 });

    // Product detail pages (frontend routes assumed as /product/:id)
    for (const p of products) {
      urls.push({
        loc: `${baseUrl}/product/${p._id}`,
        lastmod: new Date(p.updatedAt || Date.now()).toISOString(),
        changefreq: "weekly",
        priority: 0.7
      });
    }

    const xml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
      ...urls.map(u => {
        const parts = [
          `<loc>${xmlEscape(u.loc)}</loc>`,
          u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "",
          u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "",
          u.priority != null ? `<priority>${u.priority}</priority>` : ""
        ].filter(Boolean).join("");
        return `<url>${parts}</url>`;
      }),
      "</urlset>"
    ].join("");

    res.set("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ message: "Failed to build sitemap", error: err.message });
  }
}


