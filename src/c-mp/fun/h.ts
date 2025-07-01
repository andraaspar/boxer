import { IAttributes } from '../model/IAttributes'
import { IProps } from '../model/IProps'
import { IPropsWithChildrenMaybe } from '../model/IPropsWithChildrenMaybe'
import { activeComps, Comp, IComponentInit, useComponent } from './useComponent'
import { useEffect } from './useEffect'

export function h<P extends IProps, C extends IComponentInit<P>>(
	name: C,
	attrs: P
): Comp<P>
export function h<
	N extends keyof HTMLElementTagNameMap,
	P extends Partial<HTMLElementTagNameMap[N]>
>(
	name: N,
	attrs: IAttributes<HTMLElementTagNameMap[N]>
): HTMLElementTagNameMap[N]
export function h(
	name: string,
	attrs: IAttributes<HTMLElement>,
	...children: (Element | string)[]
): Element
export function h(
	name: string | Function,
	attrs: IPropsWithChildrenMaybe | IAttributes<HTMLElement>
	// maybeKey?: unknown,
	// isStaticChildren?: boolean,
	// source?: ISource,
	// self?: unknown,
): Element {
	if (typeof name === 'function') {
		return useComponent(name as any, attrs as any)
	} else {
		const elem = document.createElement(name)
		if (attrs) {
			const activeComponent = activeComps.at(-1)
			for (const [k, v] of Object.entries(attrs as IAttributes<HTMLElement>)) {
				if (k === 'className' && typeof v === 'function') {
					useEffect(`${activeComponent?.debugName}.${name}.${k}`, () => {
						const it = v(elem)
						if (Array.isArray(it)) elem.className = it.filter(Boolean).join(' ')
						else if (typeof it === 'string') elem.className = it
						else elem.className = ''
					})
				} else if (k === 'className' && Array.isArray(v)) {
					elem.className = v.filter(Boolean).join(' ')
				} else if (k === 'bindElement' && typeof v === 'function') {
					try {
						v(elem)
					} catch (e) {
						console.error(e)
					}
				} else if (
					typeof v === 'function' &&
					!k.startsWith('on') &&
					!name.includes('-')
				) {
					useEffect(`${activeComponent?.debugName}.${name}.${k}`, () => {
						;(elem as any)[k] = v()
					})
				} else if (k === 'children') {
				} else {
					;(elem as any)[k] = v
				}
			}
		}
		if (Array.isArray(attrs.children)) {
			elem.append(...attrs.children)
		} else if (attrs.children) {
			elem.append(attrs.children)
		}

		return elem
	}
}
