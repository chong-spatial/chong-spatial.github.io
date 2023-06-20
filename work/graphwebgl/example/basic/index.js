/* eslint-disable no-undef */
// import { RENDERERTYPE, GraphGL2D, treeify } from '../../build/GL2D.esm.js';
import * as GL2D from '../../build/gl2d.esm.js';
import bombGraphDataAndGroups from '../data/bombExpand.js';
import miserablesGraphData, { miserablesTypes } from '../data/miserables.js';
import blocksGraphData, { blocksTypes } from '../data/blocks.js';
import dependenciesGraph, { dependenciesTypes } from '../data/d3Dependencies.js';
import radialGraphData from '../data/radial.js';
import d3netGraphData, { d3netTypes } from '../data/d3net.js';
import treeData, { randomNodeTypes } from '../data/treeData.js';
import { hexToRgba } from '../utils.js';

window.GL2D = GL2D;

const bombGraph = bombGraphDataAndGroups()[0],
  bombGroups = bombGraphDataAndGroups()[1];

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
}

function updateTooltipPosition(vertex) {
  let positionElement = document.getElementById('tooltipPositionDiv');
  if (!positionElement) return;

  // Note the postionElement may not have offsetWidth in the first time
  // may need CSS beforehand?
  const tooltipWidth = positionElement.offsetWidth,
    tooltipHeight = positionElement.offsetHeight;

  const { x, y, w, h } = vertex.getRect();
  const tcSX = x + w / 2,
    tcSY = y;
  const left = tcSX - tooltipWidth / 2,
    top = tcSY - tooltipHeight;

  // or css translate?
  positionElement.style.left = `${left}px`;
  positionElement.style.top = `${top}px`;
}

const showVertexTooltip = (vertex) => {
  let positionElement = document.getElementById('tooltipPositionDiv');
  if (!positionElement) return;

  positionElement.style.display = 'block';

  updateTooltipPosition(vertex);

  // demo purpose only
  // may use React component to render the tooltip text
  const textElement = document.getElementById('tooltipTextDiv');
  const tooltipText = `${vertex.getId()}-${vertex.getType()}-tooltip`;
  textElement.innerText = tooltipText;
};

const hideTooltip = () => {
  let positionElement = document.getElementById('tooltipPositionDiv');
  if (positionElement) {
    positionElement.style.display = 'none';
  }
};

// won't affect arrow size
// anything larger than .5 will fall back to .5. Think border is
// a thin region from outline of edge expanded inwards
const edgeBorderWidth = (edge, isOver, isClicked) => {
  if (isOver) return 0.1;

  const typeLen = (edge.getType() + '').length + '';
  switch (typeLen) {
    case '0':
      return 0.15;
    case '1':
      return 0.2;
    case '2':
      return 0.25;
    case '3':
      return 0.3;
    default:
      return 0.35;
  }
};
const edgeBorderColor = (edge, isOver, isClicked) => {
  if (isOver) return 'rgb(101, 160, 163)';

  const typeLen = (edge.getType() + '').length + '';
  switch (typeLen) {
    case '0':
      return 'rgb(0,255,0)';
    case '1':
      return 'rgb(255,0,0)';
    case '2':
      return 'rgb(0,0,255)';
    case '3':
      return 'rgb(0,255,255)';
    default:
      return 'rgb(237, 87, 57)';
  }
};
const edgeColor = (edge, isOver, isClicked) => {
  if (isOver) return 'rgba(0, 0, 0, 1)';

  const typeLen = (edge.getType() + '').length + '';
  switch (typeLen) {
    case '0':
      return 'rgba(255,0,0,1)';
    case '1':
      return 'rgba(0,0,255,1)';
    case '2':
      return 'rgba(255,255,0,1)';
    case '3':
      return 'rgba(255,0,255,1)';
    default:
      return 'rgba(0,255,0,1)';
  }
};

// edge width/thickness can go bigger than 1.0
const edgeWidth = (edge, isOver, isClicked) => {
  if (isOver) return 1.0;

  const typeLen = (edge.getType() + '').length + '';
  switch (typeLen) {
    case '0':
      return 2;
    case '1':
      return 3;
    case '2':
      return 4;
    case '3':
      return 5;
    default:
      return 6;
  }
};
const edgeDash = (edge, isOver, isClicked) => {
  if (isOver) return [15, 0.1];

  const typeLen = (edge.getType() + '').length + '';
  // return [10, 10];
  switch (typeLen) {
    case '0':
      return [5, 0.1];
    case '1':
      return [10, 0.3];
    case '2':
      return [12, 0.5];
    case '3':
      return [8, 0.7];
    default:
      return [0, 0];
  }
};
const middlePointSizeFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    switch (typeLen) {
      case '0':
        return 32;
      case '1':
        return 48;
      case '2':
        return 64;
      case '3':
        return 80;
      default:
        return 16;
    }
  },
  middlePointLabelShiftFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    // intentionally half of size set in sizeVertex(fn)
    // to make sure the label is just below/right the point symbol
    switch (typeLen) {
      case '0':
        return [0, 16];
      case '1':
        return [0, 24];
      case '2':
        return [0, 32];
      case '3':
        return [0, 40];
      default:
        return [0, 8];
    }
  };
const bigPointSizeFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    switch (typeLen) {
      case '0':
        return 60;
      case '1':
        return 80;
      case '2':
        return 100;
      case '3':
        return 120;
      default:
        return 200;
    }
  },
  bigPointLabelShiftFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    // intentionally half of size set in sizeVertex(fn)
    // to make sure the label is just below/right the point symbol
    switch (typeLen) {
      case '0':
        return [0, 30];
      case '1':
        return [0, 40];
      case '2':
        return [0, 50];
      case '3':
        return [0, 60];
      default:
        return [0, 100];
    }
  };
const smallPointSizeFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    switch (typeLen) {
      case '0':
        return 4;
      case '1':
        return 6;
      case '2':
        return 8;
      case '3':
        return 10;
      default:
        return 2;
    }
  },
  smallPointLabelShiftFunc = (node) => {
    const typeLen = (node.getType() + '').length + '';
    // intentionally half of size set in sizeVertex(fn)
    // to make sure the label is just below the point symbol
    switch (typeLen) {
      case '0':
        return [0, 2];
      case '1':
        return [0, 3];
      case '2':
        return [0, 4];
      case '3':
        return [0, 5];
      default:
        return [0, 1];
    }
  };

let usingHideFunc = true;
const d3SchemeSet3 = '8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f',
  d3Tableau10 = '4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab',
  d3SchemeSet1 = 'e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999',
  d3Category10 = '1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf',
  d3SchemePaired = 'a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928';

const covidstatuscolors = ['#00ffff', '#63ace7', '#424141', '#f3eaea'];
const colorCategory = d3SchemePaired; // d3SchemePaired, d3Category10, d3Tableau10, d3SchemeSet1, d3SchemeSet3
const n = (colorCategory.length / 6) | 0,
  colors = new Array(n);
let i = 0;
while (i < n) colors[i] = '#' + colorCategory.slice(i * 6, ++i * 6);

const divigingColor = ['#a81f2e', '#1b5693']; // ['#a81f2e','#1b5693'], ['#b71127','#05733c'], ['#930356','#296919']
const defaultColor = hexToRgba('#999999', 1);

const containerElement = document.getElementById('tgContainer');
const messagesElement = document.getElementById('messages');
const selElement = document.getElementById('selDiv');
let lastSelectedVertex = [];

const createLabelFunction = (nodeTypes) => {
  const labelFunction = (node, isOver, isClicked, isBoxSelected, isBoxSelecting) => {
    const id = node.getId(),
      degree = node.getDegree(),
      type = node.getType(); // or .getUserDataValue(), .getDegree(), .etc
    if (isOver) return 'Over label';
    // multi-line label
    // return `Id: ${id}\nType: ${type}\nDegree: ${degree}`;
    // single-line label
    return `${id}_${type}`;
  };

  return labelFunction;
};

const nodeTypeColors = (type, maps) => {
  if (maps.has(type)) {
    return maps.get(type);
  }
  return defaultColor;
};

// must return 'rgba()' format
const createColorFunction = (nodeTypes, colors) => {
  const nodeTypeColorMaps = new Map(
    nodeTypes.map((t, i) => [t, hexToRgba(colors[i % colors.length], 0.5)])
  );

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
    return nodeTypeColors(type, nodeTypeColorMaps);
  };

  return [colorVertexFunction, [...nodeTypeColorMaps]];
};

const createColorFunction4Group = (nodeGroups, colors) => {
  const nodeGroupColorMaps = new Map(
    nodeGroups.map((t, i) => [t, hexToRgba(colors[i % colors.length], 1)])
  );
  const nodeGroupColors = (group) => {
    if (nodeGroupColorMaps.has(group)) {
      return nodeGroupColorMaps.get(group);
    }
    return defaultColor;
  };

  // console.log('nodeTypeColorMaps: ', [...nodeTypeColorMaps]);
  const colorVertexFunction = (node, isOver, isClicked, isBoxSelected, isBoxSelecting) => {
    const group = node.userData.group;
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
    // color by node group
    return nodeGroupColors(group);
  };

  return [colorVertexFunction, [...nodeGroupColorMaps]];
};

