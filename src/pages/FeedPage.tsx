import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getFeedPosts } from "../services/post.service";
import { getFeedStories } from "../services/story.service";
import { getConversations } from "../services/message.service";
import { getMyProfile } from "../services/user.service";
import { PostCard } from "../components/PostCard";
import { TrendingUp, MessageCircle, Sparkles, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-40 w-96 h-96 bg-pink-300/30 dark:bg-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/30 dark:bg-blue-500/10 rounded-full blur-3xl"
        />

        {/* Flowing Wave Effects */}
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent dark:via-purple-400/10 blur-2xl transform -skew-y-12" />
        </motion.div>

        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent dark:via-blue-400/10 blur-2xl transform skew-y-6" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-700/30 p-4"
            >
              <StoriesBar stories={stories} onCreateStory={onCreateStory} />
            </motion.div>

            {/* Posts */}
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-8"
              >
                No posts yet
              </motion.p>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-700/30 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Trending Topics
                </h3>
                <Sparkles className="w-4 h-4 text-yellow-500 ml-auto" />
              </div>
              <div className="space-y-3">
                {[
                  "#WebDevelopment",
                  "#Design",
                  "#Entrepreneurship",
                  "#Photography",
                  "#AI",
                ].map((tag, index) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tag}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(Math.random() * 10 + 1).toFixed(1)}k posts
                        </p>
                      </div>
                      <Zap className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100/50 dark:border-purple-700/30 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recent Messages
                </h3>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto animate-pulse" />
              </div>
              <div className="space-y-3">
                {conversations.slice(0, 4).map((conv, index) => {
                  const otherUser = conv.participants.find(
                    (p: any) => p._id !== myUserId
                  );
                  if (!otherUser) return null;

                  return (
                    <motion.button
                      key={conv._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => navigate("/messages")}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-800"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {otherUser.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage?.text || "No messages yet"}
                        </p>
                      </div>
                      {Math.random() > 0.5 && (
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {Math.floor(Math.random() * 9) + 1}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-8 right-8 hidden lg:block z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 360 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}