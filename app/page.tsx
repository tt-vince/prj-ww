import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

// Reads live comments on every request; never prerendered at build (so the
// build does not require DATABASE_URL to be present).
export const dynamic = "force-dynamic";

// Server Component: reads comments from Neon at request time (dynamic).
export default async function Home() {
  const sql = neon(process.env.DATABASE_URL!);

  // Server Action: inserts a comment, then refreshes this route's data.
  async function create(formData: FormData) {
    "use server";
    const comment = formData.get("comment");
    if (typeof comment !== "string" || comment.trim() === "") return;

    const value = comment.trim();
    const sql = neon(process.env.DATABASE_URL!);
    // Driver v1.1.0 removed the sql(text, params) form; use the tagged-template
    // (interpolated values are sent as bound parameters, safe from injection).
    await sql`INSERT INTO comments (comment) VALUES (${value})`;

    revalidatePath("/");
  }

  const comments = (await sql`SELECT comment FROM comments`) as {
    comment: string;
  }[];

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-10 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Comments
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Stored in Neon Postgres via a Server Action.
          </p>
        </div>

        <form action={create} className="flex gap-3">
          <input
            type="text"
            name="comment"
            placeholder="write a comment"
            className="flex-1 rounded-md border border-black/[.12] bg-transparent px-4 py-2.5 text-black outline-none focus:border-black/40 dark:border-white/[.16] dark:text-zinc-50 dark:focus:border-white/40"
          />
          <button
            type="submit"
            className="rounded-md bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Submit
          </button>
        </form>

        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.1]">
          {comments.length === 0 ? (
            <li className="py-3 text-zinc-500">No comments yet.</li>
          ) : (
            comments.map((row, i) => (
              <li
                key={i}
                className="py-3 text-black dark:text-zinc-200"
              >
                {row.comment}
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
