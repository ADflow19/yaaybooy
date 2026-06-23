import { Outlet } from "react-router";
import { BottomNav } from "../components/BottomNav";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] h-[780px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
