import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="AccordOS home">
      <span className="logo-mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>AccordOS</span>
    </Link>
  );
}
