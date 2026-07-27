import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { type BlogPost } from "../types";
import { Eye, MessageSquare, Calendar, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AuthorPage() {
  const { authorId } = useParams<{ authorId: string }>();
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchAuthorBlogs = async () => {
      if (!authorId) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/blogs?author=${authorId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const data = await response.json();

        if (data.status === "success") {
          const mapped: BlogPost[] = data.data.blogs.map((item: any) => ({
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

          setBlogs(mapped);
          setAuthorName(mapped[0]?.author?.name || "Unknown Author");
        }
      } catch (err) {
        console.error("Error fetching author blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorBlogs();

    const key = `follow_${authorId}`;
    const stored = localStorage.getItem(key);
    setFollowing(stored === "true");
  }, [authorId, token]);

  const toggleFollow = () => {
    const key = `follow_${authorId}`;
    const next = !following;
    setFollowing(next);
    try {
      localStorage.setItem(key, next ? "true" : "false");
    } catch (e) {
      console.error("Failed to persist follow state", e);
    }
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-center text-gray-600">Loading author...</p>
      </div>
    );

  const totalViews = blogs.reduce((s, b) => s + (b.viewCount || 0), 0);
  const totalComments = blogs.reduce(
    (s, b) => s + (b.comments?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <Link to="/blogs" className="flex items-center gap-2 text-blue-600">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">
              {authorName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{authorName}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {blogs.length} posts · {totalViews} views · {totalComments}{" "}
                comments
              </p>
            </div>
            <div>
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 rounded-md text-white ${
                  following ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Posts by {authorName}
            </h2>
            {blogs.length === 0 ? (
              <p className="text-gray-600">
                No posts published by this author yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {blogs.map((b) => (
                  <li key={b.id} className="border-b pb-3">
                    <Link
                      to={`/view/${b.id}`}
                      className="text-lg font-medium text-blue-600 hover:underline"
                    >
                      {b.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {b.publishedAt
                          ? new Date(b.publishedAt).toLocaleDateString()
                          : "Draft"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {b.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {b.comments.length}
                      </span>
                    </div>
                    {b.tags && b.tags.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {b.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Recommended to read</h3>
            {blogs.length === 0 ? (
              <p className="text-gray-600">No recommendations yet.</p>
            ) : (
              <ol className="space-y-3">
                {blogs
                  .slice()
                  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                  .slice(0, 5)
                  .map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`/view/${b.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {b.title}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {b.viewCount || 0} views
                      </div>
                    </li>
                  ))}
              </ol>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
