import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleOAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}
      locale="vi"
    >
      {children}
    </GoogleOAuthProvider>
  );
}
