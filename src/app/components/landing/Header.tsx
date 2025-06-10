// components/landing/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FireExtinguisher } from "lucide-react"; // A fun icon for the logo

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <FireExtinguisher className="h-6 w-6 text-primary" />
            <span className="font-bold">45-Day Challenge</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;