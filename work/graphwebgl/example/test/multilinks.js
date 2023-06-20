/* eslint-disable no-undef */
import { RENDERERTYPE, GraphGL2D } from '../../build/gvis.esm.js';
import multiGraphData, { nodeTypes as NodeTypes } from '../data/multigraph.js';
import { hexToRgba } from '../utils.js';

const edgeWidth = (edge) => {
  const typeLen = (edge.getType() + '').length + '';
  switch (typeLen) {
    case '0':
      return 2;
    case '1':
      return 4;
    case '2':
      return 6;
    case '3':
      return 8;
    default:
      return 1;
  }
};

const d3SchemePaired = 'a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928';

const colorCategory = d3SchemePaired; // d3SchemePaired, d3Category10, d3Tableau10, d3SchemeSet1, d3SchemeSet3
const n = (colorCategory.length / 6) | 0,
  colors = new Array(n);
let i = 0;
while (i < n) colors[i] = '#' + colorCategory.slice(i * 6, ++i * 6);

const defaultColor = hexToRgba('#999999', 0.8);

const containerElement = document.getElementById('tgContainer');
const messagesElement = document.getElementById('messages');
const selElement = document.getElementById('selDiv');
let lastSelectedVertex = [];

const createColorFunction = (nodeTypes, colors) => {
  const nodeTypeColorMaps = new Map(
    nodeTypes.map((t, i) => [t, hexToRgba(colors[i % colors.length], 0.8)])
  );
  const nodeTypeColors = (type) => {
    if (nodeTypeColorMaps.has(type)) {
      return nodeTypeColorMaps.get(type);
    }
    return defaultColor;
  };

  // console.log('nodeTypeColorMaps: ', [...nodeTypeColorMaps]);
  const colorVertexFunction = (node, isOver, isClicked, isBoxSelected, isBoxSelecting) => {
    const type = node.getType(); // or .getUserDataValue(), .getDegree(), .etc
    // TODO
    // if node is rendered image or label, how do you color?
    // selected is red
    if (isOver) {
      return 'rgba(255, 0, 0, 0.6)';
    }
    // if GraphGL is box-selecting
    if (isBoxSelecting) {
      // if the node is box-selected
      if (isBoxSelected) {
        return 'rgba(0, 255, 0, 0.7)';
      }
      // un-selected nodes have a default color
      return defaultColor;
    }

    // neither selecting nor overing
    // color by node type
    return nodeTypeColors(type);
  };

  return [colorVertexFunction, [...nodeTypeColorMaps]];
};

const createColorLegend = (typeColos) => {
  const colorLegendDiv = document.querySelector('.vertexType');
  colorLegendDiv.innerHTML = '';
  for (const tc of typeColos) {
    const span = document.createElement('span');
    span.className = 'legend';
    span.style.backgroundColor = tc[1];
    span.innerText = tc[0];
    colorLegendDiv.appendChild(span);
  }
};

const setOverClickMessage = (message) => {
  const messageStr = `${message}`;
  messagesElement.innerHTML = messageStr;
};
const setSelMessage = (message) => {
  const messageStr = `${message}`;
  selElement.innerHTML = messageStr;
};

multiGraph = multiGraphData();

const [colorFunction4MultiGraph, typeColors4MultiGraph] = createColorFunction(NodeTypes, colors);

const selValue = 'multigraph';
const graphMap = {
  multigraph: {
    graph: multiGraph,
    colorFunc: colorFunction4MultiGraph,
    typeColors: typeColors4MultiGraph,
  },
};

