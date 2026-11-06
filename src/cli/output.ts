import type { ValidationPlan } from "../project/types.js";
export function publicPlan(plan: ValidationPlan): unknown {
  return {
    ...plan,
    stages: plan.stages.map(({ env, args, ...stage }) => ({
      ...stage,
      args: args.map(() => "[已隐藏]"),
      envKeys: Object.keys(env ?? {}),
    })),
  };
}
