const fs = require("fs");
const path = require("path");

function generateCatalog() {
  try {
    const catalogPath = path.join(__dirname, "..", "public", "catalog");
    const outputPath = path.join(__dirname, "..", "public", "catalog.json");

    if (!fs.existsSync(catalogPath)) {
      console.log("Catalog folder does not exist, writing empty array.");
      fs.writeFileSync(outputPath, JSON.stringify([]));
      return;
    }

    const items = fs.readdirSync(catalogPath);
    const catalogData = [];

    for (const item of items) {
      const itemPath = path.join(catalogPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const files = fs.readdirSync(itemPath);

        // Filter for image and video files
        const mediaExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
          ".svg",
          ".mp4",
          ".webm",
          ".mov",
        ];
        const mediaFiles = files
          .filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return mediaExtensions.includes(ext);
          })
          .map((file) => `/catalog/${item}/${file}`)
          // Sort alphabetically so 1.png comes before 2.png, etc.
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        // Parse info.md if it exists
        const mdPath = path.join(itemPath, "info.md");
        let name = `รีเทนเนอร์พรีเมียม รหัส ${item.toUpperCase()}`;
        let badge = "All New Collection";
        let description = "";

        if (fs.existsSync(mdPath)) {
          const mdContent = fs.readFileSync(mdPath, "utf8");
          const lines = mdContent.split(/\r?\n/);

          const filteredLines = [];
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("# ")) {
              name = trimmed.replace("# ", "");
            } else if (trimmed.startsWith("> ")) {
              badge = trimmed.replace("> ", "");
            } else {
              filteredLines.push(line);
            }
          }
          description = filteredLines.join("\n").trim();
        }

        catalogData.push({
          id: item,
          name,
          badge,
          description,
          media: mediaFiles.length > 0 ? mediaFiles : [`/images/placeholder.png`],
        });
      }
    }

    // Sort items so rtn2026 is always first, followed by alphabetical/numeric sort
    catalogData.sort((a, b) => {
      if (a.id === "rtn2026") return -1;
      if (b.id === "rtn2026") return 1;
      return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
    });

    fs.writeFileSync(outputPath, JSON.stringify(catalogData, null, 2), "utf8");
    console.log(`Successfully generated static catalog at ${outputPath} with ${catalogData.length} items.`);
  } catch (error) {
    console.error("Error generating static catalog:", error);
    process.exit(1);
  }
}

generateCatalog();
