package expo.modules.paymentnotifications

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * 다른 앱의 알림 중 결제 알림처럼 보이는 것(Rules)만 기기에 저장한다(앱이 꺼져 있어도 동작).
 * 저장된 알림은 앱을 열었을 때 "확인 대기" 목록으로 보여주고, 사용자가 확인해야 지출이 된다.
 * 결제 알림이 아닌 알림 내용은 저장하지 않고 바로 버린다.
 */
class PaymentNotificationService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    if (sbn.packageName == packageName) return
    val extras = sbn.notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
    val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT) ?: extras.getCharSequence(Notification.EXTRA_TEXT))
      ?.toString().orEmpty()
    if (!Rules.read(this).matches(sbn.packageName, "$title $text")) return

    PendingStore.add(
      this,
      // 같은 알림이 갱신돼 다시 올라와도 한 번만 담기도록 알림 key + 내용으로 식별한다
      id = "${sbn.key}|${text.hashCode()}",
      packageName = sbn.packageName,
      title = title,
      text = text,
      postedAt = sbn.postTime,
    )
  }
}