const createColorLegend = (typeColos) => {
  //
  const colorLegendDiv = document.querySelector('.vertexType');
  colorLegendDiv.innerHTML = '';
  // reset btn
  const btn = document.createElement('button');
  btn.className = 'reset';
  btn.style.backgroundColor = '#cccccc';
  btn.innerText = 'reset filtering';
  btn.onclick = function () {
    // if (usingHideFunc) {
    graphGL.hideVertex(() => {
      return false;
    });
    // } else {
    graphGL.colorVertex(graphMap[selValue].colorFunc);
    //}
  };
  const lengendDiv = document.createElement('div');
  lengendDiv.className = 'legend';
  colorLegendDiv.appendChild(btn);
  colorLegendDiv.appendChild(lengendDiv);

  // legend span
  for (const tc of typeColos) {
    const span = document.createElement('span');
    // span.className = 'legend';
    span.style.backgroundColor = tc[1];
    span.innerText = tc[0];
    span.onclick = function () {
      let colorField;
      if (usingHideFunc) {
        graphGL.hideVertex((vertex) => {
          colorField =
            graphGL.graph().name === 'bombExpand' ? vertex.userData.group : vertex.getType();
          return colorField !== tc[0];
        });
      } else {
        graphGL.colorVertex((vertex, isOver, isClicked, isBoxSelected, isBoxSelectingMode) => {
          // e.g. [1, 0, 0, 0.7]
          const curColor = vertex.getRenderProperty('color');
          const rgbColor = curColor.slice(0, -1).map((c) => c * 255);

          colorField =
            graphGL.graph().name === 'bombExpand' ? vertex.userData.group : vertex.getType();
          if (colorField !== tc[0]) {
            // make others more transparent
            return `rgba(${rgbColor.concat(0.01).join(',')})`;
          } else {
            // graphMap[selValue].colorFunc(vertex, isClicked, isOver, isBoxSelectingMode);
            return `rgba(${rgbColor.concat(1).join(',')})`;
          }
        });

        // other userFunctions like borderColorVertex()
      }
    };
    lengendDiv.appendChild(span);
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

const resetRenderersUI = () => {
  document.getElementById('shape-render').checked = graphGL.activeVertexRenderers.includes(
    GL2D.RENDERERTYPE.vertex.VERTEX_GEOMETRY
  );
  document.getElementById('texture-render').checked = graphGL.activeVertexRenderers.includes(
    GL2D.RENDERERTYPE.vertex.VERTEX_TEXTURE
  );
  document.getElementById('pt-text-render').checked = graphGL.activeVertexRenderers.includes(
    GL2D.RENDERERTYPE.vertex.VERTEX_LABEL
  );
  document.getElementById('edge-render-fast').checked = graphGL.activeEdgeRenderers.includes(
    GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_FAST
  );
  document.getElementById('edge-render-thick').checked = graphGL.activeEdgeRenderers.includes(
    GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_THICK
  );
  document.getElementById('edge-text-render').checked = graphGL.activeEdgeRenderers.includes(
    GL2D.RENDERERTYPE.edge.EDGE_LABEL
  );
  document.getElementById('edge-arrow-render').checked =
    graphGL.activeEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_ARROW_FAST) ||
    graphGL.activeEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_ARROW_THICK);

  document.getElementById('edge-geom-render').checked =
    graphGL.activeEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_FAST) ||
    graphGL.activeEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_THICK);
};

const miserableGraph = miserablesGraphData();
const blockGraph = blocksGraphData();
const dependencyGraph = dependenciesGraph();
const d3netGraph = d3netGraphData();
const radialGraph = radialGraphData();
const treeGraph = treeData();


const [colorFunction4Miserables, typeColors4Miserables] = createColorFunction(
  miserablesTypes,
  colors
);
const [colorFunction4Blocks, typeColors4Blocks] = createColorFunction(blocksTypes, colors);
const [colorFunction4Depend, typeColors4Depend] = createColorFunction(dependenciesTypes, colors);
const [colorFunction4D3net, typeColors4D3net] = createColorFunction(d3netTypes, colors);

const [colorFunction4Bomb, groupColors4Bomb] = createColorFunction4Group(bombGroups, colors);

const [colorFunction4RandomGraph, typeColors4RandomGraph] = createColorFunction(
  randomNodeTypes,
  colors
);

