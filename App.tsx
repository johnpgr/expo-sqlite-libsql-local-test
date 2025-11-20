import { createClient } from '@libsql/client';
import { StatusBar } from 'expo-status-bar';
import { openDatabaseSync } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
}

export default function App() {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    async function runTests() {
      const testResults: TestResult[] = [];

      // Test 1: expo-sqlite without libSQLOptions
      try {
        const db = openDatabaseSync('local.db');
        db.execSync('SELECT 1');
        testResults.push({
          name: 'expo-sqlite: openDatabaseSync("local.db")',
          success: true,
        });
      } catch (e: any) {
        testResults.push({
          name: 'expo-sqlite: openDatabaseSync("local.db")',
          success: false,
          error: e.message,
        });
      }

      // Test 2: expo-sqlite with file:// URL in libSQLOptions
      try {
        const db = openDatabaseSync('local2.db', {
          libSQLOptions: {
            url: 'file:local2.db',
            authToken: '',
          },
        });
        db.execSync('SELECT 1');
        testResults.push({
          name: 'expo-sqlite: file: URL in libSQLOptions',
          success: true,
        });
      } catch (e: any) {
        testResults.push({
          name: 'expo-sqlite: file: URL in libSQLOptions',
          success: false,
          error: e.message,
        });
      }

      // Test 3: @libsql/client with file: URL (demonstrates libSQL capability)
      try {
        const client = createClient({
          url: 'file:local3.db',
        });
        await client.execute('SELECT 1');
        testResults.push({
          name: '@libsql/client: file:local3.db',
          success: true,
        });
      } catch (e: any) {
        testResults.push({
          name: '@libsql/client: file:local3.db',
          success: false,
          error: e.message,
        });
      }

      setResults(testResults);
    }

    runTests();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>expo-sqlite libSQL Local DB Test</Text>

      <Text style={styles.subtitle}>
        Testing local-only database support when useLibSQL is enabled
      </Text>

      {results.length === 0 ? (
        <Text>Running tests...</Text>
      ) : (
        results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <Text style={styles.testName}>{result.name}</Text>
            <Text style={[
              styles.status,
              result.success ? styles.success : styles.failure
            ]}>
              {result.success ? '✓ SUCCESS' : '✗ FAILED'}
            </Text>
            {result.error && (
              <Text style={styles.error}>{result.error}</Text>
            )}
          </View>
        ))
      )}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Expected Behavior:</Text>
        <Text style={styles.noteText}>
          libSQL supports local-only databases via file: URLs.{'\n'}
          expo-sqlite should expose this capability when useLibSQL is enabled.
        </Text>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  testName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  success: {
    color: '#22c55e',
  },
  failure: {
    color: '#ef4444',
  },
  error: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  note: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    width: '100%',
  },
  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#92400e',
  },
});
