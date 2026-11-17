/**
 * Qamrovi cheklangan rollar — YAGONA manba.
 *
 * ═══ Nega oq ro'yxat (allowlist), qora emas ════════════════════════════
 *
 * `SidebarComponent` dagi eski mantiq teskari ishlaydi: menyu elementida
 * `roles` ko'rsatilmagan bo'lsa u HAMMAGA ko'rinadi. Shu sababli cheklangan
 * rolni qora ro'yxat bilan qurib bo'lmaydi — ertaga menyuga yangi element
 * qo'shilsa, u avtomatik ravishda cheklangan rolga ham ochilib ketardi va
 * buni hech kim sezmasdi.
 *
 * Shuning uchun bu yerda TESKARISI: rol shu jadvalda bo'lsa, u FAQAT sanab
 * o'tilgan yo'llarni ko'radi. Yangi sahifa qo'shilganda u yopiq qoladi —
 * ochish uchun ataylab shu ro'yxatga yozish kerak.
 *
 * ═══ Ikki joyda ishlatiladi ════════════════════════════════════════════
 *
 *   1. `SidebarComponent` — menyuni filtrlaydi (ko'rinish);
 *   2. `App.tsx` dagi `ScopeGuard` — manzilni tekshiradi (himoya).
 *
 * ⚠️ Ikkinchisi majburiy: menyudan yashirish YETARLI EMAS. Foydalanuvchi
 * manzilni qo'lda yozib kiraverardi, chunki `ProtectedRoute` faqat login
 * qilinganini tekshiradi, rolni emas.
 *
 * ⚠️ Bu — QULAYLIK qatlami, haqiqiy himoya emas. Ma'lumotni backend
 * himoya qiladi (`UniversalRoleGuard` + `@Roles()`): cheklangan rol
 * boshqa modul endpointiga murojaat qilsa `403` oladi. Bu yerdagi filtr
 * shunchaki foydalanuvchiga baribir ishlamaydigan sahifani ko'rsatmaslik
 * uchun.
 */
export const ROLE_SCOPE: Record<string, string[]> = {
  /**
   * «Investment Project Monitoring» (`/factory`) va uning xaritasi
   * (`/factorymap`). Ikkalasi ham backenddagi bitta `factory` modulidan
   * o'qiydi, shuning uchun birga turadi.
   */
  factory_manager: ["/factory", "/factorymap"],
};

/** Rolning qamrovi; cheklanmagan rol uchun `null`. */
export function scopeOf(role: string | null | undefined): string[] | null {
  if (!role) return null;
  return ROLE_SCOPE[role] ?? null;
}

/**
 * Yo'l shu rolga ochiqmi.
 *
 * Moslik aniq yoki prefiks bo'yicha: `/employers` ruxsat etilsa
 * `/employers/branches` ham ochiladi. Oddiy `startsWith` ishlatilmaydi —
 * u `/factory` ga `/factorymap` ni ham qo'shib yuborardi, ya'ni ro'yxatda
 * bo'lmagan sahifa jimgina ochilib ketardi.
 */
export function isPathAllowed(role: string | null | undefined, pathname: string): boolean {
  const scope = scopeOf(role);
  if (scope === null) return true;
  return scope.some((base) => pathname === base || pathname.startsWith(base + "/"));
}

/** Cheklangan rol kirganda tushadigan sahifa — qamrovidagi birinchisi. */
export function homeFor(role: string | null | undefined): string | null {
  const scope = scopeOf(role);
  return scope && scope.length > 0 ? scope[0] : null;
}
