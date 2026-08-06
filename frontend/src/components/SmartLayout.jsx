import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AiAssistantChat from './AiAssistantChat';
import BottomNav from './BottomNav';
import FAB from './FAB';

const SmartLayout = () => {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#07071c]">
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 md:pb-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <FAB />
      <AiAssistantChat />
    </div>
  );
};

export default SmartLayout;
