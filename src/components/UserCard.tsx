import { useState } from "react";
import { MapPin, UserPlus, UserCheck } from "lucide-react";
import { User } from "../data/dummyData";
import { Link } from "react-router";

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  showViewProfile?: boolean;
}

export function UserCard({ user, showFollowButton = true, showViewProfile = false }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
            {user.verified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">{user.username}</p>
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">{user.bio}</p>
          
          {user.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <MapPin className="w-3 h-3" />
              <span>{user.location}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm mb-4">
            <div>
              <span className="font-semibold text-gray-900">{user.followers.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{user.following.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">Following</span>
            </div>
          </div>

          <div className="flex gap-2">
            {showViewProfile && (
              <Link
                to="/profile"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
              >
                View Profile
              </Link>
            )}
            {showFollowButton && (
              <button
                onClick={handleFollow}
                className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
