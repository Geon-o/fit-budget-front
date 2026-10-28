import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo'

export interface RawPaymentNotification {
  id: string
  packageName: string
  title: string
  text: string
  postedAt: number // epoch ms
}

/** 결제 알림으로 볼 조건. apps가 null이면 모든 앱, include가 비어 있으면 단어 조건 없음 */
export interface DetectionRules {
  apps: string[] | null
  include: string[]
  exclude: string[]
}

export interface InstalledApp {
  packageName: string
  label: string
}

interface NativeModule {
  isEnabled(): boolean
  openSettings(): void
  getPending(): string
  remove(ids: string[]): void
  getRules(): string
  setRules(json: string): void
  getInstalledApps(): string
}

// Android 전용 네이티브 모듈. 다른 플랫폼이나 재빌드 전 앱에서는 null이라 기능을 숨긴다.
const native = Platform.OS === 'android' ? requireOptionalNativeModule<NativeModule>('PaymentNotifications') : null

export const isSupported = native !== null
export const isEnabled = () => native?.isEnabled() ?? false
export const openSettings = () => native?.openSettings()
export const getPending = (): RawPaymentNotification[] => (native ? JSON.parse(native.getPending()) : [])
export const removePending = (ids: string[]) => native?.remove(ids)
export const getRules = (): DetectionRules | null => (native ? JSON.parse(native.getRules()) : null)
export const setRules = (rules: DetectionRules) => native?.setRules(JSON.stringify(rules))
export const getInstalledApps = (): InstalledApp[] => (native ? JSON.parse(native.getInstalledApps()) : [])
