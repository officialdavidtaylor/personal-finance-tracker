import { authenticator } from '~/services/auth.server';
import { Button } from 'primitives/Button';
import { LoginFormFields, loginFormFieldsSchema } from '~/services/authSchemas';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ActionFunction, MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Finance Tracker' },
    {
      name: 'description',
      content: 'Log into the personal finance tracker tool.',
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  });
};

export default function Index() {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginFormFieldsSchema),
  });

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4 pt-4"
      method="POST"
      onSubmit={handleSubmit(() => formRef.current?.submit())}
    >
      <label>
        <p>Email</p>
        <input
          {...register('email')}
          className="rounded-md border-2 border-gray-100 px-2 py-1"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </label>
      <label>
        <p>Password</p>
        <input
          {...register('password')}
          type="password"
          className="rounded-md border-2 border-gray-100 px-2 py-1"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
      </label>
      <Button type="submit" variant="primary" className="w-fit">
        Submit
      </Button>
    </form>
  );
}
