import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "ReplyRocket — AI replies in your voice",
  description:
    "Highlight any message and get 3 great reply drafts in seconds. Works in Gmail, LinkedIn, Slack, WhatsApp, X, and Outlook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
