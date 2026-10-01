import { Text, View } from 'react-native';
import { ClassCard } from '@/components/ClassCard';
import { Badge, Card, Empty, Row, Screen, SectionTitle, text } from '@/components/ui';
import { classState, formatDate, formatMoney, usePortal } from '@/lib/portal';
import { colors } from '@/lib/theme';

export default function Home() {
  return (
    <Screen>
      <HomeContent />
    </Screen>
  );
}

function HomeContent() {
  const { data } = usePortal();
  if (!data?.student) return null;
  const { student, attendance, fees, assignments, onlineClasses, announcements } = data;
  const upcoming = onlineClasses.filter((c) => classState(c) !== 'ENDED');
  const pending = assignments.filter((a) => !a.submission).length;

  return (
    <>
      <Card>
        <Text style={text.big}>
          {student.firstName} {student.lastName}
        </Text>
        <Text style={text.muted}>
          {student.class?.name}
          {student.section ? ` - ${student.section.name}` : ''} · Adm. No. {student.admissionNumber}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={text.muted}>Attendance</Text>
            <Text style={text.big}>{attendance.summary.percentage === null ? '-' : `${attendance.summary.percentage}%`}</Text>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={text.muted}>Fees due</Text>
            <Text style={[text.big, { color: fees.totalDue > 0 ? colors.red : colors.green }]}>{formatMoney(fees.totalDue)}</Text>
          </Card>
        </View>
      </View>

      <Card>
        <Row>
          <Text style={text.body}>Pending assignments</Text>
          <Badge label={String(pending)} tone={pending ? 'yellow' : 'green'} />
        </Row>
        <Row>
          <Text style={text.body}>Upcoming exams</Text>
          <Badge label={String(data.exams.length)} tone="blue" />
        </Row>
      </Card>

      <SectionTitle>Online classes</SectionTitle>
      {upcoming.length === 0 ? <Empty>No online classes scheduled</Empty> : upcoming.slice(0, 2).map((c) => <ClassCard key={c.id} cls={c} />)}

      <SectionTitle>Announcements</SectionTitle>
      {announcements.length === 0 ? (
        <Empty>No announcements</Empty>
      ) : (
        announcements.map((a) => (
          <Card key={a.id}>
            <Row>
              <Text style={[text.title, { flex: 1 }]}>{a.title}</Text>
              {(a.priority === 'HIGH' || a.priority === 'URGENT') && <Badge label="Important" tone="red" />}
            </Row>
            <Text style={text.body}>{a.content}</Text>
            <Text style={text.muted}>{formatDate(a.publishedAt || a.createdAt)}</Text>
          </Card>
        ))
      )}
    </>
  );
}
