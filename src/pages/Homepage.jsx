import React from 'react';
import { Link } from 'react-router-dom';
import { femalePersona, malePersona } from '../personas';

const HomePage = () => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center p-4 md:p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-y-auto">
      <div className="text-center mb-10 md:mb-16">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 pb-2">
          AI Dost
        </h1>
        <p className="text-slate-400 text-base sm:text-lg md:text-xl mt-2 max-w-xl">
          Choose your AI friend. Someone who listens, available 24/7.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-10">
        <PersonaCard persona={femalePersona} gender="female" />
        <div className="text-slate-500 font-bold text-lg md:hidden">OR</div>
        <PersonaCard persona={malePersona} gender="male" />
      </div>
    </div>
  );
};

const PersonaCard = ({ persona, gender }) => (
  <Link
    to={`/chat/${gender}`}
    className="group w-72 sm:w-80 flex flex-col items-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400 hover:scale-105"
  >
    <img
      src={persona.avatar}
      alt={persona.name}
      className="w-40 h-40 rounded-full border-4 object-cover border-slate-700 group-hover:border-cyan-400 transition-all duration-300"
    />
    <div className="text-center mt-5">
      <h2 className="text-3xl font-bold text-white">{persona.name}</h2>
      <p className="text-slate-400 mt-1 h-12">{persona.tagline}</p>
    </div>
    <div className="w-full mt-4 py-3 bg-slate-700 rounded-lg font-semibold text-center transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-black">
      Start Chatting
    </div>
  </Link>
);

export default HomePage;