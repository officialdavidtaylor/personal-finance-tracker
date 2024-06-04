import { Authenticator } from 'remix-auth';
import { createServerClient, parse, serialize } from '@supabase/ssr';
import { FormStrategy } from 'remix-auth-form';
import { PrismaClient } from '@prisma/client';
import { sessionStorage } from '~/services/session.server';
import { User, loginFormFieldsSchema } from './authSchemas';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, request }) => {
    const rawEmailInput = form.get('email');
    const rawPasswordInput = form.get('password');

    const { email, password } = loginFormFieldsSchema.parse({
      email: rawEmailInput,
      password: rawPasswordInput,
    });

    const headers = new Headers();
    const cookies = parse(request.headers.get('Cookie') ?? '');
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(key) {
            return cookies[key];
          },
          set(key, value, options) {
            headers.append('Set-Cookie', serialize(key, value, options));
          },
          remove(key, options) {
            headers.append('Set-Cookie', serialize(key, '', options));
          },
        },
      }
    );

    // trigger email sign in flow
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error('error signing in');
    }

    const prisma = new PrismaClient();
    // TODO: add logging for cases where this throws
    const user = await prisma.user.findFirstOrThrow({
      where: { authId: data.user.id },
    });

    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass'
);

export { authenticator };
