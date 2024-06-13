import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import { authenticator } from './services/auth.server';
import { Link } from 'primitives/Link';
import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { LogoutButton } from 'components/LogoutButton';
import stylesheet from '~/tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);

  if (!user) return { isAuthenticated: false };

  return { isAuthenticated: true };
};

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="mx-auto max-w-3xl bg-gray-100 px-2 md:px-0">
        <nav className="flex w-full items-center justify-between py-2">
          <a href={isAuthenticated ? '/dashboard' : '/'}>
            <h1 className="text-xl font-bold text-slate-500">
              Personal Finance Tracker
            </h1>
          </a>
          {location.pathname === '/login' ? null : isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
