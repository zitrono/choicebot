import { Input } from "../ui/input";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
}: {
  action: any;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm border-none"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />

        <label
          htmlFor="password"
          className="text-sm font-medium leading-none text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm border-none"
          type="password"
          required
        />
      </div>

      {children}
    </form>
  );
}
