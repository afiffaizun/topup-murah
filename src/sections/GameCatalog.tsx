import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { games } from '@/data/games'
import { fetchCatalog } from '@/lib/api'

const imagesById: Record<string, string> = Object.fromEntries(games.map((g) => [g.id, g.image]));

export function GameCatalog() {
  const [names, setNames] = useState<{ id: string; name: string }[]>(() =>
    games.filter((g) => ["ml", "ff", "genshin", "pubg"].includes(g.id)).map((g) => ({ id: g.id, name: g.name })),
  );

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        if (data.games.length > 0) setNames(data.games.map((g) => ({ id: g.id, name: g.name })));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="katalog" className="w-full bg-surface px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Badge variant="plain" className="mb-1">Katalog Pilihan</Badge>
            <h2 className="font-display text-[28px] font-bold uppercase leading-8 tracking-tight sm:text-[40px] sm:leading-[44px]">
              Game Terpopuler Hari Ini
            </h2>
          </div>
          <p className="hidden text-[13px] text-on-surface-variant sm:block">Pilih game untuk mulai top up</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {names.map((g) => (
            <article
              key={g.id}
              className="group cursor-pointer rounded-lg border border-ink/10 bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-ink-sm"
              onClick={() => document.getElementById('topup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="aspect-square overflow-hidden rounded-md bg-surface-high">
                <img src={imagesById[g.id]} alt={g.name} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <h3 className="mt-2.5 truncate font-display text-[15px] font-bold leading-tight">{g.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
