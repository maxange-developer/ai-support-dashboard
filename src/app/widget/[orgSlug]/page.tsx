import WidgetChat from '@/components/chat/WidgetChat'

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ apiKey?: string }>
}) {
  const { orgSlug } = await params
  const { apiKey } = await searchParams

  return (
    <div className="h-screen">
      <WidgetChat orgSlug={orgSlug} apiKey={apiKey} />
    </div>
  )
}
