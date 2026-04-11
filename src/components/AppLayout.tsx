import SideBar from './side-bar/SideBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
