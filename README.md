# yFiles React Supply Chain Component

[![NPM version](https://img.shields.io/npm/v/@yworks/react-yfiles-supply-chain?style=flat)](https://www.npmjs.org/package/@yworks/react-yfiles-supply-chain)

![Welcome playground](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/react-supply-chain-hero.png)

Traditionally associated with manufacturing processes, supply chain management is equally important for the provision
of any good or service, whether physical, face-to-face, or purely digital. Managing a supply chain requires visualizing
and analyzing all of the components, resources and process in a network. Comprehensively diagramming a supply network
enables teams to identify inefficiencies and optimize the overall supply chain.

Our powerful and versatile React component based on the [yFiles](https://www.yworks.com/yfiles-overview) library, allows
you to seamlessly incorporate dynamic and interactive supply chain diagrams into your applications. This enhances the
user experience and facilitates an intuitive exploration of complex manufacturing processes.

## Getting Started

1. **Installation:**
   Install the component via npm by running the following command in your project directory:
   ```bash
   npm install @yworks/react-yfiles-supply-chain
   ```

   The supply chain module has certain peer dependencies that must be installed within your project. Since it is a React
   module, `react` and `react-dom` dependencies are needed.

   Additionally, the component relies on the [yFiles](https://www.yworks.com/yfiles-overview) library which is not
   available on the public npm registry. Instructions on how to work with the yFiles npm module in
   our [Developer's Guide](https://docs.yworks.com/yfileshtml/#/dguide/yfiles_npm_module).

   Ensure that the dependencies in the `package.json` file resemble the following:
   ```json
   {
     ...
     "dependencies": {
       "@yworks/react-yfiles-supply-chain": "^1.0.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "yfiles": "<yFiles package path>/lib/yfiles-26.0.0.tgz",
       ...
     }
   }
   ```

2. **License:**
   Before using the component, a valid [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html) version is
   required. You can evaluate yFiles for 60 days free of charge
   on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).
   Be sure to invoke the `registerLicense` function to furnish the license file before utilizing the supply chain
   component.

3. **Usage:**
   Utilize the component in your application.
   Make sure to import the CSS stylesheet 'index.css' as the component requires it for correct functionality.

   ```tsx
   import {
     registerLicense,
     SupplyChain,
     SupplyChainData,
     UserSupplyChainItem,
     UserSupplyChainConnection
   } from '@yworks/react-yfiles-supply-chain'
   import '@yworks/react-yfiles-supply-chain/dist/index.css' 
   import yFilesLicense from './license.json'
   
   function App() {
     registerLicense(yFilesLicense)
      
     const data = {
       items: [
         { name: 'Copper-Ore', id: 1, parentId: 3 },
         { name: 'Copper-Plate', id: 2, parentId: 4 },
         { name: 'Resource', id: 3 },
         { name: 'Material', id: 4 }
       ],
       connections: [{ sourceId: 1, targetId: 2 }]
     } satisfies SupplyChainData<UserSupplyChainItem, UserSupplyChainConnection>
     
     return  <SupplyChain data={data}></SupplyChain>
   }

   export default App
   ```

   > **Note:** By default, the `SupplyChain` component adjusts its size to match the size of its parent element.
   Therefore, it is necessary to set the dimensions of the containing element or apply styling directly to
   the `SupplyChain` component. This can be achieved by defining a CSS class or applying inline styles.

## Documentation

Find the full documentation, API and many code examples in our [documentation](https://docs.yworks.com/react-yfiles-supply-chain).

## Live Playground

[![Live Playground](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/welcome-playground.png)](https://docs.yworks.com/react-yfiles-supply-chain/introduction/welcome)

Try the yFiles React Supply Chain component directly in your browser with our [playground](https://docs.yworks.com/react-yfiles-supply-chain/introduction/welcome)

## Features

The supply chain component provides versatile features that can be adjusted to specific use cases or used with the
provided default features.

### Custom node visualization

![Custom node visualization](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/custom-node-visualization.png)

The `renderItem` and `renderGroup` property allow providing custom React components for the node visualization. Try the
API in the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/custom-items).

### Custom connection visualization

![Custom connection visualization](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/custom-connection-visualization.png)

With the `connectionStyleProvider`, the connection visualization may be adjusted to the use-case. Additionally, the
`connectionLabelProvider` may be used to display related information directly on the connection. Try the API in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/custom-connections).

### Grouping and folding

![Grouping and folding](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/grouping-and-folding.png)

The component automatically creates nested nodes if the item contains a `parentId` property. The nested nodes can be
collapsed/expanded interactively. Try the API in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/hook-supplychainprovider).

### Heat mapping

![Heat mapping](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/heat-mapping.png)

The `heatMapping` function allows to provide a "heat" value for items and connections that visualizes an additional
information layer in the component.

### Graph search

![Graph search](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/graph-search.png)

The versatile graph search helps to find items in larger supply chains. Try it in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/search).

### Custom tooltips 

![Custom Tooltips](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/custom-tooltips.png)

The `renderTooltip` property can be used to provide use-case specific React components as tooltips. Try the API in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/tooltips).

### Graph overview

![Graph overview](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/graph-overview.png)

The graph overview provides a quick and easy way to navigate larger graph structures. Try it in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/built-in-components).

### Context menu

![Context menu](https://raw.githubusercontent.com/yWorks/react-yfiles-supply-chain/main/assets/context-menu.png)

The context menu can be populated with custom components and actions. Try it in
the [playground](https://docs.yworks.com/react-yfiles-supply-chain/features/context-menu).

## Licensing

All owners of a valid software license for [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
are allowed to use these sources as the basis for their own [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
powered applications.

Use of such programs is governed by the rights and conditions as set out in the
[yFiles for HTML license agreement](https://www.yworks.com/products/yfiles-for-html/sla).

You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).

For more information, see the `LICENSE` file.

## Learn More

Explore the possibilities of visualizing supply chains and other diagrams with yFiles - the powerful and versatile
diagramming SDK. For
further information about [yFiles for HTML](https://www.yworks.com/yfiles-overview) and our company, please
visit [yWorks.com](https://www.yworks.com).

For support or feedback, please reach out to [our support team](https://www.yworks.com/contact) or open
an [issue on GitHub](https://github.com/yWorks/react-yfiles-supply-chain/issues). Happy diagramming!
