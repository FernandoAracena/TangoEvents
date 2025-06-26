import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-tangoBlue text-white py-4 px-6 mt-12 text-center text-sm">
    <div className="mb-2">&copy; {new Date().getFullYear()} TangoEvents Norway. All rights reserved.</div>
    <div>Contact: <a href="mailto:aracenafernando@gmail.com" className="hover:text-tangoGold">aracenafernando@gmail.com</a></div>
  </footer>
);

export default Footer;
