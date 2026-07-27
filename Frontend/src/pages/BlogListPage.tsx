import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type BlogPost } from "../types";
import { Calendar, Eye, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const PAGE_SIZE = 10;

export default function BlogListPage() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const fetchBlogs = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/blogs?page=${pageNumber}&limit=${PAGE_SIZE}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        const items: BlogPost[] = data.data.blogs.map((item: any) => ({
          id: item._id,
          title: item.title,
          slug: item.slug,
          blocks: item.blocks,
          status: item.status,
          publishedAt: item.publishedAt,
          comments: item.comments || [],
          viewCount: item.viewCount || 0,
          author: item.author
            ? { id: item.author._id, name: item.author.name }
            : undefined,
          tags: item.tags || [],
        }));

        setBlogs(items);
        setTotalPages(Math.max(1, data.totalPages || 1));
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">All Blogs</h1>
          <p className="text-sm text-gray-600">
            Browse published posts. Most recent posts are shown first.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {blogs.length === 0 && (
              <p className="text-center text-gray-600 py-12">
                No published posts yet.
              </p>
            )}
            {blogs.map((b) => (
              <article key={b.id} className="bg-white p-4 rounded shadow">
                <Link
                  to={`/view/${b.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {b.title}
                </Link>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  {b.author && (
                    <Link
                      to={`/author/${b.author.id}`}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <User className="w-4 h-4" />
                      {b.author.name}
                    </Link>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {b.publishedAt
                      ? new Date(b.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {b.viewCount || 0} views
                  </div>
                </div>
              </article>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
