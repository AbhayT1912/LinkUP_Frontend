import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-2xl border p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Discover People</h1>
          <p className="text-gray-600 mb-4">
            Find and connect with people based on their interests
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or location..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium mb-2">No users found</p>
          <p className="text-sm">
            {searchQuery 
              ? "Try searching with different keywords" 
              : "No users available to discover"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const isFollowing = followingIds.has(user._id);

            return (
              <UserCard
                key={user._id}
                user={user}
                isFollowing={isFollowing}
                onFollowToggle={() => handleFollowToggle(user._id)}
                showFollowButton={true}
                showViewProfile={true}
                showMessageButton={true} // ✅ ENABLED: Now shows message button
                disableFollow={false} // ✅ Always allow clicking
              />
            );
          })}
        </div>
      )}
    </div>
  );
}