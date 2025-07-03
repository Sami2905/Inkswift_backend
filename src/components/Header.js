import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { Menu as MenuIcon, X, Loader as LucideLoader, LogOut as LucideLogOut } from 'lucide-react';
import { cn } from '../lib/utils';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'success',
      });
      navigate('/login', { replace: true, state: { from: location } });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't show header on auth pages
  if (['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/upload', label: 'Upload' },
    { to: '/templates', label: 'Templates' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary-600">DocSign</span>
          </Link>
          
          <nav className="hidden md:flex md:ml-10 md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  location.pathname === link.to ? 'text-primary-600' : 'text-gray-700'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                leftIcon={isLoggingOut ? <LucideLoader /> : <LucideLogOut />}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                  {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user.name || user.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {(() => {
              const icon = mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />;
              if (!React.isValidElement(icon)) {
                throw new Error('[Header] Mobile menu icon must be a valid React element.');
              }
              return icon;
            })()}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="border-t border-gray-200 my-2" />
                <div className="flex items-center px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium mr-2">
                    {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="h-4 w-4 border-2 border-gray-400 border-t-primary-500 rounded-full animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;