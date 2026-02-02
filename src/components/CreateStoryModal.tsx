import { useState } from "react";
import { X, Image as ImageIcon, Type } from "lucide-react";
import { compressImageToBase64 } from "../utils/imageCompression";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#8B5CF6");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const colors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
  ];

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedImage = await compressImageToBase64(file, {
        maxSizeMB: 1, // 1MB for story backgrounds
        maxWidthOrHeight: 1080,
      });
      setBackgroundImage(compressedImage);
    } catch (error) {
      console.error("Image compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreate = () => {
    console.log("Story created:", { text, bgColor, backgroundImage });
    setText("");
    setBackgroundImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div
            className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center"
            style={{
              backgroundColor: bgColor,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {text ? (
                <p className="text-white text-2xl font-bold text-center leading-relaxed drop-shadow-lg">
                  {text}
                </p>
              ) : (
                <p className="text-white/60 text-lg text-center">
                  {backgroundImage ? "Add text to your story" : "Add text or image to your story"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    bgColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <label className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <span>{backgroundImage ? "Change Photo" : "Add Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isCompressing}
                className="hidden"
              />
            </label>
            {backgroundImage && (
              <button
                onClick={() => setBackgroundImage(null)}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Remove
              </button>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!text.trim() || isCompressing}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              text.trim() && !isCompressing
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isCompressing ? "Compressing..." : "Create Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
