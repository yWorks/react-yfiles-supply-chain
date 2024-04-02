import { SupplyChain, SupplyChainData } from '@yworks/react-yfiles-supply-chain'

const data = {
  items: [
    { name: 'Copper-Ore', id: 1, parentId: 3 },
    { name: 'Copper-Plate', id: 2, parentId: 4 },
    { name: 'Resource', id: 3 },
    { name: 'Material', id: 4 }
  ],
  connections: [{ sourceId: 1, targetId: 2 }]
} satisfies SupplyChainData

/**
 * The most basic usage of the supply chain component without any customizations.
 */
export default () => <SupplyChain data={data}></SupplyChain>
