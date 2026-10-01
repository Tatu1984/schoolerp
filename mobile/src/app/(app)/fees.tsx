import { Text } from 'react-native';
import { Badge, Card, Empty, Row, Screen, SectionTitle, text } from '@/components/ui';
import { formatDate, formatMoney, usePortal } from '@/lib/portal';
import { colors } from '@/lib/theme';

const tone = { PAID: 'green', PENDING: 'yellow', PARTIAL: 'blue', OVERDUE: 'red', CANCELLED: 'gray' } as const;

export default function Fees() {
  return (
    <Screen>
      <FeesContent />
    </Screen>
  );
}

function FeesContent() {
  const { data } = usePortal();
  if (!data) return null;
  const { items, totalDue, totalPaid } = data.fees;

  return (
    <>
      <Card>
        <Text style={text.muted}>Outstanding</Text>
        <Text style={[text.big, { color: totalDue > 0 ? colors.red : colors.green }]}>{formatMoney(totalDue)}</Text>
        <Text style={text.muted}>Paid so far {formatMoney(totalPaid)}</Text>
      </Card>

      <SectionTitle>Fee details</SectionTitle>
      {items.length === 0 ? (
        <Empty>No fee records yet</Empty>
      ) : (
        items.map((f) => (
          <Card key={f.id}>
            <Row>
              <Text style={[text.title, { flex: 1 }]}>{f.fee?.name}</Text>
              <Badge label={f.status} tone={tone[f.status as keyof typeof tone] || 'gray'} />
            </Row>
            <Row>
              <Text style={text.muted}>Amount {formatMoney(f.amount)}</Text>
              <Text style={text.muted}>Paid {formatMoney(f.paidAmount)}</Text>
            </Row>
            <Row>
              <Text style={text.body}>Balance {formatMoney(f.amount - f.paidAmount)}</Text>
              <Text style={text.muted}>Due {formatDate(f.dueDate)}</Text>
            </Row>
            {!!f.receiptNumber && <Text style={text.muted}>Receipt {f.receiptNumber}</Text>}
          </Card>
        ))
      )}
      <Text style={[text.muted, { textAlign: 'center' }]}>Payments are recorded by the school accounts office.</Text>
    </>
  );
}
