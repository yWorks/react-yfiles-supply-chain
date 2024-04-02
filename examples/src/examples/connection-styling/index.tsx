import {
  ConnectionStyle,
  ConnectionStyleProvider,
  FoldingConnection,
  SimpleConnectionLabel,
  SupplyChain,
  SupplyChainConnection,
  SupplyChainData,
  SupplyChainModel,
  UserSupplyChainConnection,
  UserSupplyChainItem
} from '@yworks/react-yfiles-supply-chain'

import './index.css'

const data = {
  items: [
    { name: 'Important ingredient', id: 1, important: true },
    { name: 'Unimportant ingredient', id: 2 },
    { name: 'Product', id: 3 }
  ],
  connections: [
    { sourceId: 1, targetId: 3 },
    { sourceId: 2, targetId: 3 }
  ]
} satisfies SupplyChainData<UserSupplyChainItem, UserSupplyChainConnection>

const importantConnectionStyle: ConnectionStyle = {
  className: 'important-edge',
  thickness: 6,
  smoothingLength: 10,
  targetArrow: {
    type: 'triangle',
    color: 'red'
  }
}

const unimportantConnectionStyle: ConnectionStyle = {
  className: 'unimportant-edge',
  thickness: 4,
  smoothingLength: 10,
  targetArrow: {
    type: 'triangle',
    color: 'blue'
  }
}

const connectionStyles: ConnectionStyleProvider<UserSupplyChainItem, UserSupplyChainConnection> = (
  data: {
    source: UserSupplyChainItem
    target: UserSupplyChainItem
    connection: UserSupplyChainConnection
  }[]
): ConnectionStyle | undefined => {
  if (data[0].source.important) {
    return importantConnectionStyle
  }
  return unimportantConnectionStyle
}

function connectionLabelProvider(
  item: SupplyChainConnection | FoldingConnection,
  { isFoldingConnection }: SupplyChainModel
): SimpleConnectionLabel | undefined {
  if (!isFoldingConnection(item)) {
    return {
      text: `From: ${item.sourceId}\n To: ${item.targetId}`,
      labelShape: 'round-rectangle'
    } satisfies SimpleConnectionLabel
  }
}

/**
 * A simple example demonstrating the usage of a connectionStyleProvider.
 */
export default () => (
  <SupplyChain
    data={data}
    connectionStyleProvider={connectionStyles}
    connectionLabelProvider={connectionLabelProvider}
  ></SupplyChain>
)
