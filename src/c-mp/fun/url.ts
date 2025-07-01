export function url(strs: TemplateStringsArray, ...values: any[]) {
	return String.raw(
		strs,
		values.map((it) => encodeURIComponent(it + ''))
	)
}
