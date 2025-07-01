import { HIGHLIGHT } from '../model/HIGHLIGHT'
import { IProps } from '../model/IProps'
import { h } from './h'
import { log2Group, log2GroupEnd } from './log'

const debugNameByInit = new Map<IComponentInit<any>, string>()

export interface IComponentInit<P extends IProps = IProps> {
	(props: P, $: Comp<P>): JSX.Element
}

export const activeComps: Comp<any>[] = []

export class Comp<P> extends HTMLElement {
	constructor() {
		super()
	}

	props: (P & IProps) | undefined
	init: IComponentInit<P & IProps> | undefined

	get debugName(): string {
		return (
			((this.init && debugNameByInit.get(this.init)) ?? 'c-mp') +
			(this.props?.debugName ? `(${this.props.debugName})` : '')
		)
	}

	parentComp: Comp<any> | null | undefined
	kills: (() => void)[] = []

	onError: ((e: unknown) => void) | undefined

	wasConnected = false

	connectedCallback() {
		if (this.wasConnected) {
			throw new Error(`[swczjp] Component was already connected.`)
		}

		// It makes no sense, but this can sometimes happen.
		if (!this.isConnected) return
		this.wasConnected = true

		// The component enters the DOM. It initializes a context and calls the
		// component function inside.

		this.parentComp =
			activeComps.at(-1) ?? this.parentElement?.closest<Comp<any>>('c-mp')
		log2Group(
			`☀️ Component connected: %c${this.debugName}`,
			HIGHLIGHT,
			this,
			'inside',
			this.parentComp ?? this.parentNode,
		)

		const initName = this.init
			? debugNameByInit.get(this.init) ?? this.init.name
			: 'Comp'
		const debugName =
			this.props &&
			'debugName' in this.props &&
			typeof this.props.debugName === 'string'
				? `${initName}(${this.props.debugName})`
				: initName
		this.setAttribute('is', debugName)

		activeComps.push(this)
		try {
			this.init?.(this.props!, this as any)
		} catch (e) {
			this.handleError(e)
		} finally {
			activeComps.pop()
			log2GroupEnd()
		}
	}

	handleError(e: unknown) {
		let handled = false
		if (this.onError) {
			try {
				log2Group(`🎯 Handling error: %c${name}`, HIGHLIGHT)
				this.onError(e)
				handled = true
			} catch (e) {
				console.error(e)
			} finally {
				log2GroupEnd()
			}
		}
		if (!handled) {
			if (this.parentComp) {
				log2Group(`🔍 Looking for error handler: %c${name}`, HIGHLIGHT)
				this.parentComp.handleError(e)
				log2GroupEnd()
			} else {
				log2Group(`⚠️ Failed to handle error: %c${name}`, HIGHLIGHT)
				console.error(e)
				this.remove()
				log2GroupEnd()
			}
		}
	}

	disconnectedCallback() {
		// This matters because of disconnected components going through the lifecycle.
		if (!this.wasConnected) return

		// The component is removed from the DOM, or is being moved around. It kills
		// the context.
		log2Group(
			`🌑 Component disconnected: %c${this.debugName}`,
			HIGHLIGHT,
			this,
			'from',
			this.parentComp ?? this.parentNode,
		)

		this.parentComp = undefined

		while (this.kills.length) {
			this.kills.shift()?.()
		}

		this.innerHTML = ''

		this.wasConnected = false
		log2GroupEnd()
	}
}

customElements.define('c-mp', Comp)

let cssAdded = false
export function useComponent<P extends IProps>(
	init: IComponentInit<P>,
	props: P,
) {
	if (!cssAdded) {
		cssAdded = true
	}
	return h('c-mp', { props, init }) as Comp<P>
}

// This one is for basic needs. No separate interface required for declaring
// props.
export function defineComponent<
	P,
	I extends IComponentInit<P & IProps> = IComponentInit<P & IProps>,
>(debugName: string, init: I): I
// This one is for templated functions. Use it with a separate interface that
// extends IProps.
export function defineComponent<T extends IComponentInit<any>>(
	debugName: string,
	init: T,
): T
export function defineComponent<T extends IComponentInit<any>>(
	debugName: string,
	init: T,
): T {
	debugNameByInit.set(init, debugName)
	return init
}
