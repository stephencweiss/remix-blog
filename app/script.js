const fs = require("fs");
const path = require("path");
const parseFrontMatter = require("front-matter");
const invariant = require("tiny-invariant");

const postsPath = path.join(__dirname, "../../../", "digital-garden/notes");

function readPosts() {
  const dir = fs.readdirSync(postsPath);
  return dir.reduce((acc, filename) => {
    const fullPath = path.join(postsPath, filename);
    const isFile = fs.lstatSync(fullPath).isFile();
    if (!isFile) {
      return acc;
    }
    const file = fs.readFileSync(fullPath);
    const { attributes } = parseFrontMatter(file.toString());
    // invariant(
    //   isValidPostAttributes(attributes),
    //   `${filename} has bad meta data!`
    // );
    if (fullPath.includes("beginners-guide")) {
      const dt = attributes.date;
      const parsed = Date.parse(dt);
      console.log({ dt, parsed });
      console.log({
        pathName: path.join(postsPath, filename),
        attributes,
        date: typeof attributes.date,
      });
    }

    const keys = Object.keys(attributes);
    keys.forEach((key) => acc.add(key));
    return acc;
  }, new Set());
  // .filter(async (dir) => (await dir).slug !== "NOT FILE")
}

console.log(JSON.stringify({ res: [...readPosts().values()].sort() }, null, 4));

/**
  "res": [
        "archived",
        "author",
        "authorLast",
        "backlinks",
        "bookTitle",
        "category",
        "date",
        "draft",
        "external-context",
        "internal-context",
        "notes",
        "private",
        "project",
        "publish",
        "publishe",
        "published",
        "rating",
        "slug",
        "social-context",
        "stage",
        "tag",
        "tags",
        "title",
        "topics",
        "updated"
    ]
 */
