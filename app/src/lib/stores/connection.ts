import type TKey from '$lib/TKey';
import { writable } from 'svelte/store';

export const connection = writable({} as InstanceType<typeof TKey.TkeyConnection>);
