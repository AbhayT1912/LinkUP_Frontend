import { useEffect, useState } from "react";
import { Users, UserCheck } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">
        Loading connections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{followers.length}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{following.length}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("followers")}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            activeTab === "followers"
              ? "bg-purple-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Followers ({followers.length})
        </button>

        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            activeTab === "following"
              ? "bg-purple-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Following ({following.length})
        </button>
      </div>

      {/* Users */}
      {activeUsers.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg font-medium mb-2">No users found</p>
          <p className="text-sm">
            {activeTab === "followers" 
              ? "You don't have any followers yet." 
              : "You're not following anyone yet."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUsers.map((user) => {
            const isFollowing = followingIds.has(user._id);

            return (
              <UserCard
                key={user._id}
                user={user}
                isFollowing={isFollowing}
                showFollowButton={activeTab === "followers"}
                disableFollow={isFollowing}
                onFollowToggle={() => handleFollowBack(user._id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}