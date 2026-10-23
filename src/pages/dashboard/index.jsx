// Data dummy, ganti dengan hasil fetch dari API
const STATS = [
  { label: "Total data", value: "128" },
  { label: "Diproses", value: "14" },
  { label: "Selesai", value: "109" },
  { label: "Ditolak", value: "5" },
];

const RECENT = [
  { id: 1, nama: "Contoh data A", status: "Selesai", tanggal: "2026-10-21" },
  { id: 2, nama: "Contoh data B", status: "Diproses", tanggal: "2026-10-22" },
  { id: 3, nama: "Contoh data C", status: "Ditolak", tanggal: "2026-10-22" },
  { id: 4, nama: "Contoh data D", status: "Diproses", tanggal: "2026-10-23" },
];

const STATUS_STYLE = {
  Selesai: "text-green-700",
  Diproses: "text-amber-700",
  Ditolak: "text-red-700",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500">Ringkasan data terbaru.</p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-zinc-200 rounded border border-zinc-200 bg-white md:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <div key={label} className="px-5 py-4">
            <dt className="text-sm text-zinc-500">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-200 px-5 py-3 text-sm font-medium">
          Aktivitas terakhir
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-200">
                <th className="px-5 py-2 font-medium">Nama</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row) => (
                <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-5 py-2">{row.nama}</td>
                  <td className={`px-5 py-2 ${STATUS_STYLE[row.status]}`}>
                    {row.status}
                  </td>
                  <td className="px-5 py-2 tabular-nums text-zinc-600">
                    {row.tanggal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}