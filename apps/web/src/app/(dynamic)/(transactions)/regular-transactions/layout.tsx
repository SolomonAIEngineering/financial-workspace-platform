import { MiniSidebar } from '@/components/sidebar/mini-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 z-30 h-screen flex-shrink-0">
        <MiniSidebar />
      </div>
      <div className="flex-1 overflow-auto p-[2%]">{children}</div>
    </div>
  );
}
