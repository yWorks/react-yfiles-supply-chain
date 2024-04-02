import {
  RenderItemProps,
  SupplyChain,
  SupplyChainData,
  UserSupplyChainConnection,
  UserSupplyChainItem
} from '@yworks/react-yfiles-supply-chain'

import './index.css'

type MetalItem = UserSupplyChainItem & { price: string }

const data = {
  items: [
    { name: 'Copper', id: 1, price: 'USD 8500/t', className: 'copper', width: 180, height: 70 },
    { name: 'Zinc', id: 2, price: 'USD 2500/t', className: 'zinc', width: 180, height: 70 },
    { name: 'Brass', id: 3, price: 'USD 6500/t', className: 'brass', width: 180, height: 70 }
  ],
  connections: [
    { sourceId: 1, targetId: 3 },
    { sourceId: 2, targetId: 3 }
  ]
} satisfies SupplyChainData<MetalItem, UserSupplyChainConnection>

export function CustomSupplyChainItem({
  dataItem,
  detail,
  hovered,
  focused,
  selected
}: RenderItemProps<MetalItem>) {
  const customSupplyChainItem = dataItem

  return (
    <div
      className={customSupplyChainItem.className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: selected
          ? 'lightblue'
          : focused
            ? 'lightblue'
            : hovered
              ? 'white'
              : 'whitesmoke'
      }}
    >
      {detail === 'high' ? (
        <div>
          <div className="item-name">{customSupplyChainItem.name}</div>
          <div className="item-price">{customSupplyChainItem.price}</div>
        </div>
      ) : (
        <div className="item-summary">{customSupplyChainItem.name}</div>
      )}
    </div>
  )
}

/**
 * A simple example demonstrating the usage of a custom renderer for supply chain items.
 */
export default () => <SupplyChain data={data} renderItem={CustomSupplyChainItem}></SupplyChain>
