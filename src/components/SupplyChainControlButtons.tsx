import { ControlButton, DefaultControlButtons } from '@yworks/react-yfiles-core'

/**
 * Default [buttons]{@link ControlsProps.buttons} for the {@link Controls} component that provide
 * actions to interact with the viewport of the supply chain.
 *
 * This includes the following buttons: zoom in, zoom out, zoom to the original size and fit the graph into the viewport.
 *
 * @returns an array of [control buttons]{@link ControlsProps.buttons}.
 *
 * ```tsx
 * function SupplyChain() {
 *   return (
 *     <SupplyChain data={data}>
 *       <Controls buttons={SupplyChainControlButtons}></Controls>
 *     </SupplyChain>
 *   )
 * }
 * ```
 */
export function SupplyChainControlButtons(): ControlButton[] {
  return DefaultControlButtons()
}
