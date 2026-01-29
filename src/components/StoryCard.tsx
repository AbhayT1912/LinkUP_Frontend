import { Plus } from "lucide-react";
import { Story, users, currentUser } from "../data/dummyData";

interface StoryCardProps {
  story?: Story;
  isCreate?: boolean;
  onClick?: () => void;
}

export function StoryCard({ story, isCreate, onClick }: StoryCardProps) {
  if (isCreate) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-28 h-44 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-2 border-dashed border-purple-300 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-200 hover:via-pink-200 hover:to-blue-200 transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">Create Story</span>
      </button>
    );
  }

  if (!story) return null;

  const user = users.find(u => u.id === story.userId);
  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-28 h-44 rounded-2xl overflow-hidden group cursor-pointer"
    >
      <img
        src={story.image}
        alt={`${user.name}'s story`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      {/* User Avatar */}
      <div className="absolute top-3 left-3">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden ring-2 ring-purple-500">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* User Name */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-sm font-medium truncate drop-shadow-lg">
          {user.name}
        </p>
      </div>
    </button>
  );
}
