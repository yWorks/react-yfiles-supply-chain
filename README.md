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

### Prerequisites

To use the Supply Chain component, [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html) is required.
You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).
See [Licensing](https://docs.yworks.com/react-yfiles-supply-chain/introduction/licensing) for more information on this topic.

You can learn how to work with the yFiles npm module in our [Developer’s Guide](https://docs.yworks.com/yfileshtml/#/dguide/yfiles_npm_module). A convenient way of getting access to yFiles is to use the [yFiles Dev Suite](https://www.npmjs.com/package/yfiles-dev-suite).


### Project Setup

1. **Installation**

   In addition to yFiles, the Supply Chain requires React to be installed in your project.
   If you want to start your project from scratch, we recommend using vite:
   ```
   npm create vite@latest my-supply-chain-app -- --template react-ts
   ```

   Add the yFiles dependency:
   ```
   npm install <yFiles package path>/lib-dev/yfiles-26.0.0+dev.tgz
   ```

   <details>

   <summary>Sample <code>package.json</code> dependencies</summary>
   The resulting package.json dependencies should resemble the following:

   ```json
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "yfiles": "./lib-dev/yfiles-26.0.0.tgz"
     }
   ```
   </details>

   Now, the component itself can be installed:
   ```bash
   npm install @yworks/react-yfiles-supply-chain
   ```

2. **License**

   Be sure to invoke the `registerLicense` function before using the Supply Chain React component.
   When evaluating yFiles, the license JSON file is found in the `lib/` folder of the yFiles for HTML evaluation package.
   For licensed users, the license data is provided separately.

   <details>

   <summary>License registration</summary>

   Import or paste your license data and register the license, e.g. in `App.tsx`:

   ```js
   import yFilesLicense from './license.json'

   registerLicense(yFilesLicense)
   ```
   </details>

3. **Stylesheet**

   Make sure to import the CSS stylesheet as well:

   ```js
   import '@yworks/react-yfiles-supply-chain/dist/index.css'
   ```

4. **Usage**

   You are now all set to utilize the Supply Chain component with your data!
   See a basic example `App.tsx` below:

   ```tsx
   import {
     registerLicense,
     SupplyChain,
   } from '@yworks/react-yfiles-supply-chain'             
   
   import '@yworks/react-yfiles-supply-chain/dist/index.css'   
   
   import yFilesLicense from './license.json'

   registerLicense(yFilesLicense)

   const data = {
     items: [
       { name: 'Copper-Ore', id: 1, parentId: 3 },
       { name: 'Copper-Plate', id: 2, parentId: 4 },
       { name: 'Resource', id: 3 },
       { name: 'Material', id: 4 }
     ],
     connections: [{ sourceId: 1, targetId: 2 }]
   }

   function App() {
     return <SupplyChain data={data}></SupplyChain>
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

If you are exploring a different use case and require another React component,
please take a look at the available [React components](https://www.yworks.com/yfiles-react-components) powered by yFiles!

For support or feedback, please reach out to [our support team](https://www.yworks.com/contact) or open
an [issue on GitHub](https://github.com/yWorks/react-yfiles-supply-chain/issues). Happy diagramming!
