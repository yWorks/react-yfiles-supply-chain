import './styles.css'
import {
  SupplyChain,
  SupplyChainProvider,
  useSupplyChainContext
} from '@yworks/react-yfiles-supply-chain'
import { SmallSampleData } from '../../data/small-sample-data.ts'

function SupplyChainWrapper() {
  const { zoomTo, fitContent, zoomToOriginal, zoomIn, zoomOut } = useSupplyChainContext()

  return (
    <>
      <SupplyChain
        data={SmallSampleData}
        contextMenuItems={item => {
          if (item !== null) {
            return [{ title: 'Zoom to Item', action: () => zoomTo([item]) }]
          }
          return []
        }}
      ></SupplyChain>
      <div className="provider-toolbar">
        <button className="toolbar-button" onClick={() => fitContent()}>
          Fit Content
        </button>
        <button className="toolbar-button" onClick={() => zoomIn()}>
          Zoom +
        </button>
        <button className="toolbar-button" onClick={() => zoomToOriginal()}>
          Zoom 1:1
        </button>
        <button className="toolbar-button" onClick={() => zoomOut()}>
          Zoom -
        </button>
      </div>
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
