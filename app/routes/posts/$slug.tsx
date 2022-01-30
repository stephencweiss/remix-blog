import { useLoaderData, LinksFunction } from "remix";
import type { LoaderFunction } from "remix";
import { getPost } from "~/post";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/monokai.min.css",
      integrity:
        "sha512-RLF8eOxhuwsRINc7r56dpl9a3VStqrXD+udWahutJrYdyh++2Ghnf+s4jFsOyryKZt/GNjPwbXVPH3MJpKrn2g==",
      crossorigin: "anonymous",
    },
  ];
};

export default function PostSlug() {
  const post = useLoaderData();
  return (
    <div>
      <h1>Some Post: {post.slug}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  );
}
