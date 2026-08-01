export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-hub-900 to-hub-600 px-12 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold font-sora">
          S
        </div>
        <h1 className="mt-6 text-3xl font-bold font-sora">ShopHub</h1>
        <p className="mt-3 max-w-xs text-sm text-white/80 font-manrope">
          Seller Center &amp; Admin Panel
        </p>
      </div>

      <div className="flex w-1/2 items-center justify-center px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
