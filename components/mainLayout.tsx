import { ReactNode } from "react";
function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">

      {/* Main Content */}
      <main className="flex-1 mt-7 ">
        <div className="py-1 px-4 ">
        {children}
        </div>
      </main>

    </div>
  );
}

export default MainLayout;
