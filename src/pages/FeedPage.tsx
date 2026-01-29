import { StoryCard } from "../components/StoryCard";
import { PostCard } from "../components/PostCard";
import { posts, stories, users, conversations } from "../data/dummyData";
import { TrendingUp, MessageCircle } from "lucide-react";

interface FeedPageProps {
  onCreateStory: () => void;
}

export function FeedPage({ onCreateStory }: FeedPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stories Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <StoryCard isCreate onClick={onCreateStory} />
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Trending Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {["#WebDevelopment", "#Design", "#Entrepreneurship", "#Photography", "#AI"].map(
                (tag, index) => (
                  <button
                    key={tag}
                    className="w-full text-left p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                  >
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {tag}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(Math.random() * 10 + 1).toFixed(1)}k posts
                    </p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
            </div>
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => {
                const user = users.find((u) => u.id === conv.userId);
                if (!user) return null;
                return (
                  <button
                    key={conv.userId}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{conv.unread}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{conv.timestamp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sponsored */}
          <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800 p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Sponsored</p>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Boost Your Brand
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Reach thousands of engaged users with targeted advertising.
            </p>
            <button className="w-full py-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium text-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}