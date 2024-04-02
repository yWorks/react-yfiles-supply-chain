import {
  SupplyChain,
  SupplyChainData,
  SupplyChainProvider,
  useSupplyChainContext
} from '@yworks/react-yfiles-supply-chain'

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
 * A supply chain component providing export and save to image functionalities.
 */
function SupplyChainWrapper() {
  const { exportToSvg, exportToPng, print } = useSupplyChainContext()

  return (
    <>
      <div className="toolbar">
        <button className="toolbar-button" onClick={async () => await print({ scale: 2 })}>
          Print
        </button>
        <button className="toolbar-button" onClick={async () => await exportToSvg({ scale: 2 })}>
          Export to SVG
        </button>
        <button className="toolbar-button" onClick={async () => await exportToPng({ scale: 2 })}>
          Export to PNG
        </button>
      </div>
      <SupplyChain data={data}></SupplyChain>
    </>
  )
}

export default () => {
  return (
    <SupplyChainProvider>
      <SupplyChainWrapper></SupplyChainWrapper>
    </SupplyChainProvider>
  )
}
