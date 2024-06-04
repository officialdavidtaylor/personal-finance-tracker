import {
  Link as RemixLink,
  LinkProps as RemixLinkProps,
} from '@remix-run/react';
import { cva } from 'cva';
import { FC } from 'react';
import type { VariantProps } from 'cva';

const linkVariants = cva(['font-semibold', 'rounded'], {
  variants: {
    variant: {
      primaryButton: [
        'bg-cyan-500',
        'text-white',
        'border-transparent',
        'hover:bg-cyan-600',
      ],
      secondaryButton: [
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
      variant: 'primaryButton',
      size: 'medium',
      className: 'uppercase',
    },
  ],
  defaultVariants: {
    variant: 'primaryButton',
    size: 'medium',
  },
});

interface LinkProps extends RemixLinkProps, VariantProps<typeof linkVariants> {}

export const Link: FC<LinkProps> = ({ className, size, variant, ...props }) => {
  return (
    <RemixLink
      className={linkVariants({ variant, size, className })}
      {...props}
    />
  );
};
