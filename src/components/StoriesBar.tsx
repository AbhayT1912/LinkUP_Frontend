import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { viewStory } from "../services/story.service";

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
  media?: string | null;
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
  useEffect(() => {
    // Track story view
    const trackView = async () => {
      try {
        await viewStory(story._id);
        console.log("Story view tracked for:", story._id);
      } catch (error) {
        console.error("Failed to track story view:", error);
      }
    };
    
    trackView();
    
    // Auto-close after 10 seconds
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [story._id, onClose]);

  console.log("StoryViewer rendering with:", story);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-4xl font-light z-[10000] hover:opacity-80"
        style={{ position: 'absolute', top: '24px', right: '24px' }}
      >
        ×
      </button>

      {/* Story Container */}
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: '360px',
          height: '640px',
          backgroundColor: '#000'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div 
          className="absolute z-30"
          style={{
            top: '8px',
            left: '8px',
            right: '8px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px'
          }}
        >
          <div 
            className="h-full bg-white rounded animate-story-progress"
            style={{
              height: '100%',
              backgroundColor: '#fff',
              borderRadius: '2px',
              animation: 'story-progress 10s linear forwards'
            }}
          />
        </div>

        {/* User info */}
        <div 
          className="absolute z-30 flex items-center gap-3"
          style={{
            top: '24px',
            left: '16px',
            right: '16px'
          }}
        >
          <img
            src={story.user.avatar}
            className="rounded-full object-cover border-2 border-white"
            style={{
              width: '40px',
              height: '40px'
            }}
            alt={story.user.username}
          />
          <span 
            className="text-white font-semibold text-sm"
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {story.user.username}
          </span>
        </div>

        {/* Story Content */}
        {story.media && story.media !== "null" && story.media !== null ? (
          // IMAGE STORY
          <div 
            className="absolute inset-0"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <img
              src={story.media}
              alt="story"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Text overlay on image if text exists */}
            {story.text && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px'
                }}
              >
                <p 
                  className="text-white text-2xl font-bold text-center"
                  style={{
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                  }}
                >
                  {story.text}
                </p>
              </div>
            )}
          </div>
        ) : (
          // TEXT STORY
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: story.bgColor || "#8B5CF6",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px'
            }}
          >
            <p 
              className="text-white text-3xl font-bold text-center"
              style={{
                color: '#fff',
                fontSize: '32px',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: '1.5'
              }}
            >
              {story.text || "No content"}
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
      {story.media && story.media !== "null" && story.media !== null ? (
        <img
          src={story.media}
          alt={`${story.user.username}'s story`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center p-3"
          style={{ backgroundColor: story.bgColor || "#8B5CF6" }}
        >
          <p className="text-white text-sm font-semibold text-center line-clamp-4">
            {story.text}
          </p>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Avatar */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden ring-2 ring-purple-500">
          <img
            src={story.user.avatar}
            alt={story.user.username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Username */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <p className="text-white text-sm font-medium truncate drop-shadow">
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

  console.log("StoriesBar render - activeStory:", activeStory);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        <StoryCard isCreate onClick={onCreateStory} />

        {stories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            onClick={() => {
              console.log('Story card clicked, setting activeStory:', story);
              setActiveStory(story);
            }}
          />
        ))}
      </div>

      {activeStory !== null && (
        <StoryViewer
          story={activeStory}
          onClose={() => {
            console.log('Closing story viewer');
            setActiveStory(null);
          }}
        />
      )}
    </>
  );
}