declare module '@neondatabase/serverless' {
  export function neon(connectionString: string): (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
}
