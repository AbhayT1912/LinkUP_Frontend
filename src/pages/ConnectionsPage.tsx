import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, Sparkles, TrendingUp, Heart } from "lucide-react";
import { UserCard } from "../components/UserCard";
import {
  getMyFollowers,
  getMyFollowing,
  followUser,
} from "../services/user.service";

type Tab = "followers" | "following";

interface User {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("followers");
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD CONNECTIONS
     ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(""); // Clear any previous errors

        const [followersRes, followingRes] = await Promise.all([
          getMyFollowers(),
          getMyFollowing(),
        ]);

        console.log("Followers Response:", followersRes);
        console.log("Following Response:", followingRes);

        // Handle different possible response structures
        const followersList = Array.isArray(followersRes.data)
          ? followersRes.data
          : followersRes.data?.users || followersRes.data?.followers || [];

        const followingList = Array.isArray(followingRes.data)
          ? followingRes.data
          : followingRes.data?.users || followingRes.data?.following || [];

        console.log("Processed Followers:", followersList);
        console.log("Processed Following:", followingList);

        setFollowers(followersList);
        setFollowing(followingList);
        setFollowingIds(
          new Set(followingList.map((u: User) => u._id))
        );
      } catch (err: any) {
        console.error("Error loading connections:", err);
        console.error("Error response:", err.response);
        setError(err.response?.data?.message || "Failed to load connections");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     FOLLOW BACK (ONLY IN FOLLOWERS TAB)
     ========================= */
  const handleFollowBack = async (userId: string) => {
    try {
      await followUser(userId);

      // Find the user from followers array
      const userToAdd = followers.find(u => u._id === userId);
      
      if (userToAdd) {
        // Update local state
        setFollowingIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(userId);
          return newSet;
        });
        
        setFollowing((prev) => {
          // Check if user is already in following list
          if (prev.some(u => u._id === userId)) {
            return prev;
          }
          return [...prev, userToAdd];
        });
      }
    } catch (err) {
      console.error("Follow back failed", err);
      // Optionally show error to user
      alert("Failed to follow user. Please try again.");
    }
  };

  const activeUsers = activeTab === "followers" ? followers : following;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"
          />
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 py-10 text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-gray-600 dark:text-gray-300 font-medium text-lg"
          >
            Loading your connections...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-red-200 dark:border-red-800 max-w-md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-red-600 dark:text-red-400 font-semibold text-lg">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
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
          className="absolute top-20 left-20 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl"
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
          className="absolute top-1/3 right-40 w-96 h-96 bg-pink-300/30 dark:bg-pink-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-3xl"
        />

        {/* Sparkles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            My Connections
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Build your network, grow together 🚀
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-purple-100/50 dark:border-purple-700/30 p-6 shadow-xl relative overflow-hidden group cursor-pointer"
          >
            {/* Gradient Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
            />
            
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                >
                  {followers.length}
                </motion.p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                  Followers
                </p>
              </div>
            </div>
            
            {/* Floating Hearts */}
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-4 right-4"
            >
              <Heart className="w-6 h-6 text-purple-400 fill-purple-400/30" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-blue-700/30 p-6 shadow-xl relative overflow-hidden group cursor-pointer"
          >
            {/* Gradient Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
            />
            
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <UserCheck className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                >
                  {following.length}
                </motion.p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                  Following
                </p>
              </div>
            </div>
            
            {/* Floating Stars */}
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-4 right-4"
            >
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-purple-100/50 dark:border-purple-700/30 p-2 flex gap-2 shadow-xl relative overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5"
            style={{ backgroundSize: "200% 200%" }}
          />

          <motion.button
            onClick={() => setActiveTab("followers")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-all relative z-10 ${
              activeTab === "followers"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <motion.span
              animate={activeTab === "followers" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Followers ({followers.length})
            </motion.span>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab("following")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-4 rounded-2xl font-semibold transition-all relative z-10 ${
              activeTab === "following"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <motion.span
              animate={activeTab === "following" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              Following ({following.length})
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Users Grid */}
        <AnimatePresence mode="wait">
          {activeUsers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block mb-6"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-purple-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {activeTab === "followers" 
                  ? "You don't have any followers yet. Keep sharing great content! 🌟" 
                  : "You're not following anyone yet. Start exploring! 🚀"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {activeUsers.map((user, index) => {
                  const isFollowing = followingIds.has(user._id);

                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{ y: -8 }}
                    >
                      <UserCard
                        user={user}
                        isFollowing={isFollowing}
                        showFollowButton={activeTab === "followers"}
                        disableFollow={isFollowing}
                        onFollowToggle={() => handleFollowBack(user._id)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Element */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed bottom-8 right-8 z-50 hidden lg:block"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}