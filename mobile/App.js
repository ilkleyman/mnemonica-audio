import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { WebView } from 'react-native-webview';

// The app itself stays on GitHub Pages — this is a shell around it, so a deploy
// reaches the phone without rebuilding the APK. The page's service worker caches
// itself and the audio on first run, which is what makes it work offline later.
const APP_URL = 'https://ilkleyman.github.io/mnemonica-audio/';

// Matches --bg in index.html, so there is no white flash before the page paints.
const BACKGROUND = '#0d2818';

export default function App() {
  // Drilling means long stretches of looking at the card without touching the
  // screen. navigator.wakeLock isn't reliable inside a WebView, so hold the
  // lock natively instead.
  useKeepAwake();

  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // Android's back gesture should walk the page's history before leaving the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack.current && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  const retry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={BACKGROUND} />

        {failed ? (
          <View style={styles.centre}>
            <Text style={styles.title}>Can't reach the stack trainer</Text>
            <Text style={styles.body}>
              Connect once so the app can cache itself, then it runs offline.
            </Text>
            <Pressable style={styles.button} onPress={retry}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: APP_URL }}
            style={styles.web}
            containerStyle={styles.web}
            // The audio chain starts itself after Start is pressed; without this
            // Android blocks every clip after the first.
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            // localStorage is the app's source of truth for timings and scores.
            domStorageEnabled
            javaScriptEnabled
            // Service worker + cache are what make it work with no signal.
            cacheEnabled
            // It's a full-screen card UI, not a document.
            overScrollMode="never"
            bounces={false}
            setBuiltInZoomControls={false}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
            onNavigationStateChange={(nav) => {
              canGoBack.current = nav.canGoBack;
            }}
          />
        )}

        {loading && !failed ? (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator size="large" color="#c9a84c" />
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BACKGROUND },
  web: { flex: 1, backgroundColor: BACKGROUND },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { color: '#c9a84c', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  body: { color: '#cfe3d6', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  button: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c9a84c',
  },
  buttonText: { color: '#c9a84c', fontSize: 15, fontWeight: '600' },
});
