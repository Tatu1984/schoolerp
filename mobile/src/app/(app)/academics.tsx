import { Text, View } from 'react-native';
import { Badge, Card, Empty, Row, Screen, SectionTitle, text } from '@/components/ui';
import { formatDate, formatDateTime, usePortal } from '@/lib/portal';

export default function Academics() {
  return (
    <Screen>
      <AcademicsContent />
    </Screen>
  );
}

function AcademicsContent() {
  const { data } = usePortal();
  if (!data) return null;
  const { assignments, exams, examResults, reportCards } = data;

  return (
    <>
      <SectionTitle>Assignments</SectionTitle>
      {assignments.length === 0 ? (
        <Empty>No assignments yet</Empty>
      ) : (
        assignments.map((a) => {
          const sub = a.submission;
          const graded = !!sub && sub.score !== null;
          const overdue = !sub && new Date(a.dueDate) < new Date();
          return (
            <Card key={a.id}>
              <Row>
                <Text style={[text.title, { flex: 1 }]}>{a.title}</Text>
                {graded ? (
                  <Badge label={`${sub.score}/${a.maxScore}`} tone="green" />
                ) : sub ? (
                  <Badge label="Submitted" tone="blue" />
                ) : (
                  <Badge label={overdue ? 'Overdue' : 'Pending'} tone={overdue ? 'red' : 'yellow'} />
                )}
              </Row>
              <Text style={text.muted}>
                {a.course?.name} · Due {formatDate(a.dueDate)}
              </Text>
              {!!a.description && <Text style={text.body}>{a.description}</Text>}
              {!!sub?.feedback && <Text style={text.body}>Teacher: {sub.feedback}</Text>}
            </Card>
          );
        })
      )}

      <SectionTitle>Upcoming exams</SectionTitle>
      {exams.length === 0 ? (
        <Empty>No upcoming exams</Empty>
      ) : (
        <Card>
          {exams.map((e) => (
            <View key={e.id} style={{ paddingVertical: 4 }}>
              <Text style={text.title}>{e.title}</Text>
              <Text style={text.muted}>
                {e.course?.name} · {formatDateTime(e.examDate)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      <SectionTitle>Exam results</SectionTitle>
      {examResults.length === 0 ? (
        <Empty>No results published yet</Empty>
      ) : (
        <Card>
          {examResults.map((r) => {
            const pct = r.exam.maxScore ? Math.round((r.score / r.exam.maxScore) * 100) : 0;
            return (
              <Row key={r.id}>
                <View style={{ flex: 1 }}>
                  <Text style={text.body}>{r.exam.title}</Text>
                  <Text style={text.muted}>{formatDate(r.exam.examDate)}</Text>
                </View>
                <Badge label={`${r.score}/${r.exam.maxScore} · ${pct}%`} tone={pct >= 75 ? 'green' : pct >= 40 ? 'yellow' : 'red'} />
              </Row>
            );
          })}
        </Card>
      )}

      <SectionTitle>Report cards</SectionTitle>
      {reportCards.length === 0 ? (
        <Empty>No report cards published yet</Empty>
      ) : (
        reportCards.map((rc) => (
          <Card key={rc.id}>
            <Row>
              <Text style={text.title}>
                {rc.term} · {rc.academicYear?.name}
              </Text>
              {rc.overallScore !== null && <Badge label={`${rc.overallScore}%`} tone="blue" />}
            </Row>
            {Object.entries(rc.grades || {}).map(([subject, grade]) => (
              <Row key={subject}>
                <Text style={text.body}>{subject}</Text>
                <Text style={text.title}>{typeof grade === 'object' ? JSON.stringify(grade) : String(grade)}</Text>
              </Row>
            ))}
            {!!rc.remarks && <Text style={text.muted}>{rc.remarks}</Text>}
          </Card>
        ))
      )}
    </>
  );
}
