import { LogoutButton } from "./LogoutButton";

type TopNavProps = {
  title: string;
};

export function TopNav({ title }: TopNavProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-gutter">
      <div className="flex items-center gap-3">
        <button
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container lg:hidden"
          type="button"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-headline text-lg font-bold text-on-surface">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-variant font-headline text-sm font-bold text-primary sm:flex">
          A
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
