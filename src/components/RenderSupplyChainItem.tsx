import { UserSupplyChainItem, SupplyChainItem } from '../SupplyChain.tsx'
import { getUserProperties, getHighlightClasses, stringifyData } from './template-utils.ts'
import { RenderNodeProps as RenderItemProps } from '@yworks/react-yfiles-core'
import { Fragment } from 'react'

/**
 * A default component that visualizes nodes in the supply chain. The detail view displays a data grid of all available properties
 * on the data item. The overview visualization only shows the items `name` or `id`. The component can be adjusted for each item
 * individually or for all items at once by setting {@link SupplyChainBaseItem.className} or {@link SupplyChainBaseItem.style} in the
 * data.
 *
 * The component is used as the default visualization if no `renderItem` prop is specified on {@link SupplyChain}.
 * However, it can be integrated in another component, for example, to have different styles for different items.
 *
 * ```tsx
 * function SupplyChainComponent() {
 *     const MySupplyChainItem = useMemo(
 *       () => (props: RenderItemProps<SupplyChainItem>) => {
 *         const { dataItem } = props
 *         if (dataItem?.name?.includes('Plate')) {
 *           return (
 *             <>
 *               <div
 *                 style={{
 *                   backgroundColor: 'lightblue',
 *                   width: '100%',
 *                   height: '100%'
 *                 }}
 *               >
 *                 <div>{dataItem.name}</div>
 *               </div>
 *             </>
 *           )
 *         } else {
 *           return <RenderSupplyChainItem {...props}></RenderSupplyChainItem>
 *         }
 *       },
 *       []
 *     )
 *
 *     return (
 *       <SupplyChain data={data} renderItem={MySupplyChainItem}></SupplyChain>
 *     )
 *   }
 * ```
 */
export function RenderSupplyChainItem<TSupplyChainItem extends SupplyChainItem>({
  dataItem,
  detail,
  hovered,
  focused,
  selected
}: RenderItemProps<TSupplyChainItem>) {
  const customSupplyChainItem = dataItem as UserSupplyChainItem & { __color?: string }
  const properties = getUserProperties(customSupplyChainItem)

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
        className={`yfiles-react-detail-node ${getHighlightClasses(selected, hovered, focused)} ${
          customSupplyChainItem.__color
            ? `yfiles-react-color__${customSupplyChainItem.__color}`
            : 'yfiles-react-color__white'
        }`}
      >
        {detail === 'high' ? (
          <div
            className={`${customSupplyChainItem.className ?? ''}`.trim()}
            style={customSupplyChainItem.style ?? {}}
          >
            <div className="yfiles-react-detail-node__content">
              {customSupplyChainItem.name && (
                <div className="yfiles-react-detail-node__name">{customSupplyChainItem.name}</div>
              )}
              <div className="yfiles-react-detail-node__data-grid">
                {Object.entries(properties).map(([property, value], i) => (
                  <Fragment key={i}>
                    <div className="yfiles-react-detail-node__data-grid--key">{property}</div>
                    <div className="yfiles-react-detail-node__data-grid--value">
                      {stringifyData(value)}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`yfiles-react-overview-node yfiles-react-${
              customSupplyChainItem.status ?? ''
            } ${customSupplyChainItem.className ?? ''}`.trim()}
            style={customSupplyChainItem.style ?? {}}
          >
            {customSupplyChainItem.name ?? customSupplyChainItem.id}
          </div>
        )}
      </div>
    </>
  )
}
