import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { PortalProvider } from '@/lib/portal';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline' },
  { name: 'classes', title: 'Classes', icon: 'videocam-outline' },
  { name: 'attendance', title: 'Attendance', icon: 'calendar-outline' },
  { name: 'academics', title: 'Academics', icon: 'school-outline' },
  { name: 'fees', title: 'Fees', icon: 'wallet-outline' },
];

export default function AppLayout() {
  const { signOut } = useSession();

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Do you want to sign out of this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  return (
    <PortalProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primaryDark },
          headerTintColor: '#fff',
          tabBarActiveTintColor: colors.primary,
          headerRight: () => (
            <Pressable onPress={confirmSignOut} style={{ paddingHorizontal: 16 }} accessibilityLabel="Sign out">
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </Pressable>
          ),
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
            }}
          />
        ))}
      </Tabs>
    </PortalProvider>
  );
}
