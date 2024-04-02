import {
  SupplyChainData,
  UserSupplyChainConnection,
  UserSupplyChainItem
} from '@yworks/react-yfiles-supply-chain'

type MyItemType = {
  stack_size?: number
}
type MyConnectionType = {
  amount: number
}

export const SmallSampleData = {
  items: [
    { name: 'Natural Resource', id: 0 },
    { name: 'Landscape', id: 1 },
    { name: 'Craftsmanship', id: 2 },
    { name: 'Celestial-Artifacts', id: 3 },
    { name: 'Alchemy', id: 4 },
    { name: 'Iron-Vein', id: 5, parentId: 0, stack_size: 50 },
    { name: 'Cobblestone', id: 6, parentId: 0, stack_size: 50 },
    { name: 'Masonry', id: 7, parentId: 1, stack_size: 100 },
    { name: 'Stone Paving', id: 8, parentId: 1, stack_size: 100 },
    { name: 'Cobblestone', id: 9, parentId: 1, stack_size: 100 },
    { name: 'Polished Stone Floor', id: 10, parentId: 1, stack_size: 100 },
    { name: 'Fortified Wall', id: 11, parentId: 1, stack_size: 100 },
    { name: 'Rotary Sieve', id: 12, parentId: 2, stack_size: 50 },
    { name: 'Astrolabe', id: 13, parentId: 3, stack_size: 1 },
    { name: 'Forge', id: 14, parentId: 4, stack_size: 10 }
  ],
  connections: [
    { sourceId: 5, targetId: 8, amount: 1 },
    { sourceId: 6, targetId: 7, amount: 2 },
    { sourceId: 7, targetId: 8, amount: 5 },
    { sourceId: 8, targetId: 9, amount: 10 },
    { sourceId: 8, targetId: 10, amount: 20 },
    { sourceId: 8, targetId: 12, amount: 100 },
    { sourceId: 8, targetId: 13, amount: 1000 },
    { sourceId: 8, targetId: 14, amount: 500 },
    { sourceId: 10, targetId: 11, amount: 10 }
  ]
} satisfies SupplyChainData<
  UserSupplyChainItem<MyItemType>,
  UserSupplyChainConnection<MyConnectionType>
>
