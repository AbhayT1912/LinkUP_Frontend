import { MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { getConversations } from "../services/message.service";
import { getUserByUsername } from "../services/user.service";

interface User {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

interface UserCardProps {
  user: User;
  isFollowing: boolean;
  onFollowToggle: () => void;
  showFollowButton?: boolean;
  showViewProfile?: boolean;
  showMessageButton?: boolean;
  disableFollow?: boolean;
}

export function UserCard({
  user,
  isFollowing,
  onFollowToggle,
  showFollowButton = true,
  showViewProfile = false,
  showMessageButton = false,
  disableFollow = false,
}: UserCardProps) {
  const navigate = useNavigate();
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  /* =========================
     HANDLE VIEW PROFILE - Using getUserByUsername API
     ========================= */
  const handleViewProfile = async () => {
    try {
      setIsLoadingProfile(true);

      // Fetch user data using the API
      const response = await getUserByUsername(user.username);
      const userData = response.data.user || response.data;

      // Navigate to public profile with fetched user data
      navigate("/public-profile", {
        state: { user: userData },
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      alert("Failed to load profile. Please try again.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /* =========================
     HANDLE MESSAGE BUTTON CLICK
     ========================= */
  const handleMessage = async () => {
    try {
      setIsLoadingMessage(true);

      const conversationsRes = await getConversations();
      const conversations =
        conversationsRes.data?.conversations || conversationsRes.data || [];

      const existingConversation = conversations.find((conv: any) => {
        const participants = conv.participants || [];
        return participants.some((p: any) => {
          const participantId = typeof p === "string" ? p : p._id;
          return participantId === user._id;
        });
      });

      if (existingConversation) {
        navigate("/messages", {
          state: { conversationId: existingConversation._id },
        });
      } else {
        navigate("/messages", {
          state: {
            newConversationWith: {
              userId: user._id,
              username: user.username,
              name: user.name,
              avatar: user.avatar,
            },
          },
        });
      }
    } catch (err) {
      console.error("Error opening conversation:", err);
      navigate("/messages");
    } finally {
      setIsLoadingMessage(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* User Info */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
          }
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-lg">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">@{user.username}</p>

          {user.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{user.bio}</p>
      )}

      {/* ✅ CORRECT BUTTON LAYOUT */}
      <div className="flex flex-col gap-2.5">
        {/* TOP ROW: View Profile (left) + Message (right) */}
        <div className="flex gap-2.5">
          {showViewProfile && (
            <button
              onClick={handleViewProfile}
              disabled={isLoadingProfile}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingProfile ? "Loading..." : "View Profile"}
            </button>
          )}

          {showMessageButton && (
            <button
              onClick={handleMessage}
              disabled={isLoadingMessage}
              className="
    flex-1 px-4 py-3
    bg-white
    text-blue-600
    border-2 border-blue-500
    rounded-lg
    text-sm font-semibold
    flex items-center justify-center gap-2
    hover:bg-blue-50
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  "
            >
              <MessageCircle className="w-4 h-4" />
              {isLoadingMessage ? "..." : "Message"}
            </button>
          )}
        </div>

        {/* BOTTOM ROW: Follow/Unfollow (full width) */}
        {showFollowButton && (
          <button
            onClick={disableFollow ? undefined : onFollowToggle}
            disabled={disableFollow}
            className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              isFollowing
                ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            } ${
              disableFollow ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
