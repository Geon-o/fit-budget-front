package expo.modules.paymentnotifications

import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PaymentNotificationsModule : Module() {
  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("PaymentNotifications")

    // 설정 > 알림 접근에서 이 앱이 허용돼 있는지
    Function("isEnabled") {
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName)
    }

    Function("openSettings") {
      context.startActivity(
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    // 확인 대기 목록(JSON 문자열). 파싱·표시는 JS에서 한다.
    Function("getPending") {
      PendingStore.read(context).toString()
    }

    Function("remove") { ids: List<String> ->
      PendingStore.remove(context, ids)
    }
  }
}
