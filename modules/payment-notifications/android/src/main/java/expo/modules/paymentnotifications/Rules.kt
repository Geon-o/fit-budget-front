package expo.modules.paymentnotifications

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * 어떤 알림을 결제 알림으로 볼지 정하는 규칙. 앱의 설정 탭에서 바꾸고, 알림 서비스가 매번 읽는다.
 * - apps: 감지할 앱 패키지 목록. null이면 모든 앱
 * - include: 이 중 하나라도 들어 있어야 함(비어 있으면 단어 조건 없음)
 * - exclude: 하나라도 들어 있으면 버림
 * 금액("N원")은 규칙과 상관없이 항상 있어야 한다.
 */
data class Rules(val apps: List<String>?, val include: List<String>, val exclude: List<String>) {
  fun matches(packageName: String, content: String): Boolean =
    (apps == null || packageName in apps) &&
      AMOUNT.containsMatchIn(content) &&
      (include.isEmpty() || include.any { content.contains(it) }) &&
      exclude.none { content.contains(it) }

  fun toJson(): JSONObject =
    JSONObject()
      .put("apps", apps?.let { JSONArray(it) } ?: JSONObject.NULL)
      .put("include", JSONArray(include))
      .put("exclude", JSONArray(exclude))

  companion object {
    private val AMOUNT = Regex("[0-9][0-9,]*\\s*원")
    private const val PREFS = "fitbudget_payment_notifications"
    private const val KEY = "rules"
    val DEFAULT = Rules(apps = null, include = listOf("승인", "결제", "출금", "사용"), exclude = listOf("취소"))

    fun read(context: Context): Rules {
      val raw = prefs(context).getString(KEY, null) ?: return DEFAULT
      return fromJson(JSONObject(raw))
    }

    fun write(context: Context, json: String) {
      // 잘못된 값이 저장돼 감지가 멈추지 않도록 한 번 파싱해 보고 저장한다
      prefs(context).edit().putString(KEY, fromJson(JSONObject(json)).toJson().toString()).apply()
    }

    private fun fromJson(o: JSONObject) =
      Rules(
        apps = if (o.isNull("apps")) null else o.getJSONArray("apps").toStringList(),
        include = o.optJSONArray("include")?.toStringList() ?: DEFAULT.include,
        exclude = o.optJSONArray("exclude")?.toStringList() ?: DEFAULT.exclude,
      )

    private fun JSONArray.toStringList() = List(length()) { getString(it) }

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
  }
}
