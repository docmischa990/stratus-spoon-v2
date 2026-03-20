import { StatCard } from '@/components/ui/StatCard'

export function ProfileSummary({ profile }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="card-base p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-xl font-semibold text-background">
            {profile.displayName
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{profile.displayName}</h1>
            <p className="text-sm text-text-muted">{profile.email}</p>
          </div>
        </div>
        <p className="mt-5 max-w-prose text-sm leading-7 text-text-muted">{profile.bio}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Created recipes" value={profile.stats.recipes} />
        <StatCard label="Favorites" value={profile.stats.favorites} />
        <StatCard label="Collections" value={profile.stats.collections} />
      </div>
    </section>
  )
}
