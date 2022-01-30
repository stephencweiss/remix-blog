import path from "path";
import fs from "fs/promises";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";
import { debug } from "./utils/debug";
marked.setOptions({
  highlight: function (code, lang) {
    const hljs = require("highlight.js/lib/common");
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
});

export type Post = {
  slug: string;
  title: string;
};

type NewPost = {
  title: string;
  slug: string;
  markdown: string;
};

export type PostMarkdownAttributes = {
  title: string;
  date?: object | string;
  publish?: object | string;
  stage?: "published" | "draft" | "archived";
  archived?: boolean;
  author?: string;
  authorLast?: string;
  backlinks?: any[];
  bookTitle?: string;
  category?: string[];
  draft?: boolean;
  private?: boolean;
  rating?: number;
  tags?: string[];
  topics?: string[];
};

// relative to the server output not the source!
const postsPath = path.join(__dirname, "../../../", "digital-garden/notes");

const fileFilter = async (filePath: string) => {
  const fullPath = path.join(postsPath, filePath);
  return (await fs.stat(fullPath)).isFile();
};

function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_value, index) => filterMap[index]);
}

export async function getPosts(): Promise<Post[]> {
  debug();
  const dir = await fs.readdir(postsPath);
  const filtered = await filterAsync(dir, fileFilter);

  return Promise.all(
    filtered.map(async (filename) => {
      const fullPath = path.join(postsPath, filename);
      const file = await fs.readFile(fullPath);
      const { attributes } = parseFrontMatter(file.toString());
      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad meta data!`
      );
      return {
        slug: filename.replace(/\.md$/, ""),
        title: attributes.title,
        stage: attributes.stage,
      };
    })
  );
}

export async function getPost(slug: string) {
  const filepath = path.join(postsPath, slug + ".md");
  const file = await fs.readFile(filepath);
  const { attributes, body } = parseFrontMatter(file.toString());
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filepath} is missing attributes`
  );

  const html = marked.parse(body);
  return { slug, title: attributes.title, html };
}

export async function createPost(post: NewPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, post.slug + ".md"), md);
  return getPost(post.slug);
}

function isValidDate(date: any) {
  return !Number.isNaN(Date.parse(date));
}

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  const title = typeof attributes?.title === "string";
  const stage = attributes?.stage;
  const isValidStage =
    !stage ||
    stage === "published" ||
    stage === "draft" ||
    stage === "archived";

  const date = stage === "published" ? isValidDate(attributes?.date) : true;
  const publish =
    stage === "published" ? isValidDate(attributes?.publish) : true;

  const category = attributes?.category
    ? attributes.category.filter(
        (category: string) => typeof category !== "string"
      ).length === 0
    : true;

  const tags = attributes?.tags
    ? attributes?.tags.filter((tags: string) => typeof tags !== "string")
        .length === 0
    : true;

  const isValid =
    title && date && publish && stage && isValidStage && category && tags;
  return isValid;
}
