// components/landing/HeroSection.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="container flex flex-col items-center py-20 text-center md:py-32">
      <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">
        The Ultimate 45-Day Fitness Challenge
      </h1>
      <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground">
        Begin your transformation in just 45 days. No excuses, no missed days.
        Commit to the challenge and unlock your potential.
      </p>
      <div className="mt-8">
        <Link href="/signup">
          <Button size="lg">Start Your Journey Now</Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;