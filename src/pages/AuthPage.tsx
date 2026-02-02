import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import logo from "../assets/updatedlogo.png";

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 404) {
        navigate("/register", {
          state: {
            email,
            password,
          },
        });
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Multiple animated gradient orbs with different sizes and speeds */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-[450px] h-[450px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-slow animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-slow animation-delay-3000"></div>

        {/* Floating geometric shapes - more variety */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-purple-300 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-pink-300 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 border-2 border-blue-300 rounded-lg animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 border-2 border-purple-300 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute top-1/3 right-10 w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-lg animate-float animation-delay-1500"></div>
        <div className="absolute bottom-1/3 left-20 w-10 h-10 bg-gradient-to-br from-pink-300 to-blue-300 rounded-full animate-float animation-delay-2500"></div>

        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-10 w-14 h-14 border-2 border-indigo-200 rounded-full animate-float-reverse animation-delay-500"></div>
        <div className="absolute top-3/4 right-1/4 w-16 h-16 border-2 border-rose-200 rounded-lg rotate-12 animate-float-reverse animation-delay-1500"></div>
        <div className="absolute top-10 left-1/3 w-10 h-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full animate-float animation-delay-3500"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-gradient-to-br from-pink-200 to-indigo-200 rounded-lg animate-float-reverse animation-delay-2000"></div>

        {/* Sparkle/star elements */}
        <div className="absolute top-32 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
        <div className="absolute top-2/3 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-1500"></div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Section - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3">
              <img
                src={logo}
                alt="LinkUp Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600">
              LinkUp
            </span>
          </div>

          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              More than just friends,
              <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600">
                truly connect
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join a vibrant community where meaningful connections happen.
              Share your story, discover new perspectives, and build
              relationships that matter.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-4 animate-fade-in">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-purple-700">
                ✨ Authentic Connections
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-pink-700">
                💬 Real Conversations
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <span className="text-sm font-medium text-blue-700">
                🌟 Share Your Story
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in-right">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 hover:shadow-3xl transition-all duration-500 border border-white/20">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <img
                  src={logo}
                  alt="LinkUp Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600">
                LinkUp
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">Sign in to continue your journey</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 hover:border-purple-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 hover:border-purple-300"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-700 group-hover:text-purple-600 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-all"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] text-white rounded-xl hover:shadow-xl transition-all shadow-lg font-medium text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] animate-gradient-slow"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes blob-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.15);
          }
          66% {
            transform: translate(30px, -30px) scale(0.85);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-10deg);
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          0% {
            opacity: 0;
            transform: translateX(20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-blob-slow {
          animation: blob-slow 10s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 5s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-gradient-slow {
          animation: gradient 8s ease infinite;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out 0.1s both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.4s both;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-2500 {
          animation-delay: 2.5s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-3500 {
          animation-delay: 3.5s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Animated wave at EXTREME BOTTOM - at root level outside constrained divs */}
      {/* Animated wave at EXTREME BOTTOM */}
      <div
        className="fixed left-0 right-0 h-80 pointer-events-none z-10"
        style={{ bottom: "-20px", opacity: 0.30 }}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#a855f7"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,58.7C672,64,768,96,864,101.3C960,107,1056,85,1152,80C1248,75,1344,85,1392,90.7L1440,96L1440,120L0,120Z"
            className="animate-wave"
          />
        </svg>
      </div>
    </div>
  );
}
