import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold">NotYourUsualSignal</h1>
      </div>
    </header>
  );
};

export default Header;
