import { data } from '@nx-grapher-demo/data';
import { utils } from '@nx-grapher-demo/utils';

export function api(): string {
  return `api uses ${data()} and ${utils()}`;
}

console.log(api());
