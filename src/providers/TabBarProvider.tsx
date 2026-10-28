import { createContext, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Animated } from 'react-native'

const SHOW_DELAY_MS = 300 // 스크롤 이벤트가 이만큼 끊기면 "멈춤"으로 보고 탭 바를 다시 올린다

// 0 = 보임, 1 = 숨김. 탭 바는 이 값으로 아래로 밀려 내려간다.
const TabBarContext = createContext<Animated.Value | null>(null)

export function TabBarProvider({ children }: { children: ReactNode }) {
  const hidden = useRef(new Animated.Value(0)).current
  return <TabBarContext.Provider value={hidden}>{children}</TabBarContext.Provider>
}

export function useTabBarHidden() {
  const ctx = useContext(TabBarContext)
  if (!ctx) throw new Error('useTabBarHidden must be used within TabBarProvider')
  return ctx
}

/** ScrollView에 펼쳐 넣으면 스크롤 중엔 탭 바를 숨기고, 멈추면 다시 보여준다. */
export function useHideTabBarOnScroll() {
  const hidden = useTabBarHidden()
  const isHidden = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const animate = (toValue: number) =>
    Animated.timing(hidden, { toValue, duration: 200, useNativeDriver: true }).start()

  const onScroll = () => {
    if (!isHidden.current) {
      isHidden.current = true
      animate(1)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      isHidden.current = false
      animate(0)
    }, SHOW_DELAY_MS)
  }

  // 화면을 떠날 때 숨긴 채로 남지 않게 되돌린다
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      hidden.setValue(0)
    },
    [hidden],
  )

  return { onScroll, scrollEventThrottle: 16 }
}
