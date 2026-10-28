package expo.modules.paymentnotifications

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** 확인 대기 중인 결제 알림. SharedPreferences에 JSON 배열로 둔다. */
object PendingStore {
  private const val PREFS = "fitbudget_payment_notifications"
  private const val KEY = "pending"
  private const val MAX = 100 // 오래 안 열어도 무한히 쌓이지 않게 최근 것만 남긴다

  @Synchronized
  fun add(context: Context, id: String, packageName: String, title: String, text: String, postedAt: Long) {
    val items = read(context)
    for (i in 0 until items.length()) if (items.getJSONObject(i).getString("id") == id) return
    items.put(
      JSONObject()
        .put("id", id)
        .put("packageName", packageName)
        .put("title", title)
        .put("text", text)
        .put("postedAt", postedAt),
    )
    val trimmed = JSONArray()
    for (i in maxOf(0, items.length() - MAX) until items.length()) trimmed.put(items.get(i))
    write(context, trimmed)
  }

  @Synchronized
  fun remove(context: Context, ids: List<String>) {
    val items = read(context)
    val kept = JSONArray()
    for (i in 0 until items.length()) {
      val item = items.getJSONObject(i)
      if (item.getString("id") !in ids) kept.put(item)
    }
    write(context, kept)
  }

  @Synchronized
  fun read(context: Context): JSONArray =
    JSONArray(prefs(context).getString(KEY, "[]"))

  private fun write(context: Context, items: JSONArray) =
    prefs(context).edit().putString(KEY, items.toString()).apply()

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
