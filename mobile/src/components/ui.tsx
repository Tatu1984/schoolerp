import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePortal } from '@/lib/portal';
import { colors, tones } from '@/lib/theme';

// Every tab uses this: pull-to-refresh, the child switcher for parents, and loading / error states.
export function Screen({ children }: { children: ReactNode }) {
  const { data, loading, error, refresh, selectStudent } = usePortal();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={colors.primary} />}
    >
      {data && data.children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcher}>
          {data.children.map((child) => {
            const active = child.id === data.student?.id;
            return (
              <Pressable
                key={child.id}
                onPress={() => selectStudent(child.id)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{child.firstName}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {!data && loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : error && !data ? (
        <Card>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </Card>
      ) : !data?.student ? (
        <Card>
          <Text style={styles.muted}>No student record is linked to this login yet. Please contact the school office.</Text>
        </Card>
      ) : (
        children
      )}
    </ScrollView>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card>
      <Text style={[styles.muted, { textAlign: 'center' }]}>{children}</Text>
    </Card>
  );
}

export function Badge({ label, tone = 'gray' }: { label: string; tone?: keyof typeof tones }) {
  const t = tones[tone] || tones.gray;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export const text = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  big: { fontSize: 26, fontWeight: '700', color: colors.text },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  switcher: { flexGrow: 0 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 },
  muted: { fontSize: 14, color: colors.muted },
  error: { color: colors.red, textAlign: 'center' },
  retry: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: colors.primary, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
