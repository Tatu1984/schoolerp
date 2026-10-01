import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { classState, formatDateTime, type OnlineClass } from '@/lib/portal';
import { colors } from '@/lib/theme';
import { Badge, Card, Row, text } from './ui';

export function ClassCard({ cls }: { cls: OnlineClass }) {
  const state = classState(cls);
  const teacher = cls.course?.teacher;
  const link = state === 'ENDED' ? cls.recordingLink : cls.meetingLink;

  // Opens the class in the phone's browser (or the meeting app, if installed)
  const open = async () => {
    if (!link) return;
    try {
      await Linking.openURL(link);
    } catch {
      Alert.alert('Could not open the class', 'Please try again or contact the school.');
    }
  };

  return (
    <Card>
      <Row>
        <Text style={[text.title, { flex: 1 }]}>{cls.title}</Text>
        {state === 'LIVE' && <Badge label="LIVE" tone="red" />}
        {state === 'ENDED' && <Badge label="Ended" />}
      </Row>
      <Text style={text.muted}>
        {cls.course?.name || 'General'}
        {teacher ? ` · ${teacher.firstName} ${teacher.lastName}` : ''}
      </Text>
      <Text style={text.muted}>
        {formatDateTime(cls.scheduledTime)}
        {cls.duration ? ` · ${cls.duration} min` : ''}
      </Text>
      {link && (
        <Pressable
          onPress={open}
          accessibilityRole="button"
          style={[styles.button, state === 'LIVE' && { backgroundColor: colors.red }, state === 'ENDED' && styles.secondary]}
        >
          <Text style={[styles.buttonText, state === 'ENDED' && { color: colors.text }]}>
            {state === 'LIVE' ? 'Join now' : state === 'ENDED' ? 'Watch recording' : 'Join class'}
          </Text>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  secondary: { backgroundColor: colors.border },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
