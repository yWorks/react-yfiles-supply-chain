---
name: react-yfiles-supply-chain

description: Use this skill when working with the yFiles React Supply Chain component in a React application. This includes creating, integrating, configuring, troubleshooting, or extending supply chain charts, items, connections, groups, folders, custom rendering, tooltips, context menus, heatmaps, grid positioning, search, selection, genealogy, zooming, layout, or export, including requests that do not mention yFiles or the package name explicitly.
---

# yFiles React Supply Chain

Use `@yworks/react-yfiles-supply-chain` with supply chain data containing items and connections. Ensure the yFiles license is registered, the stylesheet is imported, and the component API is used correctly.

## Data preparation

Convert source data to this shape before passing it to `SupplyChain`:

```ts
type SupplyChainItemId = string | number

type SupplyChainItem = {
    id: SupplyChainItemId // unique identifier for the item
    parentId?: SupplyChainItemId // identifier of the grouping item
    name?: string // displayed item name
    width?: number // item width
    height?: number // item height
    className?: string // CSS class name for the item
    style?: React.CSSProperties // inline style for the item
}

type SupplyChainConnection = {
    sourceId: SupplyChainItemId // source item identifier
    targetId: SupplyChainItemId // target item identifier
    name?: string // optional connection name
    className?: string // CSS class name for the connection
    style?: React.CSSProperties // inline style for the connection
}

type SupplyChainData = {
    items: SupplyChainItem[]
    connections: SupplyChainConnection[]
}
```

Ensure every connection refers to an item in `items`, and use `parentId` to define grouping. Extend the item and connection types when application-specific fields are needed for custom renderers, labels, heat mapping, or grid positioning.

## Minimal react example

Register the license and import the stylesheet; both are required.

```tsx
import {
    SupplyChain,
    registerLicense,
    type SupplyChainData,
    type SupplyChainItem,
    type SupplyChainConnection
} from '@yworks/react-yfiles-supply-chain'

import '@yworks/react-yfiles-supply-chain/dist/index.css'
import yFilesLicense from '<yFiles package path>/lib/license.json'

registerLicense(yFilesLicense)

const data: SupplyChainData<SupplyChainItem, SupplyChainConnection> = {
    items: [
        { id: 'supplier', name: 'Supplier' },
        { id: 'factory', name: 'Factory' },
        { id: 'warehouse', name: 'Warehouse' }
    ],
    connections: [
        { sourceId: 'supplier', targetId: 'factory' },
        { sourceId: 'factory', targetId: 'warehouse' }
    ]
}

export default function App() {
    return <SupplyChain data={data} />
}
```

Replace `data` with suitable application data and `<yFiles package path>` with the actual downloaded package directory.

## References

- Use the [component feature overview](references/features.md) to choose appropriate capabilities.
- Use the [complete API documentation](references/api.md) for exact props, types, and configuration.