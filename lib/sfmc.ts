/**
 * Stub de integración con Salesforce Marketing Cloud. Fase 2: reemplazar
 * el cuerpo de estas funciones por las llamadas reales a la API de SFMC
 * (Journey Builder / Transactional Messaging) usando SFMC_CLIENT_ID,
 * SFMC_CLIENT_SECRET y SFMC_SUBDOMAIN. Por ahora solo loguean para que el
 * resto del flujo (cron de cierre, envío de propuestas) ya las invoque y
 * no haga falta tocar esos call sites cuando se implemente la fase 2.
 */

export async function triggerInvitacionSeller(sellerId: string): Promise<void> {
  console.log(`[SFMC stub] triggerInvitacionSeller(${sellerId}) — no-op, fase 2`);
}

export async function triggerPropuestaRecibida(propuestaId: string): Promise<void> {
  console.log(`[SFMC stub] triggerPropuestaRecibida(${propuestaId}) — no-op, fase 2`);
}

export async function triggerResultadoPropuesta(
  propuestaId: string,
  resultado: "GANADORA" | "RECHAZADA",
): Promise<void> {
  console.log(`[SFMC stub] triggerResultadoPropuesta(${propuestaId}, ${resultado}) — no-op, fase 2`);
}
