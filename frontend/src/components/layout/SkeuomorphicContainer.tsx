import React from 'react';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export const SkeuomorphicContainer: React.FC<ContainerProps> = ({
  children,
  className,
  inset = false
}) => {
  return (
    <div className={cn(
      inset ? "neumorphic-inset" : "neumorphic",
      "p-6 transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
};
