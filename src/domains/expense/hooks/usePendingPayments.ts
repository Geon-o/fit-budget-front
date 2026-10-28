import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import * as PaymentNotifications from '../../../../modules/payment-notifications'
import type { RawPaymentNotification } from '../../../../modules/payment-notifications'
import { parsePayment } from '../paymentNotification'
import type { ParsedPayment } from '../paymentNotification'

export type PendingPayment = RawPaymentNotification & ParsedPayment

/** 기기에 쌓인 결제 알림(확인 대기)을 읽는다. 화면에 들어오거나 앱이 다시 앞으로 올 때마다 갱신한다. */
export function usePendingPayments() {
  const [enabled, setEnabled] = useState(PaymentNotifications.isEnabled)
  const [pending, setPending] = useState<PendingPayment[]>([])

  const refresh = useCallback(() => {
    setEnabled(PaymentNotifications.isEnabled())
    const parsed: PendingPayment[] = []
    for (const raw of PaymentNotifications.getPending()) {
      const p = parsePayment(raw.title, raw.text, raw.postedAt)
      if (p) parsed.push({ ...raw, ...p })
    }
    setPending(parsed.sort((a, b) => b.postedAt - a.postedAt))
  }, [])

  useFocusEffect(refresh)
  // 설정에서 알림 접근을 켜고 돌아오거나, 결제 알림을 받고 앱으로 돌아왔을 때
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh())
    return () => sub.remove()
  }, [refresh])

  const dismiss = useCallback(
    (id: string) => {
      PaymentNotifications.removePending([id])
      refresh()
    },
    [refresh],
  )

  return {
    supported: PaymentNotifications.isSupported,
    enabled,
    pending,
    openSettings: PaymentNotifications.openSettings,
    dismiss,
  }
}
