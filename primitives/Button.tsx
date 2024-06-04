import { ButtonHTMLAttributes, FC } from 'react';
import { cva } from 'cva';
import type { VariantProps } from 'cva';

const buttonVariants = cva(['font-semibold', 'border', 'rounded'], {
  variants: {
    variant: {
      primary: [
        'bg-cyan-500',
        'text-white',
        'border-transparent',
        'hover:bg-cyan-600',
      ],
      secondary: [
        'rounded-full',
        'bg-black',
        'bg-opacity-30',
        'text-white',
        'hover:bg-opacity-60',
      ],
    },
    size: {
      small: ['text-sm', 'py-1', 'px-2'],
      medium: ['text-base', 'py-2', 'px-4'],
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      size: 'medium',
      className: 'uppercase',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  size,
  variant,
  ...props
}) => {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
};
