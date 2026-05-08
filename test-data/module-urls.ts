/**
 * Scriptcase route fragments — keep centralized (avoid hardcoding in specs).
 */
export const ModuleURLs = {
  /** Default landing after login — adjust if app uses another default */
  eyepaxRoot: '/EYEPAX/',
  dashboard: '/EYEPAX/?nmgp_opcao=dashboard',
  culturalDashboard: '/EYEPAX/?nmgp_opcao=cultural_dashboard',
  productionTeams: '/EYEPAX/?nmgp_opcao=production_teams',
  procedureMisses: '/EYEPAX/?nmgp_opcao=procedure_misses',
} as const;

export function loginPagePath(): string {
  return process.env.E2E_LOGIN_PATH ?? '/app_login/';
}
