import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "StudySense",
  description: "Study smarter with confidence-based quizzes and adaptive study content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              Study<span>Sense</span>
            </Link>
            <nav className="nav">
              <Link href="/">Dashboard</Link>
              <Link href="/subjects/new">Add subject</Link>
              <Link href="/about">How it works</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
