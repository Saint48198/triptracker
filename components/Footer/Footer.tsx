const Footer = () => {
  return (
    <footer className="bg-white-800 text-black-300 py-4">
      <div className="container mx-auto flex flex-col items-end justify-center space-y-2">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Scott Daniels. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
