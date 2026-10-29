import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

type AlertButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }
type AlertState = { title: string; message?: string; buttons: AlertButton[] }

let show: ((alert: AlertState) => void) | null = null

/** Alert.alert와 같은 모양으로 쓰는 앱 테마 팝업. 루트에 AlertHost가 하나 있어야 한다. */
export function showAlert(title: string, message?: string, buttons: AlertButton[] = [{ text: '확인' }]) {
  show?.({ title, message, buttons })
}

export function AlertHost() {
  const [alert, setAlert] = useState<AlertState | null>(null)
  useEffect(() => {
    show = setAlert
    return () => {
      show = null
    }
  }, [])

  const press = (button?: AlertButton) => {
    setAlert(null)
    button?.onPress?.()
  }
  const cancel = alert?.buttons.find((b) => b.style === 'cancel')

  return (
    <Modal visible={!!alert} transparent animationType="fade" statusBarTranslucent onRequestClose={() => press(cancel)}>
      <View style={styles.backdrop}>
        {alert && (
          <View style={styles.card}>
            <Text style={styles.title}>{alert.title}</Text>
            {!!alert.message && <Text style={styles.message}>{alert.message}</Text>}
            <View style={styles.buttons}>
              {alert.buttons.map((b) => (
                <Pressable
                  key={b.text}
                  onPress={() => press(b)}
                  style={({ pressed }) => [
                    styles.button,
                    b.style === 'cancel' ? styles.cancel : b.style === 'destructive' ? styles.destructive : styles.primary,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.buttonText, b.style === 'cancel' && { color: colors.ink }]}>{b.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: 16, padding: 24, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  message: { fontSize: 15, color: colors.subtle, lineHeight: 22 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 16 },
  button: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.accent },
  destructive: { backgroundColor: colors.danger },
  cancel: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.surface },
})
