import { IProps } from "./IProps"

export interface IPropsWithChildrenMaybe extends IProps {
	children?: (JSX.Element | string) | (JSX.Element | string)[]
}
