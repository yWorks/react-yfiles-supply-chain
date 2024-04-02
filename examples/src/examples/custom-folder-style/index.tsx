import {
  RenderGroupProps,
  SupplyChain,
  SupplyChainData,
  SupplyChainProvider,
  UserSupplyChainItem,
  UserSupplyChainConnection,
  useSupplyChainContext
} from '@yworks/react-yfiles-supply-chain'

const data = {
  items: [
    { name: 'Copper', id: 1, price: 'USD 8500/t', parentId: 4 },
    { name: 'Zinc', id: 2, price: 'USD 2500/t', parentId: 4 },
    { name: 'Brass', id: 3, price: 'USD 6500/t', parentId: 5 },
    { name: 'Elements', id: 4 },
    { name: 'Alloys', id: 5 }
  ],
  connections: [
    { sourceId: 1, targetId: 3 },
    { sourceId: 2, targetId: 3 }
  ]
} satisfies SupplyChainData<UserSupplyChainItem, UserSupplyChainConnection>

function RenderItem(props: RenderGroupProps<UserSupplyChainItem>) {
  const dataItem = props.dataItem
  const { isFolderNode } = props
  const supplyChainContext = useSupplyChainContext()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: isFolderNode ? 'lightblue' : 'white'
      }}
    >
      {isFolderNode && (
        <button onClick={() => supplyChainContext.toggleExpansionState(dataItem)}>
          Expand {dataItem.name}
        </button>
      )}
      {!isFolderNode && (
        <div style={{ display: 'flex', justifyItems: 'flex-start', alignItems: 'center' }}>
          <button onClick={() => supplyChainContext.toggleExpansionState(dataItem)}>
            Collapse {dataItem.name}
          </button>
        </div>
      )}
    </div>
  )
}

export default () => (
  <SupplyChainProvider>
    <SupplyChain data={data} renderGroup={RenderItem}></SupplyChain>
  </SupplyChainProvider>
)
