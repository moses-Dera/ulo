import { registerAuditListeners } from "./audit";
import { registerNotificationListeners } from "./notifications";

let bootstrapped = false;

export function bootstrapModules() {
  if (bootstrapped) return;
  registerAuditListeners();
  registerNotificationListeners();
  bootstrapped = true;
}

bootstrapModules();
