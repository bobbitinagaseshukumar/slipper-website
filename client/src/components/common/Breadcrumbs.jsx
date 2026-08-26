import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-3" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-luxury-accent transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            {isLast || !item.link ? (
              <span className="font-semibold text-luxury-dark truncate max-w-[150px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.link}
                className="hover:text-luxury-accent transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
