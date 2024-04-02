import MedievalSupplyChain from '../../data/medieval-supply-chain.json'
import { prepareMedievalSupplyChainData } from '../../data/prepareMedievalSupplyChainData.ts'
import { KeyboardEvent } from 'react'

import {
  Controls,
  HeatFunction,
  RenderSupplyChainTooltip,
  SupplyChain,
  SupplyChainBaseItem,
  SupplyChainConnection,
  SupplyChainContextMenuItems,
  SupplyChainControlButtons,
  SupplyChainItem,
  SupplyChainLayoutOptions,
  SupplyChainProvider,
  useSupplyChainContext
} from '@yworks/react-yfiles-supply-chain'

import { connectionStyles } from './callbacks/connectionStyles.ts'
import { gridPositioning } from './callbacks/gridPositioning.ts'
import { heatMapping as heatMappingFunction } from './callbacks/heatMapping.ts'
import { connectionLabels } from './callbacks/connectionLabels.ts'

import { useCallback, useState } from 'react'
import { JsonView } from 'react-json-view-lite'

import 'react-json-view-lite/dist/index.css'
import './index.css'

const convertedData = prepareMedievalSupplyChainData(MedievalSupplyChain)

const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
  type: 'module'
})

const layoutOptions: SupplyChainLayoutOptions = {
  routingStyle: 'orthogonal'
}

/**
 * A sample app that shows various aspects and functions of the supply chain component.
 */

function SupplyChainWrapper() {
  const supplyChainContext = useSupplyChainContext()

  const [detail, setDetail] = useState<SupplyChainBaseItem[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [layoutRunning, setLayoutRunning] = useState(false)

  const onItemSelect = useCallback((selectedItems: (SupplyChainItem | SupplyChainConnection)[]) => {
    if (selectedItems.length > 0) {
      setDetail(selectedItems)
    } else {
      setDetail(null)
    }
  }, [])

  const [heatMapping, setHeatMapping] = useState<HeatFunction | undefined>(undefined)

  const onSearchEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      supplyChainContext.zoomTo(supplyChainContext.getSearchHits())
    }
  }

  return (
    <>
      <div className="toolbar">
        <button
          className="toolbar-button"
          disabled={layoutRunning}
          onClick={() => supplyChainContext.zoomIn()}
        >
          Zoom +
        </button>
        <button
          className="toolbar-button"
          disabled={layoutRunning}
          onClick={() => supplyChainContext.fitContent(100)}
        >
          Fit
        </button>
        <button
          className="toolbar-button"
          disabled={layoutRunning}
          onClick={() => supplyChainContext.zoomOut()}
        >
          Zoom -
        </button>
        <div className="divider"></div>
        Expand / Collapse to
        <button
          className="toolbar-button"
          disabled={layoutRunning}
          onClick={() => supplyChainContext.showLevel(1)}
        >
          Level 1
        </button>
        <button
          className="toolbar-button"
          disabled={layoutRunning}
          onClick={() => supplyChainContext.showLevel(2)}
        >
          Level 2
        </button>
        <div className="divider"></div>
        <div>
          <input
            id={'heatmap'}
            type={'checkbox'}
            title={'Heat Map'}
            onChange={event => {
              if (event.target.checked) {
                setHeatMapping(() => heatMappingFunction)
              } else {
                setHeatMapping(undefined)
              }
            }}
          />
          <label htmlFor="{'heatmap'}">Show Heat Map</label>
        </div>
        <div className="divider"></div>
        <button
          className="toolbar-button"
          onClick={() => {
            supplyChainContext.applyLayout().then(() => supplyChainContext.fitContent(100))
          }}
          disabled={layoutRunning}
        >
          Run Layout
        </button>
        <div
          style={{
            display: layoutRunning ? 'block' : 'none',
            marginLeft: 5,
            color: 'red'
          }}
        >
          LAYOUT RUNNING
        </div>
        <div className="search">
          <input
            type={'search'}
            placeholder="Search..."
            onChange={event => {
              setSearchQuery(event.target.value)
            }}
            onKeyDown={onSearchEnter}
          ></input>
        </div>
      </div>

      <SupplyChain
        data={convertedData}
        renderTooltip={RenderSupplyChainTooltip}
        onItemSelect={onItemSelect}
        searchNeedle={searchQuery}
        contextMenuItems={SupplyChainContextMenuItems}
        heatMapping={heatMapping}
        gridPositioning={gridPositioning}
        setLayoutRunning={setLayoutRunning}
        layoutOptions={layoutOptions}
        showLevel={1}
        connectionStyleProvider={connectionStyles}
        connectionLabelProvider={connectionLabels}
        layoutWorker={layoutWorker}
      >
        <div
          style={{
            display: detail ? 'block' : 'none'
          }}
          className="detail-view"
        >
          <JsonView data={detail || {}}></JsonView>
        </div>
        <Controls position={'top-left'} buttons={SupplyChainControlButtons}></Controls>
      </SupplyChain>
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
