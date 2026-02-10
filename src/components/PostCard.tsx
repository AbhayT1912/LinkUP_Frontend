import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Play,
  BarChart3,
  Send,
} from "lucide-react";
import {
  likePost,
  addComment,
  getPostComments,
} from "../services/post.service";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  const user = post.user;
  if (!user) return null;

  /* =========================
     LIKE STATE (BACKEND ALIGNED)
     ========================= */
  const [liked, setLiked] = useState<boolean>(
    post.likes?.includes(post.currentUserId),
  );
  const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);

  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(
    null,
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsCount, setCommentsCount] = useState(
    post.comments?.length || 0,
  );

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      setLoadingComments(true);
      const res = await getPostComments(post._id, 1);
      setComments(res.data.comments || []);
      setCommentsPage(1);
      setShowComments(true);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment(post._id, commentText);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  /* =========================
     HANDLE LIKE
     ========================= */
  const handleLike = async () => {
    try {
      const res = await likePost(post._id);

      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  /* =========================
     POLL VOTE (UI ONLY FOR NOW)
     ========================= */
  const handlePollVote = (index: number) => {
    if (selectedPollOption !== null) return;
    setSelectedPollOption(index);
  };

  const renderPollOption = (
    option: { text: string; votes: number },
    index: number,
  ) => {
    const totalVotes = post.poll.totalVotes || 1;
    const percentage = (option.votes / totalVotes) * 100;
    const isSelected = selectedPollOption === index;
    const hasVoted = selectedPollOption !== null;

    return (
      <motion.button
        key={index}
        onClick={() => handlePollVote(index)}
        disabled={hasVoted}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={!hasVoted ? { scale: 1.02, x: 5 } : {}}
        whileTap={!hasVoted ? { scale: 0.98 } : {}}
        className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : hasVoted
              ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
        } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
      >
        {hasVoted && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-xl transition-all"
          />
        )}
        <div className="relative flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">
            {option.text}
          </span>
          {hasVoted && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-bold text-purple-600 dark:text-purple-400"
            >
              {percentage.toFixed(1)}%
            </motion.span>
          )}
        </div>
        {hasVoted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative text-xs text-gray-500 dark:text-gray-400 mt-1 block"
          >
            {option.votes.toLocaleString()} votes
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <motion.img
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            src={user.avatar}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <motion.p
              whileHover={{ x: 3 }}
              className="font-semibold text-gray-900 dark:text-white"
            >
              {user.username}
            </motion.p>
          </div>
        </motion.div>
        <motion.button
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      {/* Caption */}
      {post.caption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 pb-3"
        >
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {post.caption}
          </p>
        </motion.div>
      )}

      {/* Media (Images) */}
      {post.media?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="px-4 pb-3"
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            src={post.media[0]}
            alt="Post content"
            className="w-full rounded-xl object-cover max-h-96 cursor-pointer"
          />
        </motion.div>
      )}

      {/* Poll */}
      {post.type === "poll" && post.poll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-3"
        >
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <span className="font-medium text-gray-900 dark:text-white">
                {post.poll.question}
              </span>
            </motion.div>
            <div className="space-y-2">
              {post.poll.options.map(renderPollOption)}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2"
            >
              <span>{post.poll.totalVotes.toLocaleString()} votes</span>
              <span>{post.poll.endsAt}</span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between"
      >
        <motion.button
          onClick={handleLike}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            liked
              ? "text-pink-600 bg-pink-50 dark:bg-pink-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <motion.div
            animate={liked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          </motion.div>
          <motion.span
            key={likesCount}
            initial={{ scale: 1.5, color: "#ec4899" }}
            animate={{ scale: 1, color: liked ? "#ec4899" : "currentColor" }}
            className="text-sm font-medium"
          >
            {likesCount}
          </motion.span>
        </motion.button>

        <motion.button
          onClick={toggleComments}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
        >
          <motion.div
            animate={showComments ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            <MessageCircle className="w-5 h-5" />
          </motion.div>
          <span className="text-sm font-medium">{commentsCount}</span>
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.1, y: -2 }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all cursor-pointer"
        >
          <motion.div whileHover={{ rotate: -15 }}>
            <Share2 className="w-5 h-5" />
          </motion.div>
          <span className="text-sm font-medium">{post.shares || 0}</span>
        </motion.div>
      </motion.div>

      {/* Comments dropdown */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {loadingComments ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400 py-3"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading comments…
                </motion.span>
              </motion.p>
            ) : comments.length === 0 ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-400 py-3"
              >
                No comments yet
              </motion.p>
            ) : (
              <div className="space-y-3 pt-3">
                <AnimatePresence>
                  {comments.map((c, index) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3"
                    >
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={c.user.avatar}
                        alt={c.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02, x: 2 }}
                        className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm"
                      >
                        <span className="font-semibold mr-1 text-gray-900 dark:text-white">
                          {c.user.username}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {c.text}
                        </span>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 pt-3">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && commentText.trim()) {
                handleAddComment();
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
          />

          <motion.button
  onClick={handleAddComment}
  disabled={!commentText.trim()}
  whileHover={commentText.trim() ? { scale: 1.1 } : {}}
  whileTap={commentText.trim() ? { scale: 0.9 } : {}}
  className="
    p-2 rounded-full
    bg-purple-500 hover:bg-purple-600
    disabled:bg-gray-200 dark:disabled:bg-gray-700
    disabled:cursor-not-allowed
    transition-all
  "
>
  <Send
    size={16}
    strokeWidth={2.2}
    className="text-black dark:text-white"
  />
</motion.button>

        </div>
      </motion.div>
    </motion.div>
  );
}
