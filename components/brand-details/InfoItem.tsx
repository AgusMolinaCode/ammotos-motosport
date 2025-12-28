interface InfoItemProps {
  label: string;
  value: string;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-900">{value}</dd>
    </div>
  );
}
