// components/landing/Footer.tsx
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} 45-Day Challenge. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;