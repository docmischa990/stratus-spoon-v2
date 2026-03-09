export function NotesSection({ notes }) {
  return (
    <section className="card-base bg-surface-muted/70 p-6">
      <h2 className="text-2xl font-semibold">Cook’s notes</h2>
      <p className="mt-4 text-sm leading-7 text-text-muted">{notes}</p>
    </section>
  )
}
