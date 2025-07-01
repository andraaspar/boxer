export function errorOrMessageToMessage(e: unknown) {
	return e ? (e + '').replace(/^Error:\s*/, '') : ''
}
