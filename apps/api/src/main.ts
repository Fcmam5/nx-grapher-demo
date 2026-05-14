import { data } from "@nx-grapher-demo/data";

export function api(): string {
  return `api uses ${data()}`;
}

console.log(api());
