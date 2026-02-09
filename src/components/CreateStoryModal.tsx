import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { addStory } from "../services/story.service";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated?: () => void; // NEW: Callback to refresh stories
}

export function CreateStoryModal({ isOpen, onClose, onStoryCreated }: CreateStoryModalProps) {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#8B5CF6");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [addToHighlight, setAddToHighlight] = useState(false);

  const colors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
  ];

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("📷 Image selected:", file.name, file.size, file.type);
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBackgroundImage(ev.target?.result as string);
      console.log("✅ Preview created");
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    // Validation
    if (!text.trim() && !imageFile) {
      alert("Please add text or an image to your story");
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      
      console.log("🔧 Building FormData...");
      
      // Add image FIRST if selected
      if (imageFile) {
        formData.append("media", imageFile);
        console.log("📎 Appending image to formData:", imageFile.name);
      }
      
      // Add text if provided
      if (text.trim()) {
        formData.append("text", text.trim());
        console.log("📝 Appending text");
      }
      
      // Add background color ONLY if no image
      if (!imageFile && bgColor) {
        formData.append("bgColor", bgColor);
        console.log("🎨 Appending bgColor:", bgColor);
      }
      
      // Add highlight preference
      formData.append("addToHighlight", String(addToHighlight));

      console.log("📤 Creating story with formData...");
      
      await addStory(formData);
      
      console.log("✅ Story created successfully!");
      
      // Reset form
      setText("");
      setBackgroundImage(null);
      setImageFile(null);
      setBgColor("#8B5CF6");
      setAddToHighlight(false);
      
      // Close modal
      onClose();
      
      // Trigger refresh in parent component
      if (onStoryCreated) {
        onStoryCreated();
      }
      
    } catch (error) {
      console.error("❌ Failed to create story:", error);
      alert("Failed to create story. Please check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
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
        <div className="p-4 flex justify-center bg-gray-50">
          <div
            className="relative w-[60%] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl"
            style={{
              backgroundColor: !backgroundImage ? bgColor : "#000",
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {text ? (
                <p className={`text-white text-xl font-bold text-center leading-relaxed ${backgroundImage ? 'drop-shadow-lg' : ''}`}>
                  {text}
                </p>
              ) : (
                <p className="text-white/60 text-base text-center">
                  {backgroundImage ? "Add text (optional)" : "Add text or image"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Text {backgroundImage && <span className="text-gray-400">(Optional)</span>}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {text.length}/300
            </p>
          </div>

          {/* Color Picker - Only show if no image */}
          {!backgroundImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      bgColor === color
                        ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image {text && <span className="text-gray-400">(Optional)</span>}
            </label>
            <div className="flex gap-2">
              <label className="flex-1 py-3 px-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer border border-purple-200">
                <ImageIcon className="w-5 h-5" />
                <span>{backgroundImage ? "Change Photo" : "Add Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isCreating}
                  className="hidden"
                />
              </label>
              {backgroundImage && (
                <button
                  onClick={() => {
                    setBackgroundImage(null);
                    setImageFile(null);
                  }}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Add to Highlights Toggle */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Add to Highlights
            </span>
            <button
              onClick={() => setAddToHighlight((prev) => !prev)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                addToHighlight ? "bg-purple-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform transition-transform ${
                  addToHighlight ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={(!text.trim() && !imageFile) || isCreating}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              (text.trim() || imageFile) && !isCreating
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isCreating ? "Creating..." : "Create Story"}
          </button>
        </div>
      </div>
    </div>
  );
}