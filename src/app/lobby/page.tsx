import Link from 'next/link';

export default function LobbyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 to-outback-100 px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-3xl font-bold text-outback-900">Multiplayer</h1>
        <p className="mt-2 text-outback-600">Create a lobby to host a game, or join an existing one with a code.</p>
        <div className="mt-10 flex flex-col gap-4">
          <Link
            href="/lobby/create"
            className="rounded-xl bg-ochre-500 px-8 py-4 font-semibold text-white transition hover:bg-ochre-600"
          >
            Create Lobby
          </Link>
          <Link
            href="/lobby/join"
            className="rounded-xl border-2 border-outback-400 bg-white px-8 py-4 font-semibold text-outback-800 transition hover:bg-outback-50"
          >
            Join Lobby
          </Link>
        </div>
        <p className="mt-8">
          <Link href="/" className="text-ochre-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