const labelFunction4Miserables = createLabelFunction(miserablesTypes);
const labelFunction4Depend = createLabelFunction(dependenciesTypes);
const labelFunction4D3net = createLabelFunction(d3netTypes);
const labelFunction4Bomb = createLabelFunction(bombGroups);
const labelFunction4Blocks = createLabelFunction(blocksTypes);
const labelFunction4RandomGraph = createLabelFunction(randomNodeTypes);

const uniformLabelEdge = (link, isOver, isClicked) => {
  // or .getUserDataValue(), .getDegree(), .etc
  const fid = link.getFromId(),
    ftype = link.getFromType(),
    tid = link.getToId(),
    ttype = link.getToType(),
    etype = link.getType();

  const l = `${fid}-${ftype}->${tid}-${ttype}\n${etype}`;

  if (isOver) return l + ', Over';
  return l;
};
let selValue = document.querySelector('#dataset').value;
const graphMap = {
  bomb: {
    graph: bombGraph,
    colorFunc: colorFunction4Bomb,
    labelFunc: labelFunction4Bomb,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: groupColors4Bomb,
  },
  tree: {
    graph: treeGraph,
    colorFunc: colorFunction4RandomGraph,
    labelFunc: labelFunction4RandomGraph,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4RandomGraph,
  },
  d3net: {
    graph: d3netGraph,
    colorFunc: colorFunction4D3net,
    labelFunc: labelFunction4D3net,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4D3net,
  },
  radial: {
    graph: radialGraph,
    colorFunc: colorFunction4RandomGraph,
    labelFunc: labelFunction4RandomGraph,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4RandomGraph,
  },
  miserables: {
    graph: miserableGraph,
    colorFunc: colorFunction4Miserables,
    labelFunc: labelFunction4Miserables,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4Miserables,
  },
  blocks: {
    graph: blockGraph,
    colorFunc: colorFunction4Blocks,
    labelFunc: labelFunction4Blocks,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4Blocks,
  },
  dependency: {
    graph: dependencyGraph,
    colorFunc: colorFunction4Depend,
    labelFunc: labelFunction4Depend,
    labelEdgeFunc: uniformLabelEdge,
    typeColors: typeColors4Depend,
  },
};

const initForces = Object.entries(forcesState).reduce((out, cur) => {
  const [key, obj] = cur;
  obj.enabled && out.push({ ...obj, name: key });
  return out;
}, []);

const graphGLConfig = {
  // NOTE
  // this number is to demo only. Please change the collision radius according to your data
  layout: {
    name: 'force',
    option: {
      forces: [],
    },
  },
  autoFit: true,
  style: {
    background: { color: 'rgb(255,255,255)' },
    point: {
      geometry: {
        // default value if no sizeVertex() set
        pointSize: 20.0,
        minPointSize: 10.0,
        maxPointSize: 2000.0,
        pointBorderColor: 'rgba(70, 70, 70, 0.2)',
        // pointBorderWidth: 0.4,
        sizeAttenuation: true,
      },
      label: {
        // fontSize: 12,
        // fontFamily: 'Arial',
        // lineHeight: 30,
        // fillStyle: 'rgba(25, 25, 25, 1)',
        // strokeStyle: 'rgba(170, 170, 170, 1)',
        // strokeWidth: 1,
        // textAlign: 'center',
        // textBaseline: 'top',
      },
    },
    line: {
      geometry: {
        // change to true if straight edge
        // curve: false, // true, false,
        // lineSmoothness: 10, // 20
        // singleCurveCurvature: 0.3,
        // multiCurveLinkMinCurvature: 0.1,
        // // multiCurveLinkMaxCurvature: 1,
        // multiStraightLinkMinDistance: 4,
        // lineBorderWidth: 0,
        // sizeAttenuation: true,
        // lineThickbuffer: 0.3,
        // arrowLength: 0.8,
        // arrowLongerThanLineThickness: 0.6,
      },
      label: {
        // fontSize: 12,
        // fontFamily: 'Arial',
        // lineHeight: 30,
        // fillStyle: 'rgba(25, 25, 25, 1)',
        // strokeStyle: 'transparent',//'rgba(170, 170, 170, 1)',
        // strokeWidth: 0, //1
        // textAlign: 'center',
        // textBaseline: 'top',
      },
    },
  },
  // onVertexClick: clickVertex,
  // onVertexOver: vertexOver,
  // onVertexLeave: vertexLeave,
  // onVertexBoxSelect: vertexBoxSelect,
  // onVertexMouseDown: handleVertexMouseDown,
  // onEdgeMouseDown: handleEdgeMouseDown,
  // onVertexDragging: vertexDragging,
  // onVertexDblClick: vertexDoubleClick,
  // onEdgeClick: edgeClick,
  // onContextMenu: (vertex, event) => {
  //     console.log('right clicked: ', vertex, event);
  // },
  // onZoomChange: changeZoom,

  // colorVertex: colorVertexFunction,
  // labelVertex: labelVertexFunction,
  // borderWidthVertex: handleVertexBorderWidth,
  // labelEdge: labelEdgeFunction,
  // sizeVertex: vertexSizeHandler, // bigPointSizeFunc, smallPointSizeFunc
  // shiftVertexLabel: smallPointLabelShiftFunc, // bigPointLabelShiftFunc, smallPointLabelShiftFunc
  // styleVertexLabel: vertexLabelColorDay,
  // imageVertex: handleVertexIcons,
  // thickEdge: edgeWidthHandler,
  // dashEdge: edgeDash,
  // colorEdge: (e) => {
  //     console.log(e.userData.style.color);
  //     return hexToRgba(e.userData.style.color)
  // },
  // // comment to enable gradient color of vertices
  // borderWidthEdge: edgeBorderWidth,
  // borderColorEdge: edgeBorderColor,
  // hasVertexShapeRendered: true,
  // hasVertexLabelRendered: true,
  // hasVertexTextureRendered: false,
  // hasFastEdgeRendered: true,
  // hasThickEdgeRendered: true,
  // hasEdgeLabelRendered: true,
  // hasArrowFastEdgeRendered: true,
  // control: {
  //     zoomSpeed: 1.2,
  // },
  // boxSelectVertexEnabled: true,
  // clickVertexEnabled: true,
  // overVertexEnabled: true,
  // clickEdgeEnabled: true,
  // overEdgeEnabled: true,
  // dblClickVertexEnabled: true,
  // edgeFollowVertexRenderred: true
};

