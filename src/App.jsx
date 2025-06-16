import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import ChatPage from './pages/Chatpage';

function App() {
  return (
    <div className="w-screen h-screen bg-slate-900 text-white font-sans antialiased">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat/:gender" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;