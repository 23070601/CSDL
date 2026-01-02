import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-btn-sm',
  md: 'px-6 py-3 text-btn-md',
  lg: 'px-8 py-4 text-btn-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '⏳ ' : ''} {children}
    </button>
  );
}