const myGLConfig = {
  // NOTE
  // this number is to demo only. Please change the collision radius according to your data
  layout: {
    name: 'force',
    option: {
      forces: initForces,
      // // init coordAccessor or set later
      // coordAccessor: (node) => ({
      //   fx: node.userData.style.position.x,
      //   fy: node.userData.style.position.y,
      //   locked: true,
      // }),
    },
  },
  autoFit: true,
  style: {
    background: { color: 'rgb(255,255,255)' },
    point: {
      geometry: {
        // default value if no sizeVertex() set
        pointSize: 20.0,
        minPointSize: 10.0,
        pointBorderColor: 'rgba(70, 70, 70, 0.2)',
        pointBorderWidth: 0.4,
        sizeAttenuation: true,
      },
      label: {
        fontSize: 12,
        fontFamily: 'Arial',
        lineHeight: 30,
        fillStyle: 'rgba(25, 25, 25, 1)',
        strokeStyle: 'rgba(170, 170, 170, 1)',
        strokeWidth: 1,
        textAlign: 'center',
        textBaseline: 'top',
      },
    },
    line: {
      geometry: {
        // change to true if straight edge
        // recommend false (straight line) for large graph
        curve: true, // true, false,
        lineSmoothness: 10, // 20
        singleCurveCurvature: 0.3,
        multiCurveLinkMinCurvature: 0.1,
        // multiCurveLinkMaxCurvature: 1,
        multiStraightLinkMinDistance: 4,
        lineBorderWidth: 0,
        sizeAttenuation: true,
        lineThickbuffer: 0.3,
        arrowLength: 0.8,
        arrowLongerThanLineThickness: 0.6,
      },
      label: {
        fontSize: 12,
        fontFamily: 'Arial',
        lineHeight: 30,
        fillStyle: 'rgba(25, 25, 25, 1)',
        strokeStyle: 'rgba(170, 170, 170, 1)',
        strokeWidth: 1,
        textAlign: 'center',
        textBaseline: 'top',
      },
    },
  },
  onVertexClick: (vertex) => {
    console.log('onVertexClick vertex: ', vertex);
    if (!vertex) return;

    if (vertex != null) {
      console.log(', associated links: ', vertex.getLinks());
      setOverClickMessage(`clicked Id: ${vertex.getId()}, Type: ${vertex.getType()}`);
      if (state.multiSelect) {
        // same logic as onEdgeClick if vertex select is supported
        if (!selects.includes(vertex.id)) {
          selects.push(vertex.id);
        } else {
          selects.splice(selects.indexOf(vertex.id), 1);
        }

        console.log('selects: ', selects);
        graphGL.colorVertex((node, isOver, isClicked, isBoxSelected, isBoxSelecting) => {
          const type = node.getType();
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

          if (selects.includes(node.id)) {
            return `rgba(0,0,0,0.7)`;
          }
          // neither selecting nor overing
          // color by node type
          const colorMap = new Map(graphMap[selValue].typeColors);
          return nodeTypeColors(type, colorMap);
        });
      }
    } else {
      setOverClickMessage('clicked null');
    }
  },
  onVertexDblClick: (vertex) => {
    console.log('onVertexDblClick vertex: ', vertex);
  },
  onVertexMouseDown: (vertex) => {
    console.log('onVertexMouseDown vertex: ', vertex);
  },
  onVertexOver: (vertex) => {
    if (vertex != null) {
      showVertexTooltip(vertex);
      setOverClickMessage(`over Id: ${vertex.getId()}, Type: ${vertex.getType()}`);
    } else {
      setOverClickMessage('over null');
    }
  },
  onVertexLeave: (lastVertex) => {
    // console.log('onVertexLeave');
    hideTooltip();
    hideContextMenu();
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
  onVertexDragging: (vertex, layoutPosition, mouseEvent) => {
    // demo purpose
    // change tooltip position as it's dragging
    updateTooltipPosition(vertex);
  },
  onEdgeOver: (edge) => {
    // console.log('onEdgeOver edge: ', edge);
  },
  onEdgeMouseDown: (edge) => {
    console.log('onEdgeMouseDown edge: ', edge);
  },
  onEdgeClick: (edge) => {
    console.log('onEdgeClick edge: ', edge);
    if (!edge) return;
    // same logic as onVertexClick if edge select is supported
    //
    console.log(
      `${edge.getFromId()}_${edge.getFromType()} --> ${edge.getToId()}_${edge.getToType()}, type: ${edge.getType()}, render: ${edge.getRenderProperty(
        'thickness'
      )}`
    );
  },
  onEdgeDblClick: (edge) => {
    console.log('onEdgeDblClick edge: ', edge);
  },
  onEdgeLeave: (lastEdge) => {
    // console.log('onEdgeLeave lastEdge: ', lastEdge);
  },
  onVertexContextMenu: (vertex, e) => {
    console.log('right clicked: ', vertex, e);
    if (!vertex) return;

    e.preventDefault();

    const menu = document.getElementById('contextMenu');

    const { x, y, w, h } = vertex.getRect();
    const left = x + w / 2,
      top = y + h;

    // or css translate?
    menu.style.display = 'block';
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  },
  onZoomChange: (lastOverVertex, pre, cur) => {
    // zooming may happen on a blank area
    if (lastOverVertex) {
      updateTooltipPosition(lastOverVertex);
    }
  },

  colorVertex: graphMap[selValue].colorFunc,
  labelVertex: graphMap[selValue].labelFunc,
  labelEdge: graphMap[selValue].labelEdgeFunc,
  sizeVertex: smallPointSizeFunc, // bigPointSizeFunc, smallPointSizeFunc
  shiftVertexLabel: smallPointLabelShiftFunc, // bigPointLabelShiftFunc, smallPointLabelShiftFunc
  imageVertex: (node) => {
    const nType = (node.getType() + '').length;
    const r = 0 + Math.floor(Math.random() * (4 - 0 + 1)) + '';
    switch (r) {
      case '0': // 'user':
        return '../static/user.svg';
      case '1': // 'transaction':
        return '../static/node.png';
      case '2': // 'atm':
        return '../static/smile.png';
      case '3': // 'other':
        return '../static/city.svg';
      default:
        return null;
    }
  },
  thickEdge: edgeWidth,
  dashEdge: edgeDash,
  // comment to enable gradient color of vertices
  // colorEdge: edgeColor,
  borderWidthEdge: edgeBorderWidth,
  borderColorEdge: edgeBorderColor,
  hasVertexShapeRendered: true,
  hasVertexLabelRendered: false,
  hasVertexTextureRendered: false,
  hasFastEdgeRendered: true,
  // hasThickEdgeRendered: true,
  hasArrowFastEdgeRendered: true,
  control: {
    zoomSpeed: 1.2,
  },
  boxSelectVertexEnabled: true,
  clickVertexEnabled: true,
  overVertexEnabled: true,
  clickEdgeEnabled: true,
  overEdgeEnabled: true,
};
// graphGL = new GL2D.GraphGL2D(graphMap[selValue].graph, containerElement, graphGLConfig);
graphGL = new GL2D.GraphGL2D(graphMap[selValue].graph, containerElement, myGLConfig);

// graphGL.update();
graphGL.start();
createColorLegend(graphMap[selValue].typeColors);
originalColorVertexFunction = graphMap[selValue].colorFunc;

window.addEventListener(
  'resize',
  () => {
    console.log('resizing...');
    graphGL.resize();
  },
  false
);

resetRenderersUI();

const vertexRendererInputs = document.querySelectorAll("input[name='pt_render']");
let enabledVertexRenderers = [];
for (const elem of vertexRendererInputs) {
  elem.addEventListener('change', (event) => {
    enabledVertexRenderers = Array.from(vertexRendererInputs)
      .filter((i) => i.checked)
      .map((i) => i.value);
    graphGL.activeVertexRenderers = enabledVertexRenderers;
  });
}
const edgeRendererInputs = document.querySelectorAll("input[name='edge_render']");
let enabledEdgeRenderers = [];
for (const elem of edgeRendererInputs) {
  elem.addEventListener('change', (event) => {
    enabledEdgeRenderers = Array.from(edgeRendererInputs)
      .filter((i) => i.checked)
      .map((i) => i.value);

    if (!enabledEdgeRenderers.includes('edge_geom')) {
      if (enabledEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_FAST)) {
        enabledEdgeRenderers = enabledEdgeRenderers.filter((item) => item !== 'edge_geometry_fast');
      } else if (enabledEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_THICK)) {
        enabledEdgeRenderers = enabledEdgeRenderers.filter(
          (item) => item !== 'edge_geometry_thick'
        );
      }
    }

    if (enabledEdgeRenderers.includes('edge_arrow')) {
      if (enabledEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_FAST)) {
        enabledEdgeRenderers = enabledEdgeRenderers.filter((item) => item !== 'edge_arrow');
        enabledEdgeRenderers.push(GL2D.RENDERERTYPE.edge.EDGE_ARROW_FAST);
      } else if (enabledEdgeRenderers.includes(GL2D.RENDERERTYPE.edge.EDGE_GEOMETRY_THICK)) {
        enabledEdgeRenderers = enabledEdgeRenderers.filter((item) => item !== 'edge_arrow');
        enabledEdgeRenderers.push(GL2D.RENDERERTYPE.edge.EDGE_ARROW_THICK);
      }
    }
    graphGL.activeEdgeRenderers = enabledEdgeRenderers;
  });
}

