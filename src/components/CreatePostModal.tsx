import { useState } from "react";
import { X, Image as ImageIcon, Smile } from "lucide-react";
import { currentUser } from "../data/dummyData";
import { compressImageToBase64 } from "../utils/imageCompression";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setIsCompressing(true);
    try {
      const compressedImages = await Promise.all(
        Array.from(files).map((file) =>
          compressImageToBase64(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1280,
          })
        )
      );
      setImages((prev) => [...prev, ...compressedImages]);
    } catch (error) {
      console.error("Image compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ THIS WAS MISSING
  const handleSubmit = () => {
    if (!content.trim()) return;

    console.log("Post content:", content);
    console.log("Post images:", images);

    setContent("");
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {currentUser.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser.username}
              </p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-32 p-3 border rounded-xl resize-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <label className="p-2 hover:bg-purple-50 rounded-lg cursor-pointer">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>
              <button className="p-2 hover:bg-purple-50 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {content.length} / 500
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={content.trim().length === 0 || isCompressing}
            className={`w-full py-3 rounded-xl font-medium ${
              content.trim().length > 0 && !isCompressing
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isCompressing ? "Compressing..." : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
