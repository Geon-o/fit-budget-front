package expo.modules.paymentnotifications

import android.content.Intent
import org.json.JSONArray
import org.json.JSONObject
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

    // 감지 규칙(JSON 문자열). 설정 탭에서 읽고 바꾼다.
    Function("getRules") {
      Rules.read(context).toJson().toString()
    }

    Function("setRules") { json: String ->
      Rules.write(context, json)
    }

    // 감지할 앱을 고르기 위한, 홈 화면에 아이콘이 있는 앱 목록(이름순)
    Function("getInstalledApps") {
      val pm = context.packageManager
      val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      val apps = JSONArray()
      pm.queryIntentActivities(launcher, 0)
        .map { it.activityInfo.packageName to it.loadLabel(pm).toString() }
        .distinctBy { it.first }
        .filter { it.first != context.packageName }
        .sortedBy { it.second }
        .forEach { (pkg, label) -> apps.put(JSONObject().put("packageName", pkg).put("label", label)) }
      apps.toString()
    }
  }
}
