import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, BarChart3 } from "lucide-react";
import { Post, users } from "../data/dummyData";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked || false);
  const [likes, setLikes] = useState(post.likes);
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);

  const user = users.find(u => u.id === post.userId);
  if (!user) return null;

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
    }
  };

  const handlePollVote = (optionId: string) => {
    if (!selectedPollOption) {
      setSelectedPollOption(optionId);
    }
  };

  const renderPollOption = (option: { id: string; text: string; votes: number }) => {
    const percentage = post.poll ? (option.votes / post.poll.totalVotes) * 100 : 0;
    const isSelected = selectedPollOption === option.id;
    const hasVoted = selectedPollOption !== null;

    return (
      <button
        key={option.id}
        onClick={() => handlePollVote(option.id)}
        disabled={hasVoted}
        className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : hasVoted
            ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
        } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
      >
        {hasVoted && (
          <div
            className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-xl transition-all"
            style={{ width: `${percentage}%` }}
          />
        )}
        <div className="relative flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
          {hasVoted && (
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
        {hasVoted && (
          <span className="relative text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {option.votes.toLocaleString()} votes
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              {user.verified && (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.username} · {post.timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.type === "image" && post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Post Video */}
      {post.type === "video" && post.video && (
        <div className="px-4 pb-3">
          <div className="relative w-full rounded-xl overflow-hidden bg-black group">
            <video
              src={post.video}
              controls
              className="w-full max-h-96 object-contain"
              poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
              <Play className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Poll */}
      {post.type === "poll" && post.poll && (
        <div className="px-4 pb-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">{post.poll.question}</span>
            </div>
            <div className="space-y-2">
              {post.poll.options.map(renderPollOption)}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2">
              <span>{post.poll.totalVotes.toLocaleString()} votes</span>
              <span>{post.poll.endsAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            liked
              ? "text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{likes}</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments}</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>
    </div>
  );
}