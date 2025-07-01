import { activeComps } from './useComponent'

let applied = new Set<string>()

export function css(strings: TemplateStringsArray, ...values: any[]) {
	const css = String.raw(strings, values)
	if (applied.has(css)) return
	const style = document.createElement('style')
	style.append(css)
	findStyleParent(activeComps.at(-1)).append(style)
}

function findStyleParent(elem: HTMLElement | null | undefined) {
	while (true) {
		if (!elem) return document.head
		if (elem.shadowRoot) return elem.shadowRoot
		elem = elem.parentElement
	}
}
