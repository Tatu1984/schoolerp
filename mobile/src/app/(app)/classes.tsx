import { ClassCard } from '@/components/ClassCard';
import { Empty, Screen, SectionTitle } from '@/components/ui';
import { classState, usePortal } from '@/lib/portal';

export default function Classes() {
  return (
    <Screen>
      <ClassesContent />
    </Screen>
  );
}

function ClassesContent() {
  const { data } = usePortal();
  if (!data) return null;
  const upcoming = data.onlineClasses.filter((c) => classState(c) !== 'ENDED');
  const past = data.onlineClasses.filter((c) => classState(c) === 'ENDED').reverse();

  return (
    <>
      <SectionTitle>Live & upcoming</SectionTitle>
      {upcoming.length === 0 ? <Empty>No online classes scheduled</Empty> : upcoming.map((c) => <ClassCard key={c.id} cls={c} />)}
      {past.length > 0 && <SectionTitle>Past classes</SectionTitle>}
      {past.map((c) => (
        <ClassCard key={c.id} cls={c} />
      ))}
    </>
  );
}
