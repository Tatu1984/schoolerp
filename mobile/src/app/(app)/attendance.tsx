import { Text, View } from 'react-native';
import { Badge, Card, Empty, Row, Screen, SectionTitle, text } from '@/components/ui';
import { formatDate, usePortal } from '@/lib/portal';

const tone = { PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', LEAVE: 'blue' } as const;

export default function Attendance() {
  return (
    <Screen>
      <AttendanceContent />
    </Screen>
  );
}

function AttendanceContent() {
  const { data } = usePortal();
  if (!data) return null;
  const { records, summary } = data.attendance;

  return (
    <>
      <Card>
        <Text style={text.muted}>Last 90 days</Text>
        <Text style={text.big}>{summary.percentage === null ? '-' : `${summary.percentage}%`}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <Badge label={`Present ${summary.PRESENT}`} tone="green" />
          <Badge label={`Absent ${summary.ABSENT}`} tone="red" />
          <Badge label={`Late ${summary.LATE}`} tone="yellow" />
          <Badge label={`Leave ${summary.LEAVE}`} tone="blue" />
        </View>
      </Card>

      <SectionTitle>Daily record</SectionTitle>
      {records.length === 0 ? (
        <Empty>No attendance has been marked yet</Empty>
      ) : (
        <Card>
          {records.map((r) => (
            <Row key={r.date}>
              <Text style={text.body}>
                {formatDate(r.date)} · {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' })}
              </Text>
              <Badge label={r.status} tone={tone[r.status as keyof typeof tone] || 'gray'} />
            </Row>
          ))}
        </Card>
      )}
    </>
  );
}
