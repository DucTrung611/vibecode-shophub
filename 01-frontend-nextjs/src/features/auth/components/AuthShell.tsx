export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-hub-900 to-hub-600 px-12 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold font-sora">
          S
        </div>
        <h1 className="mt-6 text-3xl font-bold font-sora">ShopHub</h1>
        <p className="mt-3 max-w-xs text-sm text-white/80 font-manrope">
          Nền tảng thương mại đa gian hàng đáng tin cậy dành cho bạn
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 md:w-1/2 md:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hub-500 text-lg font-bold text-white font-sora">
              S
            </div>
            <span className="text-xl font-bold font-sora text-neutral-900">
              ShopHub
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
