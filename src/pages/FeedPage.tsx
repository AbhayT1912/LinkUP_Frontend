import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeedPosts } from "../services/post.service";
import { getFeedStories } from "../services/story.service";
import { getConversations } from "../services/message.service";
import { getMyProfile } from "../services/user.service";
import { PostCard } from "../components/PostCard";
import { TrendingUp, MessageCircle } from "lucide-react";
import { getUserIdFromToken } from "../utils/auth";
import StoriesBar from "../components/StoriesBar";

interface FeedPageProps {
  onCreateStory: () => void;
}

export function FeedPage({ onCreateStory }: FeedPageProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const myUserId = getUserIdFromToken();

  /* =========================
     LOAD FEED DATA
     ========================= */
  const loadFeed = async () => {
    try {
      const [storiesRes, postsRes, convRes, profileRes] = await Promise.all([
        getFeedStories(),
        getFeedPosts(),
        getConversations(),
        getMyProfile(),
      ]);

      setStories(storiesRes);

      // Normalize posts for PostCard (NO UI change)
      const normalizedPosts = postsRes.data.posts.map((p: any) => ({
        ...p,
        currentUserId: myUserId,
      }));

      setPosts(normalizedPosts);
      setConversations(convRes.data.conversations);
      setCurrentUser(profileRes.data.user);
    } catch (err) {
      console.error("Failed to load feed", err);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [refreshKey]);

  /* =========================
     LISTEN FOR STORY + POST CREATION
     ========================= */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === "storyCreated" || e.key === "postCreated") &&
        e.newValue === "true"
      ) {
        setRefreshKey((prev) => prev + 1);
        localStorage.removeItem(e.key);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stories */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <StoriesBar stories={stories} onCreateStory={onCreateStory} />
          </div>

          {stories.length === 0 && (
            <p className="text-sm text-gray-500">No stories yet</p>
          )}

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Trending Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Trending Topics
              </h3>
            </div>
            <div className="space-y-3">
              {[
                "#WebDevelopment",
                "#Design",
                "#Entrepreneurship",
                "#Photography",
                "#AI",
              ].map((tag) => (
                <button
                  key={tag}
                  className="w-full text-left p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                >
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {tag}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(Math.random() * 10 + 1).toFixed(1)}k posts
                  </p>
                </button>
              ))}
            </div>
          </div>

          {posts.length === 0 && (
            <p className="text-sm text-gray-500">No posts yet</p>
          )}

          {/* Recent Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Messages
              </h3>
            </div>
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => {
                const otherUser = conv.participants.find(
                  (p: any) => p._id !== myUserId
                );
                if (!otherUser) return null;

                return (
                  <button
                    key={conv._id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                  >
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {otherUser.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
