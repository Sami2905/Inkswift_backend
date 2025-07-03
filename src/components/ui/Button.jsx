import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader, LogIn, LogOut } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      leftIcon: LeftIconProp,
      rightIcon: RightIconProp,
      children,
      ...props
    },
    ref
  ) => {
    // DEV: Warn if leftIcon/rightIcon is not a valid React element
    if (LeftIconProp && !React.isValidElement(LeftIconProp)) {
      throw new Error(
        '[Button] leftIcon must be a valid React element (JSX), not a component or object. You likely wrote leftIcon={MenuIcon} instead of leftIcon={<MenuIcon />}.'
      );
    }
    if (RightIconProp && !React.isValidElement(RightIconProp)) {
      throw new Error(
        '[Button] rightIcon must be a valid React element (JSX), not a component or object. You likely wrote rightIcon={MenuIcon} instead of rightIcon={<MenuIcon />}.'
      );
    }
    // DEV: Warn if children is a function or object (not JSX)
    if (
      typeof children === 'function' ||
      (typeof children === 'object' && !Array.isArray(children) && !React.isValidElement(children) && children !== null)
    ) {
      throw new Error(
        '[Button] children must be valid React nodes (JSX, string, number, or array of these). You likely passed a component or object.'
      );
    }

    // Only allow valid React elements for icons
    const LeftIcon = React.isValidElement(LeftIconProp)
      ? React.cloneElement(LeftIconProp, {
          className: cn('mr-2 h-4 w-4', LeftIconProp.props.className)
        })
      : null;

    const RightIcon = React.isValidElement(RightIconProp)
      ? React.cloneElement(RightIconProp, {
          className: cn('ml-2 h-4 w-4', RightIconProp.props.className)
        })
      : null;
    
    // Ensure children is a valid React node
    const renderChildren = () => {
      if (isLoading) {
        return (
          <>
            <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {loadingText || 'Loading...'}
          </>
        );
      }
      
      // Safely render children and icons
      return (
        <>
          {LeftIcon}
          {children && React.Children.map(children, (child, i) => 
            React.isValidElement(child) ? React.cloneElement(child, { key: i }) : child
          )}
          {RightIcon}
        </>
      );
    };
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        role="button"
        aria-label={props["aria-label"] || undefined}
        {...props}
      >
        {renderChildren()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

// Note: The asChild prop is currently disabled to resolve React child errors.
// We'll reimplement it once we've confirmed the error is fixed.
