export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground">
        Benvenuto in <span className="font-mono text-sm">{orgSlug}</span>. Seleziona
        una sezione dalla sidebar per iniziare.
      </p>
    </div>
  )
}
