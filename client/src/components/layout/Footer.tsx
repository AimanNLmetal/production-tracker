export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-accent to-primary text-white py-4 mt-auto shadow-inner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/assets/nl_metals_logo.jfif" 
            alt="NL Metals Logo" 
            className="h-6 w-6 rounded-full object-cover" 
          />
          <div className="text-center text-sm">
            &copy; {currentYear} NL Metals Sdn Bhd. Production Output Tracking System.
          </div>
        </div>
      </div>
    </footer>
  );
}
