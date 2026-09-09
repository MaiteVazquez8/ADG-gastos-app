/** Registers the "@/" alias loader; drived via `node --import` in `test:logic`. */
import { register } from 'node:module';

register(new URL('./alias-loader.mjs', import.meta.url));