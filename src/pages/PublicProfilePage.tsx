import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Grid3x3,
  Heart,
  FileText,
  Link2,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { followUser, unfollowUser, getMyFollowing } from "../services/user.service";
import { getConversations } from "../services/message.service";

export function PublicProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">("posts");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Get user data from navigation state
        const userData = location.state?.user;
        
        if (!userData) {
          console.error("No user data provided");
          navigate("/discover");
          return;
        }

        setUser(userData);

        // Check if we're following this user
        const followingRes = await getMyFollowing();
        const followingList = Array.isArray(followingRes.data)
          ? followingRes.data
          : followingRes.data.users || followingRes.data.following || [];
        
        const isUserFollowed = followingList.some(
          (u: any) => u._id === userData._id
        );
        
        setIsFollowing(isUserFollowed);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [location, navigate]);

  const handleFollowToggle = async () => {
    if (!user) return;

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      if (previousState) {
        await unfollowUser(user._id);
      } else {
        await followUser(user._id);
      }
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      setIsFollowing(previousState);
      alert("Failed to update follow status. Please try again.");
    }
  };

  const handleMessage = async () => {
    if (!user) return;

    try {
      const conversationsRes = await getConversations();
      const conversations = conversationsRes.data?.conversations || conversationsRes.data || [];

      const existingConversation = conversations.find((conv: any) => {
        const participants = conv.participants || [];
        return participants.some((p: any) => {
          const participantId = typeof p === 'string' ? p : p._id;
          return participantId === user._id;
        });
      });

      if (existingConversation) {
        navigate("/messages", {
          state: { conversationId: existingConversation._id }
        });
      } else {
        navigate("/messages", {
          state: {
            newConversationWith: {
              userId: user._id,
              username: user.username,
              name: user.name,
              avatar: user.avatar,
            }
          }
        });
      }
    } catch (err) {
      console.error("Error opening conversation:", err);
      navigate("/messages");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">User not found</p>
          <button
            onClick={() => navigate("/discover")}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "posts" as const, label: "Posts", icon: FileText },
    { id: "media" as const, label: "Media", icon: Grid3x3 },
    { id: "likes" as const, label: "Likes", icon: Heart },
  ];

  const userPosts: any[] = [];
  const mediaPosts: any[] = [];
  const likedPosts: any[] = [];

  const getTabContent = () => {
    switch (activeTab) {
      case "posts":
        return userPosts.length ? (
          <div className="space-y-5">
            {userPosts.map((post) => (
              <div key={post.id}>Post content here</div>
            ))}
          </div>
        ) : (
          <EmptyState text="No posts yet" icon={FileText} />
        );

      case "media":
        return mediaPosts.length ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {mediaPosts.map((post) => (
              <div key={post.id} className="aspect-square bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <EmptyState text="No media posts yet" icon={Grid3x3} />
        );

      case "likes":
        return likedPosts.length ? (
          <div className="space-y-5">
            {likedPosts.map((post) => (
              <div key={post.id}>Post content here</div>
            ))}
          </div>
        ) : (
          <EmptyState text="No liked posts yet" icon={Heart} />
        );
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden">
      {/* Back Button */}
      <div className="px-4 md:px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-gray-100 w-full">
        <div className="w-full rounded-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 md:h-56 w-full rounded-lg overflow-hidden bg-gradient-to-r from-purple-200 to-pink-200">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-300 to-pink-300"></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6">
            {/* Avatar + Action Buttons */}
            <div className="flex items-end justify-between -mt-16 mb-3">
              <div className="relative">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                  alt={user.name || user.username}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all font-semibold text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>

                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-3 rounded-xl shadow-md transition-all font-semibold text-sm ${
                    isFollowing
                      ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {user.name || user.username}
              </h1>
              <p className="text-gray-500 text-base">@{user.username}</p>
            </div>

            {/* Tagline */}
            {user.tagline && (
              <p className="text-gray-600 text-lg font-medium mb-4">
                {user.tagline}
              </p>
            )}

            {/* Bio */}
            <p className="text-gray-700 text-base leading-relaxed mb-6 max-w-3xl">
              {user.bio || "No bio added yet"}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-gray-600 mb-6">
              {/* Location */}
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-600" />
                  <span>{user.location}</span>
                </div>
              )}

              {/* Joined Date */}
              {user.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}

              {/* Links */}
              {user.links?.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:underline"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pb-3 border-b border-gray-200">
              <StatItem value={userPosts.length} label="Posts" />
              <StatItem value={user.followers?.length || 0} label="Followers" />
              <StatItem value={user.following?.length || 0} label="Following" />
            </div>

            {/* Tabs */}
            <div className="flex gap-8 pt-2 pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-1 py-3 font-semibold text-sm relative ${
                      activeTab === tab.id
                        ? "text-purple-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 md:px-6 py-6">{getTabContent()}</div>
    </div>
  );
}

/* ---------- Components ---------- */

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="group">
      <span className="font-bold text-base text-gray-900 group-hover:text-purple-600 transition-colors">
        {value.toLocaleString()}
      </span>
      <span className="text-gray-600 text-sm ml-1">{label}</span>
    </div>
  );
}

function EmptyState({ text, icon: Icon }: { text: string; icon: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-gray-50 rounded-full">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-base text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  );
}