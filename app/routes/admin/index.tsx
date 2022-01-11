import { Link, useLoaderData } from 'remix'

export const loader = () => {
  return null
}

export default function AdminIndex() {
  useLoaderData()
  return (
    <p>
      <Link to="new">Create a New Post</Link>
    </p>
  )
}
