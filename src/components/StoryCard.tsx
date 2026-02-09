import { useState } from "react";
import { Plus } from "lucide-react";

/* =========================
   TYPES
   ========================= */

interface StoryUser {
  _id: string;
  username: string;
  avatar: string;
}

export interface Story {
  _id: string;
  type: "text" | "image";
  text?: string;
  bgColor?: string;
  media?: string;
  user: StoryUser;
}

/* =========================
   STORY VIEWER
   ========================= */

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

function StoryViewer({ story, onClose }: StoryViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white text-3xl font-light"
      >
        ×
      </button>

      <div className="w-[360px] aspect-[9/16] rounded-2xl overflow-hidden relative">
        {story.media ? (
          <img
            src={story.media}
            alt="story"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center px-6"
            style={{ backgroundColor: story.bgColor || "#000" }}
          >
            <p className="text-white text-2xl font-bold text-center">
              {story.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   STORY CARD
   ========================= */

interface StoryCardProps {
  story?: Story;
  isCreate?: boolean;
  onClick?: () => void;
}

function StoryCard({ story, isCreate, onClick }: StoryCardProps) {
  if (isCreate) {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 w-28 h-44 rounded-2xl
        bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100
        border-2 border-dashed border-purple-300
        flex flex-col items-center justify-center gap-2
        hover:border-purple-400 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          Create Story
        </span>
      </button>
    );
  }

  if (!story) return null;

  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-28 h-44 rounded-2xl overflow-hidden group cursor-pointer"
    >
      {/* Background */}
      {story.media ? (
        <img
          src={story.media}
          alt={`${story.user.username}'s story`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center p-3"
          style={{ backgroundColor: story.bgColor || "#000" }}
        >
          <p className="text-white text-sm font-semibold text-center">
            {story.text}
          </p>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Avatar */}
      <div className="absolute top-3 left-3">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden ring-2 ring-purple-500">
          <img
            src={story.user.avatar}
            alt={story.user.username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Username */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-sm font-medium truncate">
          {story.user.username}
        </p>
      </div>
    </button>
  );
}

/* =========================
   STORIES BAR (MAIN EXPORT)
   ========================= */

interface StoriesBarProps {
  stories: Story[];
  onCreateStory: () => void;
}

export default function StoriesBar({
  stories,
  onCreateStory,
}: StoriesBarProps) {
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        <StoryCard isCreate onClick={onCreateStory} />

        {stories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            onClick={() => setActiveStory(story)}
          />
        ))}
      </div>

      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </>
  );
}