const filterInputs = document.querySelectorAll("input[name='filter']");

for (const elem of filterInputs) {
  elem.addEventListener('change', (event) => {
    const filterFunc = event.target.value;
    console.log('filter function is changed to: ', filterFunc);
    usingHideFunc = filterFunc === 'hide';
  });
}

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

// const buttonAddNode = document.getElementById('btnAddNode'),
//   buttonRemoveNode = document.getElementById('btnRemoveNode'),
//   buttonAddLink = document.getElementById('btnAddLink'),
//   buttonRemoveLink = document.getElementById('btnRemoveLink');

// buttonAddNode.addEventListener('click', function () {
//   if (graphGL.graph().name !== 'random') {
//     console.error('Graph updating only works with random dataset');
//     return;
//   }

//   return;

//   const curGraph = graphGL.graph();
//   curGraph.addNode(
//     'add_' + Math.random(),
//     randomNodeTypes[Math.floor(Math.random() * randomNodeTypes.length)]
//   );
// });

const graphsizeDiv = document.querySelector('#graphsizeDiv');
graphsizeDiv.innerHTML = `Vertex count: ${graphMap[selValue].graph.size.vertex}, edge count: ${graphMap[selValue].graph.size.edge}`;

const selGraph = document.querySelector('#dataset');
selGraph.addEventListener('change', (event) => {
  setOverClickMessage('');
  const graphDatasetName = event.target.value;
  selValue = event.target.value;
  // reset to init
  graphGL.customLayout('force', { forces: initForces });
  resetRenderersUI();

  switch (graphDatasetName.toLowerCase()) {
    case 'tree': {
      graphGL.changeGraph(treeGraph);
      graphGL.layout().coordAccessor = (node) => ({
        locked: true, // false means simulate based on the coordinates; true means fixed postion and simulator will change the positions.
        fx: node.userData.x,
        fy: node.userData.y,
        fz: node.userData.z,
      });
      graphGL.colorVertex(colorFunction4RandomGraph);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4RandomGraph;
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 2;
      graphGL.maxPointSize = 4;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${treeGraph.size.vertex}, edge count: ${treeGraph.size.edge}`;
      createColorLegend(typeColors4RandomGraph);
      break;
    }
    case 'bomb': {
      graphGL.changeGraph(bombGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4Bomb);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4Bomb;
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 20;
      graphGL.start();
      graphsizeDiv.innerHTML = `Vertex count: ${bombGraph.size.vertex}, edge count: ${bombGraph.size.edge}`;
      createColorLegend(groupColors4Bomb);
      break;
    }
    case 'd3net': {
      graphGL.changeGraph(d3netGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4D3net);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4D3net;
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 50;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${d3netGraph.size.vertex}, edge count: ${d3netGraph.size.edge}`;
      createColorLegend(typeColors4D3net);
      break;
    }
    case 'radial': {
      graphGL.changeGraph(radialGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4RandomGraph);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4RandomGraph;
      graphGL.sizeVertex(middlePointSizeFunc);
      graphGL.shiftVertexLabel(middlePointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 50;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${radialGraph.size.vertex}, edge count: ${radialGraph.size.edge}`;
      createColorLegend(typeColors4RandomGraph);
      break;
    }
    case 'miserables': {
      graphGL.changeGraph(miserableGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4Miserables);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4Miserables;
      graphGL.setAutoFit(true);
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 50;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${miserableGraph.size.vertex}, edge count: ${miserableGraph.size.edge}`;
      createColorLegend(typeColors4Miserables);
      break;
    }
    case 'blocks': {
      graphGL.changeGraph(blockGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4Blocks);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4Blocks;
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 100;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${blockGraph.size.vertex}, edge count: ${blockGraph.size.edge}`;
      createColorLegend(typeColors4Blocks);
      break;
    }
    case 'dependency': {
      graphGL.changeGraph(dependencyGraph);
      graphGL.layout().coordAccessor = null;
      graphGL.colorVertex(colorFunction4Depend);
      state.multiSelect = false;
      selects = [];
      originalColorVertexFunction = colorFunction4Depend;
      graphGL.sizeVertex(smallPointSizeFunc);
      graphGL.shiftVertexLabel(smallPointLabelShiftFunc);
      graphGL.minPointSize = 10;
      graphGL.maxPointSize = 50;
      graphGL.start();
      resetRenderersUI();
      graphsizeDiv.innerHTML = `Vertex count: ${dependencyGraph.size.vertex}, edge count: ${dependencyGraph.size.edge}`;
      createColorLegend(typeColors4Depend);
      break;
    }
    default:
      console.log('default graphdataset name');
  }
});

const treeLayoutBtns = document.querySelectorAll('.tree-layout');
for (let i = 0, len = treeLayoutBtns.length; i < len; i++) {
  treeLayoutBtns[i].addEventListener('click', (e) => {
    const orientation = e.target?.value || 'td';

    const chargeForce = {
      ...forcesState.charge,
      // forceEngine default parameters
      // parameter: null,
      parameter: { strength: -1, distanceMin: 1, distanceMax: 2000 },
      name: 'charge',
    };
    const collideForce = {
      ...forcesState.collide,
      parameter: {
        ...forcesState.collide.parameter,
        iterations: 1,
        radius: (n) => Math.cbrt(n.node.userData.size) || 1,
      },
      name: 'collide',
    };
    const linkForce = {
      ...forcesState.link,
      // forceEngine default parameters
      parameter: null,
      name: 'link',
    };

    // treeify graph
    const fixGraph = graphGL.graph();
    const coordAccessor = GL2D.treeify(fixGraph, { orientation: orientation, levelDistance: 40 });
    graphGL.customLayout('force', {
      forces: [chargeForce, linkForce, collideForce],
      graph: fixGraph,
      coordAccessor: coordAccessor,
    });
    // graphGL.customLayout('force', { forces: [chargeForce, linkForce], graph: newGraph });
  });
}

const glContainer = document.getElementById('tgContainer');
glContainer.addEventListener('keydown', function (e) {
  const evt = e || window.event;
  console.log('key: ', evt.key);
  // Shift key
  if (evt.key === 'Shift') {
    // save the state to 'multi-select' if there is
    state.multiSelect = true;
  }
});
glContainer.addEventListener('keyup', function (e) {
  const evt = e || window.event;
  console.log('key: ', evt.key);
  // Shift key
  if (evt.key === 'Shift') {
    // clear the select variable and reset the multiSelect state
    // can use a reducer to do so
    console.log('key up selects: ', selects);

    // // uncomment to cancel multi-select when key is up.
    // // reset state and go back to original color vertex function
    // state.multiSelect = false;
    // selects = [];
    // graphGL?.colorVertex(originalColorVertexFunction);
  }
});
