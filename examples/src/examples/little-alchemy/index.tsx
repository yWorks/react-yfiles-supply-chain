import {
  UserSupplyChainItem,
  UserSupplyChainConnection,
  RenderSupplyChainTooltip,
  SupplyChain,
  FoldingConnection,
  SupplyChainModel,
  SimpleConnectionLabel
} from '@yworks/react-yfiles-supply-chain'
import { useState } from 'react'
import { LittleAlchemyNode } from './LittleAlchemyNode.tsx'
import { getLittleAlchemyElementFromName, getNeighbors } from './data-utils.ts'

// initial start data
const startItemName = 'cat'
const [id] = getLittleAlchemyElementFromName(startItemName)!
const data = getNeighbors(id)

function connectionLabelProvider(
  item: UserSupplyChainConnection | FoldingConnection,
  { isFoldingConnection }: SupplyChainModel
): SimpleConnectionLabel | undefined {
  if (!isFoldingConnection(item)) {
    return {
      text: item.name ?? '',
      labelShape: 'round-rectangle',
      className: 'default-connection-label'
    } satisfies SimpleConnectionLabel
  }
}

export default () => {
  const [graphData, setGraphData] = useState(data)

  function focusItem(itemData: UserSupplyChainItem | UserSupplyChainConnection | null) {
    if (itemData?.id) {
      setGraphData(getNeighbors(itemData.id as string))
    }
  }

  return (
    <SupplyChain
      data={graphData}
      renderTooltip={RenderSupplyChainTooltip}
      renderItem={LittleAlchemyNode}
      connectionLabelProvider={connectionLabelProvider}
      onItemFocus={itemData => focusItem(itemData)}
    ></SupplyChain>
  )
}
