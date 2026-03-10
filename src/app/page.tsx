import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 via-ochre-50/30 to-outback-100">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ochre-200/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <h1 className="font-display text-5xl font-bold tracking-tight text-outback-900 sm:text-6xl md:text-7xl">
            Sheep Tycoon
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-outback-700">
            Build your sheep station, manage your flock, and
            battle droughts, floods, and fluctuating wool prices to become the most successful
            Sheep Tycoon in the outback.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/play/new"
              className="inline-flex items-center justify-center rounded-xl bg-ochre-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-ochre-600 focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:ring-offset-2"
            >
              Play vs Computer
            </Link>
            <Link
              href="/lobby"
              className="inline-flex items-center justify-center rounded-xl border-2 border-outback-400 bg-white/80 px-8 py-4 text-lg font-semibold text-outback-800 backdrop-blur transition hover:bg-white hover:border-outback-500 focus:outline-none focus:ring-2 focus:ring-outback-400 focus:ring-offset-2"
            >
              Create / Join Lobby
            </Link>
          </div>
        </div>
      </header>

      {/* How to Play */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-outback-900">
          How to Play
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
            <h3 className="font-semibold text-ochre-700">Roll & Move</h3>
            <p className="mt-2 text-outback-600">
              Roll two dice and move around the board. Land on spaces to collect wool, sell
              sheep, buy improvements, or draw event cards.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
            <h3 className="font-semibold text-ochre-700">Improve Your Station</h3>
            <p className="mt-2 text-outback-600">
              Irrigate your paddocks, build shearing sheds, fences, and wells. Each station has
              five paddocks to develop.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
            <h3 className="font-semibold text-ochre-700">Survive the Outback</h3>
            <p className="mt-2 text-outback-600">
              Face droughts, floods, bushfires, and disease. Adapt to fluctuating wool and
              livestock prices. The most successful station wins.
            </p>
          </div>
        </div>
        <p className="mt-8 text-outback-600">
          2–6 players • 1–2 hours • Coorumbene, Wanbanalong, Emu Plains, Mt Mitchell, Warramboo,
          Coolibah Creek — choose your station and stake your claim.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-outback-200 bg-outback-50/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-outback-500">
          Sheep Tycoon
        </div>
      </footer>
    </main>
  );
}
