import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { femalePersona, malePersona } from '../personas';

const API_KEY = "AIzaSyCrNTLrWGxffTfN5XZAzaQ_HvfYZ8zHDq0";

const genAI = new GoogleGenerativeAI(API_KEY);

const ChatPage = () => {
  const { gender } = useParams();
  const persona = gender === 'female' ? femalePersona : malePersona;

  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const chatModelRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const initializeChat = () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: persona.systemInstruction });
      chatModelRef.current = model.startChat({ history: [] });
      setChatHistory([{
        role: 'model',
        parts: [{ text: `Hey! Main ${persona.name} hoon. Let's talk!` }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };
    initializeChat();

    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Auto-focus input when chat loads (only on desktop)
    setTimeout(() => {
      if (inputRef.current && !isMobile) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [gender, persona.name, persona.systemInstruction, isMobile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Mobile keyboard detection
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;

        // If viewport height decreased by more than 150px, keyboard is likely open
        if (heightDifference > 150) {
          setIsKeyboardOpen(true);
          // Scroll to bottom when keyboard opens
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          setIsKeyboardOpen(false);
        }
      }
    };

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      if (heightDifference > 150) {
        setIsKeyboardOpen(true);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    // Use Visual Viewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Handle input focus (mobile keyboard detection)
  const handleInputFocus = () => {
    if (isMobile) {
      // Small delay to allow keyboard to appear
      setTimeout(() => {
        setIsKeyboardOpen(true);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleInputBlur = () => {
    if (isMobile) {
      setTimeout(() => {
        setIsKeyboardOpen(false);
      }, 100);
    }
  };



  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessageText = userInput;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsLoading(true);
    setIsTyping(true);
    setUserInput('');
    setMessageCount(prev => prev + 1);

    // Add user message with animation
    setChatHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: userMessageText }], timestamp, id: Date.now() }
    ]);

    // Add empty bot message for typing effect
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        { role: 'model', parts: [{ text: '' }], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() + 1, isTyping: true }
      ]);
    }, 300);

    try {
      const result = await chatModelRef.current.sendMessageStream(userMessageText);
      let fullText = "";
      let isFirstChunk = true;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;

        if (isFirstChunk) {
          setIsTyping(false);
          isFirstChunk = false;
        }

        setChatHistory(currentHistory => {
          const newHistory = [...currentHistory];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.parts[0].text = fullText;
            lastMessage.isTyping = false;
          }
          return newHistory;
        });

        // Small delay for smooth typing effect
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setChatHistory(currentHistory => {
        const newHistory = [...currentHistory];
        const lastMessage = newHistory[newHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          lastMessage.parts[0].text = "Oops! Kuch problem ho gayi. Please try again. 😅";
          lastMessage.isTyping = false;
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Auto-focus the input after sending message
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-x border-slate-700/30 shadow-2xl transition-all duration-300 ${isKeyboardOpen && isMobile ? 'h-screen' : ''}`}>
      {/* Enhanced Header */}
      <header className="flex items-center p-4 sm:p-6 border-b border-slate-700/30 sticky top-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl z-20 shadow-lg">
        <Link
          to="/"
          className="group p-3 rounded-full hover:bg-slate-700/50 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Avatar with glow effect */}
        <div className="relative ml-4">
          <div className={`absolute inset-0 bg-gradient-to-r ${gender === 'female' ? 'from-pink-400 to-purple-400' : 'from-blue-400 to-cyan-400'} rounded-full blur-md transition-all duration-500 ${isLoading ? 'scale-110 opacity-60' : 'scale-100 opacity-30'}`}></div>
          <img
            src={persona.avatar}
            alt={persona.name}
            className={`relative w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${
              isLoading
                ? `border-${gender === 'female' ? 'pink' : 'cyan'}-400 shadow-lg`
                : 'border-slate-600'
            }`}
          />
          {/* Online indicator */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 transition-all duration-300 ${
            isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`}></div>
        </div>

        <div className="ml-4 flex-1">
          <h2 className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r ${gender === 'female' ? 'from-pink-300 to-purple-300' : 'from-blue-300 to-cyan-300'}`}>
            {persona.name}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
            }`}></div>
            <p className={`text-sm font-medium transition-all duration-300 ${
              isLoading ? 'text-yellow-300' : 'text-green-300'
            }`}>
              {isLoading ? (
                <span className="flex items-center gap-1">
                  typing
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </span>
                </span>
              ) : 'Online'}
            </p>
          </div>
        </div>

        {/* Message count badge */}
        {messageCount > 0 && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${gender === 'female' ? 'from-pink-500 to-purple-500' : 'from-blue-500 to-cyan-500'} text-white shadow-lg`}>
            {messageCount} messages
          </div>
        )}
      </header>

      {/* Enhanced Chat Messages */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 custom-scrollbar bg-gradient-to-b from-transparent via-slate-900/20 to-transparent transition-all duration-300 ${isKeyboardOpen && isMobile ? 'pb-4' : ''}`}>
        {chatHistory.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex gap-4 animate-message-slide-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Bot Avatar */}
            {msg.role === 'model' && (
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-r ${gender === 'female' ? 'from-pink-400/30 to-purple-400/30' : 'from-blue-400/30 to-cyan-400/30'} rounded-full blur-sm ${msg.isTyping ? 'animate-pulse' : ''}`}></div>
                <img
                  src={persona.avatar}
                  alt="bot"
                  className="relative w-10 h-10 rounded-full self-end object-cover border-2 border-slate-600 shadow-lg"
                />
                {msg.isTyping && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                )}
              </div>
            )}

            {/* Message Bubble */}
            <div className={`group relative max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg ${
              msg.role === 'user'
                ? 'order-first'
                : ''
            }`}>
              {/* Message Content */}
              <div className={`relative px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                msg.role === 'user'
                  ? `bg-gradient-to-br ${gender === 'female' ? 'from-pink-500 to-purple-600' : 'from-blue-500 to-cyan-600'} text-white rounded-br-md shadow-${gender === 'female' ? 'pink' : 'cyan'}-500/25`
                  : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-bl-md border border-slate-600/50'
              }`}>

                {/* Typing Indicator */}
                {msg.isTyping && msg.parts[0].text === '' ? (
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-slate-300">Typing</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {msg.parts[0].text}
                    </p>
                    <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-white/10">
                      <p className="text-xs opacity-70 font-medium">
                        {msg.timestamp}
                      </p>
                      {msg.role === 'user' && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs opacity-70">Sent</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Message Tail */}
                <div className={`absolute bottom-0 w-4 h-4 transform rotate-45 ${
                  msg.role === 'user'
                    ? `${gender === 'female' ? 'bg-purple-600' : 'bg-cyan-600'} -right-2`
                    : 'bg-slate-800 -left-2'
                }`}></div>
              </div>
            </div>

            {/* User Avatar Placeholder */}
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg border-2 border-slate-500">
                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={chatEndRef} className="h-4" />
      </main>

      {/* Enhanced Input Footer */}
      <footer className={`p-3 sm:p-4 md:p-6 border-t border-slate-700/30 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${isKeyboardOpen && isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : 'sticky bottom-0'}`}>
        <form onSubmit={sendMessage} className="flex items-end gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
          {/* Input Container */}
          <div className="flex-1 relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${gender === 'female' ? 'from-pink-500/20 to-purple-500/20' : 'from-blue-500/20 to-cyan-500/20'} rounded-xl sm:rounded-2xl blur-xl transition-all duration-300 ${userInput ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}></div>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={`Message ${persona.name}...`}
              className={`relative w-full bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 pr-10 sm:pr-12 outline-none border-2 transition-all duration-300 text-white placeholder-slate-400 text-base sm:text-lg resize-none min-h-[3rem] sm:min-h-[3.5rem] max-h-24 sm:max-h-32 ${
                userInput
                  ? `border-${gender === 'female' ? 'pink' : 'cyan'}-400/50 shadow-lg shadow-${gender === 'female' ? 'pink' : 'cyan'}-500/25`
                  : 'border-slate-600/50 hover:border-slate-500/70'
              } ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              disabled={isLoading}
              maxLength={500}
              rows={1}
            />

            {/* Character Counter */}
            {userInput.length > 400 && (
              <div className={`absolute bottom-2 right-16 text-xs font-medium ${
                userInput.length > 480 ? 'text-red-400' : 'text-slate-400'
              }`}>
                {userInput.length}/500
              </div>
            )}

            {/* Input Actions */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {userInput && (
                <button
                  type="button"
                  onClick={() => setUserInput('')}
                  className="p-1 rounded-full hover:bg-slate-600 transition-colors text-slate-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 transform min-w-[3rem] sm:min-w-[3.5rem] ${
              isLoading || !userInput.trim()
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : `bg-gradient-to-r ${gender === 'female' ? 'from-pink-500 to-purple-600' : 'from-blue-500 to-cyan-600'} hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl shadow-${gender === 'female' ? 'pink' : 'cyan'}-500/25`
            }`}
          >
            {/* Button Glow Effect */}
            {!isLoading && userInput.trim() && (
              <div className={`absolute inset-0 bg-gradient-to-r ${gender === 'female' ? 'from-pink-400 to-purple-500' : 'from-blue-400 to-cyan-500'} rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
            )}

            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white transform group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </div>
          </button>
        </form>

        {/* Quick Actions - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center mt-4 gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd>
            <span>to send</span>
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Shift + Enter</kbd>
            <span>for new line</span>
          </div>
        </div>

        {/* Mobile tip */}
        <div className="sm:hidden flex items-center justify-center mt-2">
          <div className="text-xs text-slate-500">
            Tap send or press Enter to chat
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;