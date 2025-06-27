declare module "prettier/standalone" {
  export function format(
    source: string,
    options?: Record<string, unknown>,
  ): string;
}
