/* eslint-disable */

import { Graph } from '../../build/gl2d.esm.js';

export const nodeTypes = ['Transaction', 'User', 'ATM', 'Location'];
const linkTypes = ['leng', 'l', 'lengt', 'le', 'len', 'length'];

export default function multiGraphData() {
  const nodesCount = 10; // >5
  const singleLinksCount = 4; // 5
  const selfLoopsCount = 4;
  const oddMultiLinksCount = 5,
    evenMultiLinksCount = 6;

  const nodeTypesMap = new Map();
  // const linkTypes = ['Receive', 'Transfer', 'Withdraw'];
  const graph = new Graph('multi-graph');
  let i = 0;
  while (i++ < nodesCount) {
    const nodeId = `node${i}`,
      nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      nodeData = { attributes: { id: i } };
    graph.addNode({ id: nodeId, type: nodeType, data: nodeData });
    nodeTypesMap.set(nodeId, nodeType);
  }

  i = 0;
  while (i++ < selfLoopsCount) {
    const fromNodeId = `node5`,
      fromNodeType = nodeTypesMap.get(fromNodeId);
    graph.addLink({
      fromId: fromNodeId,
      fromType: fromNodeType,
      toId: fromNodeId,
      toType: fromNodeType,
      type: linkTypes[Math.floor(Math.random() * linkTypes.length)],
      discriminator: Math.random(),
      directed: true,
    });
  }

  i = 0;
  const node1Type = nodeTypesMap.get('node1'),
    node2Type = nodeTypesMap.get('node2');
  const node1 = graph.getNode('node1', node1Type),
    node2 = graph.getNode('node2', node2Type);
  while (i++ < oddMultiLinksCount) {
    graph.addLink({
      fromId: node1.getId(),
      fromType: node1.getType(),
      toId: node2.getId(),
      toType: node2.getType(),
      type: linkTypes[Math.floor(Math.random() * linkTypes.length)],
      discriminator: Math.random(),
      directed: true,
    });
  }

  i = 0;
  const node3Type = nodeTypesMap.get('node3'),
    node4Type = nodeTypesMap.get('node4');
  const node3 = graph.getNode('node3', node3Type),
    node4 = graph.getNode('node4', node4Type);
  while (i++ < evenMultiLinksCount) {
    graph.addLink({
      fromId: node3.getId(),
      fromType: node3.getType(),
      toId: node4.getId(),
      toType: node4.getType(),
      type: 'metype',
      discriminator: i,
      directed: true,
    });
  }

  i = 0;
  while (i++ < singleLinksCount) {
    const fromNodeId = `node${randomFromTo(1, nodesCount)}`,
      fromNodeType = nodeTypesMap.get(fromNodeId);
    const toNodeId = `node${randomFromTo(1, nodesCount)}`,
      toNodeType = nodeTypesMap.get(toNodeId);
    if (graph.hasLinkBetween(fromNodeId, fromNodeType, toNodeId, toNodeType)) continue;
    graph.addLink({
      fromId: fromNodeId,
      fromType: fromNodeType,
      toId: toNodeId,
      toType: toNodeType,
      type: linkTypes[Math.floor(Math.random() * linkTypes.length)],
      discriminator: Math.random(),
      directed: true,
    });
  }

  return graph;
}

function randomFromTo(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}
