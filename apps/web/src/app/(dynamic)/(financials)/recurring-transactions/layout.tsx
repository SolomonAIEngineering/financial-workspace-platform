export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden max-w-screen">
      {children}
    </div>
  );
}
