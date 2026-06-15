import type { DashboardWidgetId } from "./dashboardLayout";

export function ordersEqual(a: DashboardWidgetId[], b: DashboardWidgetId[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}
