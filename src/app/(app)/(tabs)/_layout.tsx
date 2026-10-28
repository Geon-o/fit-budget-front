import { BlurTargetView, BlurView } from 'expo-blur'
import { Tabs, router, usePathname } from 'expo-router'
import { useRef } from 'react'
import type { ComponentRef, RefObject } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { TabBarProvider, useTabBarHidden } from '../../../providers/TabBarProvider'
import { colors, tabBar } from '../../../shared/theme'

const TABS = [
  { name: 'dashboard', label: '홈', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { name: 'calendar', label: '달력', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z' },
  { name: 'expenses', label: '지출', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
  { name: 'budget', label: '예산', icon: 'M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z' },
  { name: 'settings', label: '설정', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' },
] as const

// Android의 BlurView는 BlurTargetView로 감싼 영역만 흐리게 할 수 있어서,
// 탭 화면 전체를 BlurTargetView로 감싸고 탭 바는 그 바깥에 띄운다(기본 탭 바는 숨김).
export default function TabsLayout() {
  const target = useRef<ComponentRef<typeof View>>(null)
  return (
    <TabBarProvider>
      <BlurTargetView ref={target} style={styles.root}>
        <Tabs tabBar={() => null} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
          {TABS.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} />)}
        </Tabs>
      </BlurTargetView>
      <FloatingTabBar blurTarget={target} />
    </TabBarProvider>
  )
}

function FloatingTabBar({ blurTarget }: { blurTarget: RefObject<ComponentRef<typeof View> | null> }) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const hidden = useTabBarHidden()
  const bottom = insets.bottom + tabBar.gap
  // 숨길 땐 바 높이 + 띄운 거리 + 그림자 여유만큼 아래로 내려 화면 밖으로 보낸다
  const translateY = hidden.interpolate({ inputRange: [0, 1], outputRange: [0, tabBar.height + bottom + 16] })
  return (
    <Animated.View style={[styles.bar, { bottom, transform: [{ translateY }] }]}>
      {/* 불투명 유리: 강한 흐림 + 흰 기운 + 가장자리 하이라이트 */}
      <View style={styles.clip}>
        <BlurView blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.frost]} />
        <View style={[StyleSheet.absoluteFill, styles.highlight]} />
      </View>
      {TABS.map((tab) => {
        const active = pathname === `/${tab.name}`
        const color = active ? colors.accent : colors.subtle
        return (
          <Pressable
            key={tab.name}
            style={styles.item}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
            onPress={() => !active && router.navigate(`/${tab.name}`)}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path fill={color} d={tab.icon} />
            </Svg>
            <Text style={[styles.label, { color }, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 그림자가 잘리지 않게 바깥(bar)은 overflow를 열어두고, 흐림/유리층만 clip 안에서 둥글게 자른다
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: tabBar.height,
    borderRadius: 22,
    flexDirection: 'row',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22, overflow: 'hidden' },
  frost: { backgroundColor: 'rgba(255,255,255,0.5)' },
  highlight: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 12, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
})
