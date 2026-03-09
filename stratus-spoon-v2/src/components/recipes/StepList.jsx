export function StepList({ steps }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Method</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <article key={step} className="card-base flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/20 font-semibold text-accent-dark">
              {index + 1}
            </span>
            <p className="pt-1 text-sm leading-7 text-text-muted">{step}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
