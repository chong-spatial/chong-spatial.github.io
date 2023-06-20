/* eslint-disable */

import { Graph } from '../../build/gl2d.esm.js';

export default function radialGraphData() {
  const type1NodesCount = 100,
    type2NodesCount = 200,
    type3NodesCount = 300;

  const nodeTypesMap = new Map();
  const graph = new Graph('radial');
  let i = -1;

  while (i++ < type1NodesCount) {
    const randomValue = 0 + Math.floor(Math.random() * (3 - 0 + 1));

    const nodeId = `typeA${i}`,
      nodeType = 'User',
      nodeData = { value: randomValue, id: nodeId, type: nodeType, group: nodeType };
    graph.addNode({ id: nodeId, type: nodeType, data: nodeData });
    nodeTypesMap.set(nodeId, nodeType);
  }
  i = -1;

  while (i++ < type2NodesCount) {
    const randomValue = 0 + Math.floor(Math.random() * (3 - 0 + 1));

    const nodeId = `typeB${i}`,
      nodeType = 'Location',
      nodeData = { value: randomValue, id: nodeId, type: nodeType, group: nodeType };
    graph.addNode({ id: nodeId, type: nodeType, data: nodeData });
    nodeTypesMap.set(nodeId, nodeType);
  }

  i = -1;
  while (i++ < type3NodesCount) {
    const randomValue = 0 + Math.floor(Math.random() * (3 - 0 + 1));

    const nodeId = `typeC${i}`,
      nodeType = 'Transaction',
      nodeData = { value: randomValue, id: nodeId, type: nodeType, group: nodeType };
    graph.addNode({ id: nodeId, type: nodeType, data: nodeData });
    nodeTypesMap.set(nodeId, nodeType);
  }

  return graph;
}
