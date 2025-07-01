import { defineComponent } from '../fun/useComponent'
import { untrack, useEffect } from '../fun/useEffect'

export type TSlotValue = JSX.Element | string | null | undefined

export const Slot = defineComponent<{
	get: (() => TSlotValue) | undefined
	isTrustedHtml?: boolean
}>('Slot', (props, $) => {
	let value: TSlotValue
	useEffect($.debugName, () => {
		let lastValue = value
		value = props.get?.()
		if (Object.is(lastValue, value)) return
		untrack($.debugName, () => {
			$.innerHTML = ''
			if (value) {
				if (props.isTrustedHtml && typeof value === 'string')
					$.innerHTML = value
				else $.append(value)
			}
		})
	})
	return $
})
