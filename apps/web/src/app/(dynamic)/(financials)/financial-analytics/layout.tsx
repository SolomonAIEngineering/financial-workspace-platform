export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full max-w-screen overflow-x-hidden">
      {children}
    </div>
  );
}
