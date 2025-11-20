import { StatusBar } from 'expo-status-bar';
import { openDatabaseSync } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Attempt to open local-only database without libSQLOptions
      const db = openDatabaseSync('local.db');

      // Try a simple query
      db.execSync('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, value TEXT)');
      db.execSync("INSERT INTO test (value) VALUES ('hello')");

      setStatus('Success! Local database works.');
    } catch (e: any) {
      setError(e.message || String(e));
      setStatus('Failed');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>expo-sqlite libSQL Test</Text>
      <Text style={styles.status}>Status: {status}</Text>
      {error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
