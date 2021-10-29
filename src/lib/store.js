import { writable } from 'svelte/store'

export const dataHasChanged = writable(false)
export const newCommitment = writable(false)