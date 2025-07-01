import { defineComponent } from '../c-mp/fun/useComponent'
import { _ } from './classes'

export const AppComp = defineComponent<{}>('AppComp', (props, $) => {
	$.append(
		<>
			<div className={_.ccc_toolbar}>
				<div className={_.ccc_label}>📦 Boxer</div>
				<select className={_.ccc_menu} onchange={onFileMenu}>
					<button>File</button>
					<option hidden value=''>
						File
					</option>
					<option>New</option>
					<option>Open</option>
					<option>Save</option>
				</select>
			</div>
			<div className={_.ccc_canvas}></div>
		</>,
	)

	function onFileMenu(e: Event) {
		const elem = e.target as HTMLSelectElement

		switch (elem.value) {
			case 'New':
				break
			case 'Open':
				break
			case 'Save':
				break
		}

		elem.value = ''
	}

	return $
})
