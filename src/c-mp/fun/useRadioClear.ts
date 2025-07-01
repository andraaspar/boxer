import { useEffect } from './useEffect'

export function useRadioClear(getElem: () => HTMLElement) {
	useEffect('radioClear', () => {
		let wasChecked = false
		function onPointerDown(e: PointerEvent) {
			wasChecked = false
			if (
				e.target instanceof HTMLInputElement &&
				e.target.type === 'radio' &&
				e.target.checked
			) {
				wasChecked = true
			} else if (e.target instanceof HTMLLabelElement) {
				const radio =
					e.target.querySelector<HTMLInputElement>('input[type=radio]')
				if (radio?.checked) {
					wasChecked = true
				}
			}
		}
		function onClick(e: MouseEvent) {
			if (wasChecked) {
				if (
					e.target instanceof HTMLInputElement &&
					e.target.type === 'radio' &&
					e.target.checked
				) {
					e.target.checked = false
				} else if (e.target instanceof HTMLLabelElement) {
					const radio =
						e.target.querySelector<HTMLInputElement>('input[type=radio]')
					if (radio?.checked) {
						radio.checked = false
					}
				}
			}
		}
		getElem().addEventListener('pointerdown', onPointerDown, {
			capture: true,
		})
		getElem().addEventListener('click', onClick)
		return () => {
			getElem().removeEventListener('pointerdown', onPointerDown, {
				capture: true,
			})
			getElem().removeEventListener('click', onClick)
		}
	})
}
