import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell py-20">
      <div className="glass-panel max-w-3xl p-10">
        <p className="section-kicker">404</p>
        <h1 className="section-heading mt-4">That route does not exist</h1>
        <p className="section-copy mt-5 max-w-2xl">
          The page may have moved, or the car you were looking for is no longer
          available at this path.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="button-primary">
            Back to homepage
          </Link>
          <Link href="/cars" className="button-secondary">
            Browse cars
          </Link>
        </div>
      </div>
    </div>
  );
}
