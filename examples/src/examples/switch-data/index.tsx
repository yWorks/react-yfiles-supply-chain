import { useState } from 'react'

import { SupplyChain, Overview } from '@yworks/react-yfiles-supply-chain'
import '@yworks/react-yfiles-supply-chain/dist/index.css'

import reactSample1 from './inputData/sample-simple1.json'
import reactSample2 from './inputData/sample-simple2.json'

const SwitchData = () => {
  const [inputData, setInputData] = useState(reactSample2)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '1000px',
        height: '800px',
        marginTop: '50px'
      }}
    >
      <div style={{ textAlign: 'center', padding: 10 }}>
        <button
          onClick={() => setInputData(inputData === reactSample1 ? reactSample2 : reactSample1)}
        >
          Switch Data
        </button>
      </div>

      <SupplyChain style={{ width: '100%' }} data={inputData}>
        <Overview />
      </SupplyChain>
    </div>
  )
}

export default SwitchData
