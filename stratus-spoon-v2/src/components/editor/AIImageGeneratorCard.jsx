export function AIImageGeneratorCard({ presets = [] }) {
  return (
    <section className="card-base p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">AI image generation</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Protected serverless endpoints will later generate and save recipe imagery to Firebase Storage.
          </p>
        </div>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
          Planned
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <span key={preset} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-muted">
            {preset}
          </span>
        ))}
      </div>
    </section>
  )
}
