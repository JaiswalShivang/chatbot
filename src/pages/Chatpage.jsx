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
  
  const chatModelRef = useRef(null);
  const chatEndRef = useRef(null);

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
  }, [gender, persona.name, persona.systemInstruction]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessageText = userInput;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setIsLoading(true);
    setUserInput('');

    setChatHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: userMessageText }], timestamp },
      { role: 'model', parts: [{ text: '' }], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    try {
      const result = await chatModelRef.current.sendMessageStream(userMessageText);
      let fullText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        setChatHistory(currentHistory => {
          const newHistory = [...currentHistory];
          newHistory[newHistory.length - 1].parts[0].text = fullText;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory(currentHistory => {
        const newHistory = [...currentHistory];
        newHistory[newHistory.length - 1].parts[0].text = "Oops! Kuch problem ho gayi. Please try again.";
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-slate-900 border-x border-slate-700/50">
      <header className="flex items-center p-3 sm:p-4 border-b border-slate-700/50 sticky top-0 bg-slate-900/70 backdrop-blur-sm z-10">
        <Link to="/" className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full ml-2 sm:ml-4 object-cover" />
        <div className="ml-3 sm:ml-4">
          <h2 className="font-bold text-lg">{persona.name}</h2>
          <p className={`text-xs transition-colors ${isLoading ? 'text-cyan-400' : 'text-slate-400'}`}>
            {isLoading ? 'typing...' : 'Online'}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <img src={persona.avatar} alt="bot" className="w-8 h-8 rounded-full self-end object-cover" />}
            <div className={`py-2 px-4 rounded-xl max-w-sm md:max-w-md ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              <p className="text-xs text-right mt-1 opacity-60">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-3 sm:p-4 border-t border-slate-700/50 sticky bottom-0 bg-slate-900/70 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex items-center gap-2 sm:gap-4">
          <input
            type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-cyan-500 rounded-full p-3 text-white transition-all hover:scale-110 active:scale-95 disabled:bg-slate-600 disabled:hover:scale-100 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;