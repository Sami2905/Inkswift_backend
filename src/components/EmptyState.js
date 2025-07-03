import React from 'react';

const EmptyState = ({ illustration, title, description, children }) => {
  // Ensure illustration is a valid React element or render nothing
  const renderIllustration = () => {
    if (!illustration) return null;
    
    // If it's already a React element, render it directly
    if (React.isValidElement(illustration)) {
      return <div className="w-40 h-40 mb-6">{illustration}</div>;
    }
    
    // If it's a string (like an SVG string), use dangerouslySetInnerHTML
    if (typeof illustration === 'string') {
      return (
        <div 
          className="w-40 h-40 mb-6" 
          dangerouslySetInnerHTML={{ __html: illustration }} 
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {renderIllustration()}
      {title && <h2 className="text-2xl font-semibold mb-2">{title}</h2>}
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
};

export default EmptyState;