import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;

export function getServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  return serverSchema.parse(env);
}

export function getPublicEnv(
  env: NodeJS.ProcessEnv = process.env,
): PublicEnv {
  return publicSchema.parse(env);
}

export function getAppPorts() {
  return {
    web: 3000,
    newsroom: 3001,
    control: 3002,
  } as const;
}
