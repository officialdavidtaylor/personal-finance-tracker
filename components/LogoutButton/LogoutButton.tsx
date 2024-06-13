import { Button } from 'primitives/Button';

export const LogoutButton = () => (
  <form action="/logout" method="POST">
    <Button
      variant="secondary"
      size="medium"
      type="submit"
      className="whitespace-nowrap"
    >
      Log out
    </Button>
  </form>
);
