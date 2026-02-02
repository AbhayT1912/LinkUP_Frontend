import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadCoverImage,
} from "../services/user.service";
import { compressImageToBase64 } from "../utils/imageCompression";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    tagline: "",
    links: [{ label: "", url: "" }],
  });

  /* -------------------------
     Fetch current user
     ------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const fetchUser = async () => {
      const res = await getMyProfile();
      const user = res.data.user;

      setFormData({
        name: user.name || "",
        username: user.username,
        bio: user.bio || "",
        location: user.location || "",
        tagline: user.tagline || "",
        links: user.links?.length ? user.links : [{ label: "", url: "" }],
      });

      setAvatarPreview(user.avatar || null);
      setCoverPreview(user.coverImage || null);
    };

    fetchUser();
  }, [isOpen]);

  if (!isOpen) return null;

  /* -------------------------
     Save changes
     ------------------------- */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateMyProfile(formData);

      if (avatarPreview && avatarPreview.startsWith("data:")) {
        await uploadAvatar(avatarPreview);
      }

      if (coverPreview && coverPreview.startsWith("data:")) {
        await uploadCoverImage(coverPreview);
      }

      onClose();
    } catch (err) {
      console.error("Profile update failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
     Image handler
     ------------------------- */
  const handleImageChange = async (
    file: File,
    setter: (val: string) => void
  ) => {
    try {
      // Compress avatar to 500KB, cover to 1MB
      const isAvatar = setter === setAvatarPreview;
      const maxSizeMB = isAvatar ? 0.5 : 1;

      const compressedBase64 = await compressImageToBase64(file, {
        maxSizeMB,
        maxWidthOrHeight: isAvatar ? 400 : 1200,
      });

      setter(compressedBase64);
    } catch (error) {
      console.error("Image compression failed:", error);
      // Fallback to original if compression fails
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Photo
            </label>
            <label className="relative w-full h-32 rounded-xl overflow-hidden cursor-pointer block">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files &&
                  handleImageChange(e.target.files[0], setCoverPreview)
                }
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </label>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <label className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer block">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  e.target.files &&
                  handleImageChange(e.target.files[0], setAvatarPreview)
                }
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>

          {/* Name */}
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Name"
          />

          {/* Username */}
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Username"
          />

          {/* Bio */}
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border rounded-xl resize-none"
            placeholder="Bio"
          />

           <div>
          <label className="block text-sm font-medium mb-2">Tagline</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) =>
              setFormData({ ...formData, tagline: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Short tagline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Links
          </label>

          {formData.links.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Label (GitHub, LinkedIn)"
                value={link.label}
                onChange={(e) => {
                  const updated = [...formData.links];
                  updated[index].label = e.target.value;
                  setFormData({ ...formData, links: updated });
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => {
                  const updated = [...formData.links];
                  updated[index].url = e.target.value;
                  setFormData({ ...formData, links: updated });
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                links: [...formData.links, { label: "", url: "" }],
              })
            }
            className="text-sm text-purple-600 font-medium"
          >
            + Add link
          </button>
        </div>

          {/* Location */}
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Location"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