graphGL = new GraphGL2D(containerElement, {
  layout: {
    name: 'force',
    option: {
      forces: [
        { name: 'charge', parameter: { strength: -30, distanceMin: 20, distanceMax: 400 } },
        {
          name: 'collide',
          parameter: { strength: 0.7, radius: (n) => 10, iterations: 1 },
        },
        {
          name: 'link',
          parameter: {
            strength: (link) => {
              const sourceDegree = link.source.node.getDegree();
              const targetDegree = link.target.node.getDegree();
              return 1 / Math.min(sourceDegree, targetDegree, 1);
            },
          },
        },
        { name: 'forceX' },
        { name: 'forceY' },
      ],
    },
  },
  autoFit: true,
  style: {
    background: { color: 'rgba(255,255,255,0.9)' },
    point: {
      geometry: {
        pointSize: 100.0,
        pointBorderColor: 'rgba(70, 70, 70, 0.2)',
        pointBorderWidth: 0.4,
      },
    },
    line: {
      geometry: {
        curve: false,
        lineSmoothness: 20,
        singleCurveCurvature: 0.3,
        // multiCurveLinkMinCurvature: 0.4,
        multiCurveLinkMaxCurvature: 2,
        // multiStraightLinkMinDistance: 2,
        multiStraightLinkMaxDistance: 20,
        lineColor: 'rgb(255, 255, 255)',
      },
    },
  },
  thickEdge: edgeWidth,
  onVertexClick: (vertex) => {
    if (vertex != null) {
      setOverClickMessage(`clicked Id: ${vertex.getId()}, Type: ${vertex.getType()}`);
    } else {
      setOverClickMessage('clicked null');
    }
  },
  onVertexOver: (vertex) => {
    if (vertex != null) {
      setOverClickMessage(`over Id: ${vertex.getId()}, Type: ${vertex.getType()}`);
    } else {
      setOverClickMessage('over null');
    }
  },
  onVertexBoxSelect: (vertices) => {
    console.log('onVertexBoxSelect: ', vertices);
    let message = '';
    if (vertices.length === 0 && lastSelectedVertex.length === 0) {
      message = 'no selection';
    } else if (vertices.length === 0 && lastSelectedVertex.length > 0) {
      message = 'deselected';
    } else if (vertices.length === 1) {
      message = `selected ID: ${vertices[0].getId()}, Type: ${vertices[0].getType()}`;
    } else {
      message = `selected ${vertices.length} vertex`;
    }
    setSelMessage(message);
  },
  colorVertex: graphMap[selValue].colorFunc,
  control: {
    zoomSpeed: 1.2,
  },
  boxSelectVertexEnabled: true,
  clickVertexEnabled: true,
  overVertexEnabled: true,
});

graphGL.changeGraph(graphMap.multigraph.graph);
graphGL.start();
createColorLegend(graphMap.multigraph.typeColors);

let selfLoopedNode = [];
let multiLink = [];
for (const n of multiGraph.getNodes().values()) {
  if (n.hasSelfLoopLinks()) {
    selfLoopedNode.push(n);
  }
}
console.log('%s has self-loop links', selfLoopedNode.map((n) => n.getId()).toString());
for (const l of multiGraph.getLinks().values()) {
  if (l.multiLinksIndex > -1) {
    multiLink.push(l);
  }
}
console.log(
  '%O is a multi-link',
  multiLink
    .map((l) => [
      l.getFromId() +
        '_' +
        l.getFromType() +
        '=>' +
        l.getToId() +
        '_' +
        l.getToType() +
        '~' +
        l.multiLinksIndex +
        '_of_' +
        l.multiLinksCount,
    ])
    .toString()
);

window.addEventListener(
  'resize',
  () => {
    console.log('resizing...');
    graphGL.resize();
  },
  false
);

const daynightModeInputs = document.querySelectorAll("input[name='mode']");

for (const elem of daynightModeInputs) {
  elem.addEventListener('change', (event) => {
    const daynight = event.target.value;
    console.log('daynight is changed to: ', daynight);
    graphGL.switchDayNight(daynight === 'night');
  });
}
const operationInputs = document.querySelectorAll("input[name='operation']");
for (const elem of operationInputs) {
  elem.addEventListener('change', (event) => {
    const op = event.target.value;
    console.log('operation is changed to: ', op);
    if (op === 'pan') {
      graphGL.enablePan();
    } else if (op === 'box') {
      graphGL.enableBox();
    }
  });
}

const graphsizeDiv = document.querySelector('#graphsizeDiv');
graphsizeDiv.innerHTML = `Vertex count: ${graphMap[selValue].graph.size.vertex}, edge count: ${graphMap[selValue].graph.size.edge}`;
