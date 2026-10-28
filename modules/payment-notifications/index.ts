import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo'

export interface RawPaymentNotification {
  id: string
  packageName: string
  title: string
  text: string
  postedAt: number // epoch ms
}

interface NativeModule {
  isEnabled(): boolean
  openSettings(): void
  getPending(): string
  remove(ids: string[]): void
}

// Android 전용 네이티브 모듈. 다른 플랫폼이나 재빌드 전 앱에서는 null이라 기능을 숨긴다.
const native = Platform.OS === 'android' ? requireOptionalNativeModule<NativeModule>('PaymentNotifications') : null

export const isSupported = native !== null
export const isEnabled = () => native?.isEnabled() ?? false
export const openSettings = () => native?.openSettings()
export const getPending = (): RawPaymentNotification[] => (native ? JSON.parse(native.getPending()) : [])
export const removePending = (ids: string[]) => native?.remove(ids)
