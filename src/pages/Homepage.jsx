import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { femalePersona, malePersona } from '../personas';

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden">
      {/* Simple, Smooth Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-purple-950/20"></div>

      {/* Subtle Animated Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x"></div>
      </div>

      {/* Minimal Interactive Glow */}
      <div
        className="absolute w-80 h-80 bg-gradient-radial from-cyan-400/10 via-purple-400/5 to-transparent rounded-full blur-3xl transition-all duration-1000 pointer-events-none"
        style={{
          left: mousePosition.x - 160,
          top: mousePosition.y - 160,
        }}
      ></div>

      {/* Subtle Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Minimal Floating Orbs */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className={`absolute rounded-full blur-2xl animate-float opacity-10 ${
              i === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
              i === 1 ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
              'bg-gradient-to-r from-violet-400 to-indigo-500'
            }`}
            style={{
              width: '120px',
              height: '120px',
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '12s'
            }}
          ></div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-3 sm:p-4">
        {/* Stunning Header Section */}
        <div className={`text-center mb-4 sm:mb-6 px-4 transition-all duration-1500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Main Title with Multiple Effects */}
          <div className="relative mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 mb-3 animate-gradient-x filter drop-shadow-2xl">
              AI Dost
            </h1>
            {/* Glowing Shadow Text */}
            <div className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-cyan-400/20 blur-sm animate-pulse -z-10">
              AI Dost
            </div>
            {/* Animated Underline */}
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full mx-auto animate-gradient-x shadow-lg shadow-purple-500/50"></div>
          </div>

          {/* Subtitle with Glow */}
          <p className="text-slate-200 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-4 filter drop-shadow-lg">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-semibold">intelligent companion</span> for meaningful conversations
          </p>

          {/* Enhanced Features with Icons */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700/50 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-slate-300 font-medium">Always Online</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700/50 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 font-medium">Super Smart</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700/50 shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
              <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 font-medium">Completely Free</span>
            </div>
          </div>
        </div>

        {/* Stunning Persona Cards */}
        <div className={`w-full max-w-4xl flex-1 flex items-center justify-center transition-all duration-1500 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 px-4 w-full">
            <PersonaCard persona={femalePersona} gender="female" index={0} />
            <PersonaCard persona={malePersona} gender="male" index={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonaCard = ({ persona, gender, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      to={`/chat/${gender}`}
      className="group relative block w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{ animationDelay: `${index * 200}ms` }}
    >
      {/* Subtle Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        gender === 'female'
          ? 'from-pink-500/20 to-purple-500/20'
          : 'from-cyan-500/20 to-blue-500/20'
      } rounded-2xl blur-xl transition-all duration-500 ${
        isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
      }`}></div>

      {/* Main Card Container */}
      <div className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border transition-all duration-300 backdrop-blur-sm p-6 sm:p-7 ${
        isHovered
          ? `border-${gender === 'female' ? 'pink' : 'cyan'}-400/50 shadow-xl shadow-${gender === 'female' ? 'pink' : 'cyan'}-500/20 scale-102`
          : 'border-slate-700/50 hover:border-slate-600/70 shadow-lg'
      } ${isPressed ? 'scale-98' : ''}`}>

        {/* Floating Status Indicators */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
            gender === 'female' ? 'bg-pink-400 shadow-pink-400/50' : 'bg-cyan-400 shadow-cyan-400/50'
          }`}></div>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">Online</span>
        </div>



        {/* Enhanced Avatar Section */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-4">
            {/* Avatar Image */}
            <img
              src={persona.avatar}
              alt={persona.name}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 transition-all duration-300 shadow-lg ${
                isHovered
                  ? `border-${gender === 'female' ? 'pink' : 'cyan'}-400 shadow-${gender === 'female' ? 'pink' : 'cyan'}-400/30 scale-105`
                  : 'border-slate-600 shadow-slate-900/30'
              }`}
            />

            {/* Online Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Enhanced Name */}
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300 ${
            gender === 'female'
              ? 'from-pink-300 via-purple-300 to-violet-300'
              : 'from-cyan-300 via-blue-300 to-indigo-300'
          } ${isHovered ? 'scale-105' : ''}`}>
            {persona.name}
          </h2>

          {/* Enhanced Tagline */}
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4 px-2 transition-all duration-300">
            {persona.tagline}
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50">
            <div className={`w-3 h-3 rounded-full ${gender === 'female' ? 'bg-pink-400' : 'bg-cyan-400'} shadow-lg`}></div>
            <span className="text-xs text-slate-300 font-medium">Friendly</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50">
            <div className={`w-3 h-3 rounded-full ${gender === 'female' ? 'bg-purple-400' : 'bg-blue-400'} shadow-lg`}></div>
            <span className="text-xs text-slate-300 font-medium">Smart</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50">
            <div className={`w-3 h-3 rounded-full ${gender === 'female' ? 'bg-pink-300' : 'bg-cyan-300'} shadow-lg`}></div>
            <span className="text-xs text-slate-300 font-medium">Hinglish</span>
          </div>
        </div>

        {/* Clean Action Button */}
        <button className={`w-full py-4 px-6 rounded-xl font-bold text-base text-center transition-all duration-300 ${
          gender === 'female'
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25'
        } ${isPressed ? 'scale-95' : isHovered ? 'scale-102' : ''}`}>
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chatting with {persona.name}
          </span>
        </button>
      </div>
    </Link>
  );
};

export default HomePage;