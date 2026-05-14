import { ui } from "@nx-grapher-demo/ui";
import { utils } from "@nx-grapher-demo/utils";

export function web(): string {
  return `web uses ${ui()} and ${utils()}`;
}

console.log(web());
