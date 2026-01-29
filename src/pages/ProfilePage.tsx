import { useState } from "react";
import {
  MapPin,
  Calendar,
  Settings,
  Grid3x3,
  Heart,
  FileText,
  Link2,
  Briefcase,
} from "lucide-react";
import { currentUser, posts } from "../data/dummyData";
import { PostCard } from "../components/PostCard";

type ProfileTab = "posts" | "media" | "likes";

interface ProfilePageProps {
  onEditProfile: () => void;
}

export function ProfilePage({ onEditProfile }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const userPosts = posts.filter((post) => post.userId === currentUser.id);
  const mediaPosts = posts.filter(
    (post) => post.image && post.userId === currentUser.id
  );
  const likedPosts = posts.filter((post) => post.liked);

  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "posts", label: "Posts", icon: FileText },
    { id: "media", label: "Media", icon: Grid3x3 },
    { id: "likes", label: "Likes", icon: Heart },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case "posts":
        return userPosts.length ? (
          <div className="space-y-5">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState text="No posts yet" icon={FileText} />
        );

      case "media":
        return mediaPosts.length ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {mediaPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative"
              >
                <img
                  src={post.image}
                  alt="Post media"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No media posts yet" icon={Grid3x3} />
        );

      case "likes":
        return likedPosts.length ? (
          <div className="space-y-5">
            {likedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState text="No liked posts yet" icon={Heart} />
        );
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden">
      {/* PROFILE HEADER */}
      <div className="bg-gray-100 w-full mt-6">
        {/* Constrained profile width */}
        <div className="w-full rounded-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 md:h-56 w-full rounded-lg overflow-hidden">
            <img
              src={currentUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6">
            {/* Avatar + Button */}
            <div className="flex items-end justify-between -mt-16 mb-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
              </div>

              <button
                onClick={onEditProfile}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Name */}
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {currentUser.name}
                </h1>
                {currentUser.verified && (
                  <svg
                    className="w-6 h-6 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <p className="text-gray-500 text-base">
                {currentUser.username}
              </p>
            </div>

            {/* Bio */}
            <p className="text-gray-700 text-base leading-relaxed mb-4 max-w-3xl">
              {currentUser.bio}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Designer & Creative
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-600" />
                {currentUser.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Joined {currentUser.joinDate}
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 hover:underline cursor-pointer">
                <Link2 className="w-4 h-4" />
                portfolio.com
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pb-3 border-b border-gray-200">
              <StatItem value={currentUser.posts} label="Posts" />
              <StatItem value={currentUser.followers} label="Followers" />
              <StatItem value={currentUser.following} label="Following" />
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
      <div className="px-4 md:px-6 py-6">

        {getTabContent()}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <button className="group">
      <span className="font-bold text-base text-gray-900 group-hover:text-purple-600 transition-colors">
        {value.toLocaleString()}
      </span>
      <span className="text-gray-600 text-sm ml-1">{label}</span>
    </button>
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
