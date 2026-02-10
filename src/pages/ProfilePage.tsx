import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPostsByUser } from "../services/post.service";
import {
  MapPin,
  Calendar,
  Settings,
  FileText,
  Link2,
} from "lucide-react";
import { PostCard } from "../components/PostCard";
import { EditProfileModal } from "../components/EditProfileModal";
import { getMyProfile } from "../services/user.service";

export function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setLoading(true);

        const res = await getMyProfile();
        const userData = res.data.user;
        setUser(userData);

        // 🔥 Fetch posts by this user
        const postsRes = await getPostsByUser(userData._id);
        setUserPosts(postsRes.data.posts || []);

        setError(null);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
        setLoadingPosts(false);
      }
    };

    fetchProfileAndPosts();
  }, []);

  // Placeholder arrays until posts API is connected
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-gray-500"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500"
        >
          {error || "Profile not found"}
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full rounded-lg overflow-hidden"
      >
        {/* PROFILE HEADER */}
        <div className="bg-gray-100 w-full mt-6">
          <div className="w-full rounded-lg overflow-hidden">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-48 md:h-56 w-full rounded-lg overflow-hidden bg-gradient-to-r from-purple-200 to-pink-200"
            >
              {user.coverImage ? (
                <motion.img
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  src={user.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
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
              {/* Avatar + Button */}
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
                    src={user.avatar || "https://via.placeholder.com/128"}
                    alt={user.name || user.username}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/128";
                    }}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white"
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.div>
                  Edit Profile
                </motion.button>
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
                  <span>{user.location || "Not specified"}</span>
                </motion.div>

                {/* Joined Date */}
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

                {/* Links (GitHub etc.) */}
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
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
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
                <StatItem value={user.followers.length} label="Followers" delay={1.5} />
                <StatItem value={user.following.length} label="Following" delay={1.6} />
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
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