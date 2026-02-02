import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { register, checkUsername } from "../services/auth.service";
import { uploadAvatar } from "../services/user.service";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, password } = location.state || {};

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [locationText, setLocationText] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  /* -------------------------
     Username availability
     ------------------------- */
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setUsernameStatus("checking");
        const res = await checkUsername(username);
        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  /* -------------------------
     Guard route
     ------------------------- */
  useEffect(() => {
    if (!email || !password) {
      navigate("/auth");
    }
  }, [email, password, navigate]);

  /* -------------------------
     Register
     ------------------------- */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate before submitting
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (usernameStatus === "taken") {
      setError("Username is already taken");
      setLoading(false);
      return;
    }

    if (usernameStatus === "checking") {
      setError("Please wait while we check username availability");
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Register user (NO avatar yet)
      const res = await register({
        name,
        username,
        email,
        password,
        bio,
        location: locationText,
      });

      const token = res.data.token;
      const userId = res.data.user.id;
      localStorage.setItem("token", token);

      // 2️⃣ Upload avatar AFTER register
      if (avatar) {
        await uploadAvatar(avatar, userId);
      }

      navigate("/");
    } catch (err: any) {
      console.error("Register error details:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err.response?.data,
        errorMsg: err.message,
      });
      setError(
        err.response?.data?.message || 
        err.response?.data?.stack?.split('\n')[0] ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" />

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Complete your profile</h1>
        <p className="text-gray-600 mb-6">
          Just one step before entering <span className="font-semibold">LinkUp</span> 🚀
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              value={email || ""}
              disabled
              className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="Your name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition ${
                usernameStatus === "available"
                  ? "border-green-500 focus:ring-green-500"
                  : usernameStatus === "taken"
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-purple-500"
              }`}
              placeholder="your_username"
            />
          </div>

          {usernameStatus === "checking" && (
            <p className="text-sm text-gray-500">Checking availability…</p>
          )}
          {usernameStatus === "available" && (
            <p className="text-sm text-green-600">Username is available ✅</p>
          )}
          {usernameStatus === "taken" && (
            <p className="text-sm text-red-600">Username already taken ❌</p>
          )}

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell something about yourself..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="City, Country"
            />
          </div>

          {/* Avatar */}
          <div className="border border-dashed rounded-xl p-4 text-center">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setAvatar(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-24 h-24 mx-auto rounded-full object-cover shadow-md mb-2"
                />
              ) : (
                <p className="text-gray-500">Upload profile photo</p>
              )}
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || usernameStatus !== "available"}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Enter LinkUp"}
          </button>
        </form>
      </div>
    </div>
  );
}
