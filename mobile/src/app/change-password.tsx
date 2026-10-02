import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

// Shown after signing in with a temporary password (first sign-in, or after the school resets it)
export default function ChangePassword() {
  const { changePassword, signOut } = useSession();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (next !== confirm) {
      setError('The new passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await changePassword(current, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change the password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.form}>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.hint}>You signed in with a temporary password. Choose your own to continue.</Text>

        <Text style={styles.label}>Temporary password</Text>
        <TextInput style={styles.input} value={current} onChangeText={setCurrent} secureTextEntry textContentType="password" />
        <Text style={styles.label}>New password</Text>
        <TextInput style={styles.input} value={next} onChangeText={setNext} secureTextEntry textContentType="newPassword" />
        <Text style={styles.label}>Confirm new password</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry textContentType="newPassword" onSubmitEditing={submit} />
        <Text style={styles.hint}>At least 8 characters, with a letter and a number.</Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={[styles.button, busy && { opacity: 0.7 }]} onPress={submit} disabled={busy} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save password</Text>}
        </Pressable>
        <Pressable onPress={signOut} style={{ marginTop: 16, alignItems: 'center' }} accessibilityRole="button">
          <Text style={{ color: colors.muted }}>Sign out</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark, justifyContent: 'center', padding: 24 },
  form: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.muted, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: colors.text },
  error: { color: colors.red, marginTop: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
