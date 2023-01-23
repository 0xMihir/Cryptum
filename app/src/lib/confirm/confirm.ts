import type { Subscriber, Unsubscriber } from 'svelte/store';
import { writable, get } from 'svelte/store';

export enum ConfirmStage {
	Ask,
	Confirm,
	Cancel,
	None
}

// this is the data that will actually be returned by subscribe and used by the Confirmation component
export interface ConfirmStageData {
	// current stage
	stage: ConfirmStage;
	errorMessage?: string | null;
}

export type ConfirmResult = ConfirmOk | ConfirmError;

export interface ConfirmOk {
	type: 'ok';
}

export interface ConfirmError {
	type: 'error';
	message: string;
}

export const ConfirmOk: ConfirmResult = {
	type: 'ok'
};

export const ConfirmError = (message: string): ConfirmResult => {
	return {
		type: 'error',
		message: message
	};
};

export interface ConfirmationStore {
	// TODO: figure out how to specify this type
	subscribe(run: Subscriber<ConfirmStageData>, invalidate?: any): Unsubscriber;
	set(value: ConfirmStageData): void;
	// used to unsubscribe the old callback
	unsubscribe?: Unsubscriber;
	// calls unsubsribe if it exists
	destroy(): void;
	confirm(callback: (confirmed: boolean) => Promise<ConfirmResult>): void;
	callback?: (confirmed: boolean) => Promise<ConfirmResult>;
}

export function newConfirm(): ConfirmationStore {
	const startData: ConfirmStageData = {
		stage: ConfirmStage.None
	};
	const { subscribe, set, update } = writable(startData);

	return {
		subscribe,
		set,
		destroy(): void {
			if (this.unsubscribe) {
				this.unsubscribe();
			}
		},
		confirm(callback: (confirmed: boolean) => Promise<ConfirmResult>) {
			// only create the new subscription if we are not already subscribed
			if (!this.unsubscribe) {
				const unsubscribe = subscribe(async (value) => {
					const stage = value.stage;
					if (stage === ConfirmStage.Confirm) {
						if (this.callback) {
							const result = await this.callback(true);
							if (result.type === 'ok') {
								set({
									stage: ConfirmStage.None
								});
							} else {
								set({
									stage: ConfirmStage.Ask,
									errorMessage: result.message
								});
							}
						}
					} else if (stage === ConfirmStage.Cancel) {
						if (this.callback) {
							this.callback(false);
						}
						set({
							stage: ConfirmStage.None
						});
					}
				});
				this.unsubscribe = unsubscribe;
			}

			// prevent this from being called if a popup is already open
			if (get(this).stage === ConfirmStage.None) {
				this.callback = callback;
				set({
					stage: ConfirmStage.Ask
				});
			}
		}
	};
}
