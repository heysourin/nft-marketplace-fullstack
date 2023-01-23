import "@/styles/globals.css";
import Link from "next/link";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }) {
  // return <Component {...pageProps} />
  return (
    <ThemeProvider enableSystem={true} attribute="class">
      <div>
        <nav className="border-b p-6 ">
          <p className="text-4xl font-bold">Cool NFT Marketplace</p>
          <div className="flex mt-4">
            <Link href="/" legacyBehavior>
              <a className="mr-6">Home</a>
            </Link>
            <Link href="/create-item" legacyBehavior>
              <a className="mr-6">Create Digital Assets</a>
            </Link>
            <Link href="/my-assets" legacyBehavior>
              <a className="mr-6">My Digital Assets</a>
            </Link>
            <Link href="/creator-dashboard" legacyBehavior>
              <a className="mr-6">Creator Dashboard</a>
            </Link>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
