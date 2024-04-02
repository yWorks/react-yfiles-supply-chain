import '../styles/supply-chain-tooltip.css'
import { FoldingConnection, SupplyChainConnection, SupplyChainItem } from '../SupplyChain.tsx'
import { getUserProperties, stringifyData } from './template-utils.ts'
import { RenderTooltipProps } from '@yworks/react-yfiles-core'
import { Fragment } from 'react'
import { useSupplyChainContext } from '../SupplyChainProvider.tsx'

/**
 * A default template for the supply chain's tooltip that shows the `name` or `id` property of the data item
 * and a data-grid of the properties.
 *
 * ```tsx
 * function SupplyChainComponent() {
 *   return (
 *     <SupplyChain data={data} renderTooltip={RenderSupplyChainTooltip}></SupplyChain>
 *   )
 * }
 * ```
 *
 * @param data - The data item to show the tooltip for.
 */
export function RenderSupplyChainTooltip<
  TSupplyChainItem extends SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection
>({
  data
}: RenderTooltipProps<
  TSupplyChainItem | TSupplyChainConnection | FoldingConnection<TSupplyChainConnection>
>) {
  const context = useSupplyChainContext()!

  if (!data) {
    return null
  }

  let title = ''
  if (context.isConnection(data)) {
    if (context.isFoldingConnection(data)) {
      const containedConnections = data.connections.length
      title = `${containedConnections} connection${containedConnections > 1 ? 's' : ''}`
    } else {
      title = `${data.sourceId} -> ${data.targetId}`
    }
  } else {
    title = data.name ?? String(data.id)
  }

  const properties = getUserProperties(data)
  return (
    <div className="yfiles-react-tooltip">
      {title && <div className="yfiles-react-tooltip__name">{stringifyData(title)}</div>}
      <div className="yfiles-react-tooltip__data-grid">
        {Object.entries(properties).map(([property, value], i) => (
          <Fragment key={i}>
            <div className="yfiles-react-tooltip__data-grid--key">{property}</div>
            <div className="yfiles-react-tooltip__data-grid--value">{stringifyData(value)}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
