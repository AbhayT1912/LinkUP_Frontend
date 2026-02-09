import { useEffect, useState } from "react";
import { X, Image as ImageIcon, Smile } from "lucide-react";
import { compressImageToBase64 } from "../utils/imageCompression";
import { createPost } from "../services/post.service";
import { getMyProfile } from "../services/user.service";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* =========================
     FETCH LOGGED-IN USER
     ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  /* =========================
     SUBMIT POST
     ========================= */
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    const formData = new FormData();
    formData.append("caption", content);

    // Convert base64 images to File objects
    for (let i = 0; i < images.length; i++) {
  const res = await fetch(images[i]);
  const blob = await res.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Invalid image file");
  }

  const file = new File([blob], `post-${Date.now()}-${i}.jpg`, {
    type: blob.type,
  });

  formData.append("media", file);
}


    try {
      await createPost(formData);
      setContent("");
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  /* =========================
     IMAGE UPLOAD
     ========================= */
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
              alt={currentUser.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
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
            disabled={
              (content.trim().length === 0 && images.length === 0) ||
              isCompressing
            }
            className={`w-full py-3 rounded-xl font-medium ${
              (content.trim().length > 0 || images.length > 0) && !isCompressing
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
