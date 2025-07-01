import { log3 } from '../fun/log'
import { Comp, defineComponent, useComponent } from '../fun/useComponent'
import { untrack, useEffect } from '../fun/useEffect'
import { IProps } from '../model/IProps'

export type TThenValue<T> = Exclude<T, false | null | undefined | 0 | '' | 0n>
export type TThenValueGetter<T> = () => TThenValue<T>

// This is a placeholder value, so the comparison with the last value fails the
// first time.
const NEVER = Symbol('NEVER')

export interface IShowProps<T> extends IProps {
	when: (() => T) | undefined
	then?: (store: TThenValueGetter<T>) => JSX.Element | string
	else?: () => JSX.Element | string
}

export const Show = defineComponent(
	'Show',
	<T>(props: IShowProps<T>, $: Comp<IShowProps<T>>) => {
		// Remember the last value to be able to decide if we need to recreate the
		// content.
		let value: T | undefined = NEVER as T

		// Last kill function is stored here, because it can survive multiple effect
		// reruns.
		let lastComp: Comp<any> | undefined

		useEffect($.debugName, () => {
			const lastValue = value
			value = props.when?.()
			log3(`💫 ${$.debugName} value:`, lastValue, `→`, value)
			if (lastValue !== NEVER && !value === !lastValue) return

			untrack($.debugName, () => {
				lastComp?.remove()

				// Create a component, so inner effects will be cleaned up properly, when
				// the shown branch changes.
				lastComp = useComponent<IShowInnerProps<T>>(ShowInner, {
					debugName: props.debugName,
					isTruthy: !!value,
					then: props.then,
					else: props.else,
					getValue: () => value as any,
				})
				$.append(lastComp)
			})
		})

		return $
	},
)

interface IShowInnerProps<T> extends IProps {
	isTruthy: boolean
	getValue: TThenValueGetter<T>
	then?: (get: TThenValueGetter<T>) => JSX.Element | string
	else?: () => JSX.Element | string
}
const ShowInner = defineComponent(
	'ShowInner',
	<T>(props: IShowInnerProps<T>, $: Comp<IShowInnerProps<T>>) => {
		let elems = props.isTruthy ? props.then?.(props.getValue) : props.else?.()
		if (elems) $.append(elems)
		return $
	},
)
