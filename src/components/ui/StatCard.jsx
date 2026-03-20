export function StatCard({ label, value }) {
  return (
    <div className="card-base p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary-dark">{value}</p>
    </div>
  )
}
