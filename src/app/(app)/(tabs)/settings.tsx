import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as PaymentNotifications from '../../../../modules/payment-notifications'
import type { DetectionRules, InstalledApp } from '../../../../modules/payment-notifications'
import { usePendingPayments } from '../../../domains/expense'
import { useHideTabBarOnScroll } from '../../../providers/TabBarProvider'
import { colors, tabBar } from '../../../shared/theme'

export default function Settings() {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const { supported, enabled, openSettings } = usePendingPayments()
  const [rules, setRulesState] = useState<DetectionRules | null>(PaymentNotifications.getRules)
  // 앱 목록은 필요할 때 한 번만 읽는다(앱 이름 표시용)
  const apps = useMemo(() => (supported ? PaymentNotifications.getInstalledApps() : []), [supported])
  const [picking, setPicking] = useState(false)

  // 바꾸는 즉시 기기에 저장 — 알림 서비스가 다음 알림부터 새 규칙을 쓴다
  const update = (next: DetectionRules) => {
    PaymentNotifications.setRules(next)
    setRulesState(next)
  }
  const labelOf = (pkg: string) => apps.find((a) => a.packageName === pkg)?.label ?? pkg

  return (
    <ScrollView
      {...hideTabBarOnScroll}
      keyboardShouldPersistTaps="handled"
      style={[styles.screen, { marginTop: insets.top }]}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + tabBar.space }]}
    >
      <Text style={styles.title}>설정</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>결제 알림 감지</Text>
        {!supported ? (
          <Text style={styles.hint}>이 앱 버전에서는 사용할 수 없어요. 결제 알림 기능이 들어간 새 APK를 설치해 주세요.</Text>
        ) : (
          <View style={styles.rowBetween}>
            <Text style={styles.value}>{enabled ? '켜짐' : '꺼짐'}</Text>
            <Pressable onPress={openSettings} hitSlop={8}>
              <Text style={styles.link}>{enabled ? '알림 접근 설정' : '켜기'}</Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.hint}>카드·은행 결제 알림을 모아 두었다가, 지출 탭에서 확인하면 지출로 저장해요.</Text>
      </View>

      {supported && rules && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>감지할 앱</Text>
            <View style={styles.segment}>
              <Segment label="모든 앱" active={rules.apps === null} onPress={() => update({ ...rules, apps: null })} />
              <Segment label="선택한 앱만" active={rules.apps !== null} onPress={() => update({ ...rules, apps: rules.apps ?? [] })} />
            </View>
            {rules.apps !== null && (
              <>
                {rules.apps.length === 0 && <Text style={styles.hint}>아직 고른 앱이 없어서 어떤 알림도 감지하지 않아요.</Text>}
                <View style={styles.chips}>
                  {rules.apps.map((pkg) => (
                    <Chip key={pkg} label={labelOf(pkg)} onRemove={() => update({ ...rules, apps: rules.apps!.filter((p) => p !== pkg) })} />
                  ))}
                </View>
                <Pressable style={styles.secondaryButton} onPress={() => setPicking(true)}>
                  <Text style={styles.secondaryText}>+ 앱 고르기</Text>
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>감지 단어</Text>
            <Text style={styles.hint}>금액(예: 12,000원)이 있는 알림 중에서 아래 조건으로 걸러요.</Text>
            <KeywordEditor
              label="포함 단어 (하나라도 있으면 감지, 비우면 조건 없음)"
              words={rules.include}
              onChange={(include) => update({ ...rules, include })}
            />
            <KeywordEditor
              label="제외 단어 (하나라도 있으면 무시)"
              words={rules.exclude}
              onChange={(exclude) => update({ ...rules, exclude })}
            />
          </View>
        </>
      )}

      {picking && rules && (
        <AppPicker
          apps={apps}
          selected={rules.apps ?? []}
          onChange={(selected) => update({ ...rules, apps: selected })}
          onClose={() => setPicking(false)}
        />
      )}
    </ScrollView>
  )
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentItem, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && { color: colors.surface }]}>{label}</Text>
    </Pressable>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onRemove} hitSlop={4}>
      <Text style={styles.chipText}>{label}  ✕</Text>
    </Pressable>
  )
}

function KeywordEditor({ label, words, onChange }: { label: string; words: string[]; onChange: (words: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const word = draft.trim()
    if (word && !words.includes(word)) onChange([...words, word])
    setDraft('')
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {words.map((w) => (
          <Chip key={w} label={w} onRemove={() => onChange(words.filter((x) => x !== w))} />
        ))}
      </View>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder="단어 추가"
          placeholderTextColor={colors.subtle}
          maxLength={20}
          returnKeyType="done"
        />
        <Pressable onPress={add} hitSlop={8} disabled={!draft.trim()}>
          <Text style={[styles.link, !draft.trim() && { opacity: 0.4 }]}>추가</Text>
        </Pressable>
      </View>
    </View>
  )
}

function AppPicker({
  apps,
  selected,
  onChange,
  onClose,
}: {
  apps: InstalledApp[]
  selected: string[]
  onChange: (selected: string[]) => void
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const filtered = apps.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()))
  const toggle = (pkg: string) =>
    onChange(selected.includes(pkg) ? selected.filter((p) => p !== pkg) : [...selected, pkg])

  return (
    <Modal animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <StatusBar style="dark" />
      <View style={[styles.picker, { paddingTop: insets.top + 12, paddingBottom: insets.bottom }]}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>감지할 앱 고르기</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.link}>완료</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="앱 이름 검색 (예: 삼성, 카드, 페이)"
          placeholderTextColor={colors.subtle}
        />
        <FlatList
          data={filtered}
          keyExtractor={(a) => a.packageName}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const on = selected.includes(item.packageName)
            return (
              <Pressable style={styles.appRow} onPress={() => toggle(item.packageName)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appName}>{item.label}</Text>
                  <Text style={styles.appPkg} numberOfLines={1}>{item.packageName}</Text>
                </View>
                <View style={[styles.check, on && styles.checkOn]}>{on && <Text style={styles.checkMark}>✓</Text>}</View>
              </Pressable>
            )
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8, marginBottom: 4 },
  // 그림자 대신 1px 보더의 플랫 카드
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  hint: { fontSize: 13, color: colors.subtle, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontSize: 15, fontWeight: '600', color: colors.ink },
  link: { fontSize: 15, fontWeight: '700', color: colors.accent },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 10, overflow: 'hidden' },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.ink },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 14, color: colors.ink },
  fieldLabel: { fontSize: 14, color: colors.subtle },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, fontSize: 16, color: colors.ink, borderBottomWidth: 1.5, borderColor: colors.line, paddingVertical: 6 },
  secondaryButton: { height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700', color: colors.accent },
  search: { fontSize: 16, color: colors.ink, borderBottomWidth: 1.5, borderColor: colors.line, paddingVertical: 8 },
  picker: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, gap: 12 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  appName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  appPkg: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: '#fff', fontWeight: '800', fontSize: 14 },
})
