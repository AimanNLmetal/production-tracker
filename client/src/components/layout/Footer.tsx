export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm">
          &copy; {currentYear} Production Output Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
