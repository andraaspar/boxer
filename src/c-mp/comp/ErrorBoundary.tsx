import { stripStack } from "../fun/stripStack"
import { Comp, defineComponent, useComponent } from "../fun/useComponent"
import { IProps } from "../model/IProps"

export interface IErrorBoundaryCatchProps extends IProps {
	getError: () => string
	reset: () => void
}

export interface IErrorBoundaryProps extends IProps {
	try: () => JSX.Element
	catch: (p: IErrorBoundaryCatchProps) => JSX.Element
}

export const ErrorBoundary = defineComponent<IErrorBoundaryProps>(
	"ErrorBoundary",
	(props, $) => {
		let error: unknown

		$.onError = (e) => {
			stripStack(e)
			console.error(`${$.debugName}:`, e)
			error = e
			render()
		}
		function reset() {
			error = undefined
			render()
		}
		function getError() {
			return error ? error + "" : ""
		}

		let lastComponent: Comp<any> | undefined
		function render() {
			lastComponent?.remove()
			lastComponent = useComponent(ErrorBoundaryInner, {
				...props,
				getError,
				reset,
			})
			$.append(lastComponent)
		}

		render()

		return $
	},
)

const ErrorBoundaryInner = defineComponent<
	IErrorBoundaryCatchProps & IErrorBoundaryProps
>("ErrorBoundaryInner", (props, $) => {
	const { getError, reset, debugName } = props
	$.append(
		getError() ? props.catch({ debugName, getError, reset }) : props.try(),
	)
	return $
})
