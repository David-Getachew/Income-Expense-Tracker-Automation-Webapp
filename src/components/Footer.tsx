import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          <p>
            Built by Dawit Getachew — © 2025 Automation & Health Apps ·{' '}
            <a 
              href="https://github.com/David-Getachew/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              GitHub
            </a>{' '}
            ·{' '}
            <a 
              href="https://www.linkedin.com/in/dawit-getachew-mekonen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;