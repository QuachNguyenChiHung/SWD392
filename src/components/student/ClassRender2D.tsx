interface ClassRender2DProps {
  materialIds?: string[];
}

export default function ClassRender2D({ materialIds }: ClassRender2DProps) {
  const count = materialIds ? materialIds.length : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 20, color: '#374151', margin: 0 }}>Coming soon</h1>
      <p style={{ marginTop: 8, color: '#6b7280' }}>{count > 0 ? `${count} render(s) available — feature coming soon.` : '2D render feature will be available soon.'}</p>
    </div>
  );
}