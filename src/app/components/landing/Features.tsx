// components/landing/Features.tsx
import { Target, Repeat, Award } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center rounded-lg border p-6 text-center">
    <div className="mb-4 rounded-full bg-primary/10 p-3">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);


const Features = () => {
  return (
    <section id="features" className="w-full bg-muted/50 py-20 md:py-24">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Target className="h-8 w-8 text-primary" />}
            title="Strict 45-Day Plan"
            description="Follow a fixed workout schedule for 45 consecutive days. Choose between home or gym routines."
          />
          <FeatureCard
            icon={<Repeat className="h-8 w-8 text-primary" />}
            title="No Days Off"
            description="Consistency is key. Missing a single day resets your entire progress back to Day 1."
          />
          <FeatureCard
            icon={<Award className="h-8 w-8 text-primary" />}
            title="Earn Your Certificate"
            description="Complete the challenge to unlock a shareable certificate celebrating your achievement."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;