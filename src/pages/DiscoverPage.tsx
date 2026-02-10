import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Users, TrendingUp, Compass, Star } from "lucide-react";
import { UserCard } from "../components/UserCard";
import {
  searchUsers,
  followUser,
  unfollowUser,
  getMyFollowing,
} from "../services/user.service";

interface User {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  /* =========================
     INITIAL LOAD (ONLY ONCE)
     ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [usersRes, followingRes] = await Promise.all([
          searchUsers(""),
          getMyFollowing(),
        ]);

        console.log("Initial users response:", usersRes.data);
        console.log("Following response:", followingRes.data);

        // Handle different response structures
        const usersList = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || [];

        const followingList = Array.isArray(followingRes.data)
          ? followingRes.data
          : followingRes.data.users || followingRes.data.following || [];

        setUsers(usersList);

        // Create Set of IDs of users you're following
        const followingIdsSet = new Set(
          followingList.map((u: User) => u._id)
        );
        
        console.log("Following IDs Set:", Array.from(followingIdsSet));
        setFollowingIds(followingIdsSet);
      } catch (err) {
        console.error("Discover load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     SEARCH WITH DEBOUNCE
     ========================= */
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Reset to all users when search is cleared
      const loadAllUsers = async () => {
        try {
          const res = await searchUsers("");
          const usersList = Array.isArray(res.data)
            ? res.data
            : res.data.users || [];
          setUsers(usersList);
        } catch (err) {
          console.error("Load all users error:", err);
        }
      };
      loadAllUsers();
      return;
    }

    // Debounce search
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(searchQuery);
        const usersList = Array.isArray(res.data)
          ? res.data
          : res.data.users || [];
        setUsers(usersList);
        console.log("Search results:", usersList);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* =========================
     FOLLOW/UNFOLLOW TOGGLE
     ========================= */
  const handleFollowToggle = async (userId: string) => {
    const isCurrentlyFollowing = followingIds.has(userId);

    console.log(`Toggle follow for user ${userId}:`, {
      wasFollowing: isCurrentlyFollowing,
      willBeFollowing: !isCurrentlyFollowing
    });

    // ✅ OPTIMISTIC UI UPDATE (immediate feedback)
    if (isCurrentlyFollowing) {
      // UNFOLLOW: Remove from followingIds
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } else {
      // FOLLOW: Add to followingIds
      setFollowingIds((prev) => new Set(prev).add(userId));
    }

    try {
      // ✅ API CALL
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
        console.log(`Successfully unfollowed user ${userId}`);
      } else {
        await followUser(userId);
        console.log(`Successfully followed user ${userId}`);
      }
    } catch (err) {
      console.error("Follow/Unfollow API failed:", err);

      // ❌ ROLLBACK on API failure
      if (isCurrentlyFollowing) {
        // Restore the follow
        setFollowingIds((prev) => new Set(prev).add(userId));
        alert("Failed to unfollow. Please try again.");
      } else {
        // Remove the follow
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        alert("Failed to follow. Please try again.");
      }
    }
  };

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
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
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
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
              <Compass className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Discover People
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Find and connect with amazing people 🌟
          </p>
        </motion.div>

        {/* Search Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-purple-100/50 dark:border-purple-700/30 p-6 md:p-8 shadow-xl relative overflow-hidden"
        >
          {/* Shimmer Effect */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Gradient Border Animation */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl"
            style={{ backgroundSize: "200% 200%" }}
          />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <Search className="w-5 h-5 text-purple-500" />
              </motion.div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or location..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-purple-200/50 dark:border-purple-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        {!loading && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 flex-wrap"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg"
            >
              <Users className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {users.length} {users.length === 1 ? 'User' : 'Users'}
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg"
            >
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {followingIds.size} Following
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-6"
            />
            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
              Finding amazing people...
            </p>
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                <Search className="w-16 h-16 text-purple-400" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {searchQuery 
                ? "Try searching with different keywords" 
                : "No users available to discover"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {users.map((user, index) => {
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
                      onFollowToggle={() => handleFollowToggle(user._id)}
                      showFollowButton={true}
                      showViewProfile={true}
                      showMessageButton={true}
                      disableFollow={false}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
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