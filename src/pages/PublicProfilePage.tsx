import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Link2,
  ArrowLeft,
  MessageCircle,
  FileText,
} from "lucide-react";
import {
  followUser,
  unfollowUser,
  getMyFollowing,
  getUserByUsername,
} from "../services/user.service";
import { getConversations } from "../services/message.service";
import { getPostsByUser } from "../services/post.service";
import { PostCard } from "../components/PostCard";

export function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  /* =========================
     LOAD PROFILE
     ========================= */
  useEffect(() => {
    if (!username) {
      navigate("/discover");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);

        const res = await getUserByUsername(username);
        const userData = res.data.user || res.data;

        setUser(userData);

        const followingRes = await getMyFollowing();
        const followingList =
          followingRes.data.users ||
          followingRes.data.following ||
          followingRes.data ||
          [];

        const followed = followingList.some((u: any) => u._id === userData._id);

        setIsFollowing(followed);

        // Load user's posts
        try {
          const postsRes = await getPostsByUser(userData._id);
          setUserPosts(postsRes.data.posts || []);
        } catch (err) {
          console.error("Failed to load posts:", err);
          setUserPosts([]);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        navigate("/discover");
      } finally {
        setLoading(false);
        setLoadingPosts(false);
      }
    };

    loadProfile();
  }, [username, navigate]);

  /* =========================
     FOLLOW / UNFOLLOW
     ========================= */
  const handleFollowToggle = async () => {
    if (!user) return;

    const prev = isFollowing;
    setIsFollowing(!prev);

    try {
      prev ? await unfollowUser(user._id) : await followUser(user._id);
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      setIsFollowing(prev);
      alert("Failed to update follow status. Please try again.");
    }
  };

  /* =========================
     MESSAGE
     ========================= */
  const handleMessage = async () => {
    if (!user) return;

    try {
      const res = await getConversations();
      const conversations = res.data.conversations || res.data || [];

      const existing = conversations.find((c: any) =>
        c.participants.some((p: any) => {
          const id = typeof p === "string" ? p : p._id;
          return id === user._id;
        }),
      );

      navigate("/messages", {
        state: existing
          ? { conversationId: existing._id }
          : {
              newConversationWith: {
                userId: user._id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
              },
            },
      });
    } catch (err) {
      console.error("Error opening conversation:", err);
      navigate("/messages");
    }
  };

  /* =========================
     STATES
     ========================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="text-gray-500"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-600 text-lg mb-4">User not found</p>
          <button
            onClick={() => navigate("/discover")}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Go to Discover
          </button>
        </motion.div>
      </div>
    );
  }

  /* =========================
     JSX
     ========================= */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full overflow-visible"
    >
      {/* Back Button */}
      <div className="px-4 md:px-6 py-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </motion.button>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-gray-100 w-full">
        <div className="w-full overflow-visible">
          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-48 md:h-56 w-full bg-gradient-to-r from-purple-200 to-pink-200"
          >
            {user.coverImage ? (
              <motion.img
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full bg-gradient-to-r from-purple-300 to-pink-300"
              ></motion.div>
            )}
          </motion.div>

          {/* Profile Info */}
          <div className="px-4 md:px-6">
            {/* Avatar + Action Buttons */}
            <div className="flex items-end justify-between -mt-16 mb-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="relative"
              >
                <motion.img
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || user.username,
                    )}&background=random&size=128`
                  }
                  alt={user.name || user.username}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white"
                />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                {/* MESSAGE BUTTON */}
                <button
                  onClick={handleMessage}
                  style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-md font-semibold text-sm hover:brightness-110 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>

                {/* FOLLOW / UNFOLLOW */}
                <button
                  onClick={handleFollowToggle}
                  style={{
                    backgroundColor: isFollowing ? "#dc2626" : undefined,
                    color: "#ffffff",
                  }}
                  className={`px-6 py-3 rounded-xl shadow-md font-semibold text-sm transition-all ${
                    isFollowing
                      ? "hover:brightness-110"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-3"
            >
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-2xl md:text-3xl font-bold text-gray-900"
              >
                {user.name || user.username}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-gray-500 text-base"
              >
                @{user.username}
              </motion.p>
            </motion.div>

            {/* Tagline */}
            {user.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-gray-600 text-lg font-medium mb-4"
              >
                {user.tagline}
              </motion.p>
            )}

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-gray-700 text-base leading-relaxed mb-6 max-w-3xl"
            >
              {user.bio || "No bio added yet"}
            </motion.p>

            {/* Meta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-gray-600 mb-6"
            >
              {/* Location */}
              {user.location && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="w-4 h-4 text-pink-600" />
                  </motion.div>
                  <span>{user.location}</span>
                </motion.div>
              )}

              {/* Joined Date */}
              {user.createdAt && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </motion.div>
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              )}

              {/* Links */}
              {user.links?.map((link: any, i: number) => (
                <motion.a
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:underline"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Link2 className="w-4 h-4" />
                  </motion.div>
                  <span>{link.label}</span>
                </motion.a>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex items-center gap-6 pb-3 border-b border-gray-200"
            >
              <StatItem value={userPosts.length} label="Posts" delay={1.4} />
              <StatItem
                value={user.followers?.length || 0}
                label="Followers"
                delay={1.5}
              />
              <StatItem
                value={user.following?.length || 0}
                label="Following"
                delay={1.6}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
        className="px-4 md:px-6 py-6"
      >
        {loadingPosts ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 py-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              Loading posts...
            </motion.div>
          </motion.div>
        ) : userPosts.length === 0 ? (
          <EmptyState text="No posts yet" icon={FileText} />
        ) : (
          <div className="space-y-5 max-w-8xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
              {userPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- Components ---------- */

function StatItem({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5 }}
      whileHover={{
        scale: 1.1,
        y: -5,
      }}
      whileTap={{ scale: 0.95 }}
      className="group"
    >
      <motion.span
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="font-bold text-base text-gray-900 group-hover:text-purple-600 transition-colors"
      >
        {value.toLocaleString()}
      </motion.span>
      <span className="text-gray-600 text-sm ml-1">{label}</span>
    </motion.button>
  );
}

function EmptyState({ text, icon: Icon }: { text: string; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="bg-white rounded-xl border border-gray-200 p-12 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          whileHover={{
            rotate: [0, -10, 10, -10, 0],
            scale: 1.1,
          }}
          className="p-4 bg-gray-50 rounded-full"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className="w-8 h-8 text-gray-400" />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base text-gray-500 font-medium"
        >
          {text}
        </motion.p>
      </div>
    </motion.div>
  );
}
