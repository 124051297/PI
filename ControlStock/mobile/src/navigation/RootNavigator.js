import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { EmployeeTabs } from './EmployeeTabs';
import { EntryScreen } from '../screens/EntryScreen';
import { ExitScreen } from '../screens/ExitScreen';
import { BarcodeScannerScreen } from '../screens/BarcodeScannerScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="EmployeeApp" component={EmployeeTabs} />
          <Stack.Screen name="EntryScreen" component={EntryScreen} />
          <Stack.Screen name="ExitScreen" component={ExitScreen} />
          <Stack.Screen name="BarcodeScannerScreen" component={BarcodeScannerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
