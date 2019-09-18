/**
 * Implementation of the Push Force Scan' (PFS') algorithm
 *
 * HAYASHI, Kunihiko, INOUE, Michiko, MASUZAWA, Toshimitsu, et al.
 * A layout adjustment problem for disjoint rectangles preserving orthogonal order.
 * In : International Symposium on Graph Drawing.
 * Springer, Berlin, Heidelberg, 1998.
 * p. 183-197.
 * https://doi.org/10.1007/3-540-37623-2_14
 */
'use strict';

import _ from 'lodash';
import {
  Δx,
  Δy,
  minX,
  minY,
  Graph,
  Node,
  CartesianVector,
  createFunction,
  Algorithm
} from 'agora-graph';

/**
 * Executes the Push Force Scan' (PFS') algorithm on this graph
 *
 * @param {Graph} graph graph to update
 * @param {object} [options] options
 * @param {number} options.padding padding to add between nodes
 */
export const pfsPrime = createFunction(function(
  graph: Graph,
  options: { padding: number } = { padding: 0 }
) {
  // TODO: add padding

  _.forEach(graph.nodes, n => {
    n.up = { x: n.x, y: n.y, ɣ: 0 };
  });

  horizontalScan(graph.nodes);
  _.forEach(graph.nodes, n => {
    if (n.up === undefined) throw 'cannot set undefined updated position';
    n.up.ɣ = 0;
  });
  verticalScan(graph.nodes);

  _.forEach(graph.nodes, n => {
    if (n.up === undefined) throw 'cannot update undefined updated position';

    n.x = n.up.x + n.width / 2;
    n.y = n.up.y + n.height / 2;
    delete n.up;
  });

  return { graph: graph };
});

export const PFSPAlgorithm: Algorithm<{ padding: number }> = {
  name: "PFS'",
  algorithm: pfsPrime
};
export default PFSPAlgorithm;
/**
 *
 * @param {Array.<Node>} nodes list of nodes
 * @param {number} i index
 */
function sameX(nodes: Node[], i: number): number {
  let index = i;
  for (; index < nodes.length - 1; index++) {
    if (nodes[index].x !== nodes[index + 1].x) return index;
  }

  return index;
}

/**
 *
 * @param {Array.<Node>} nodes list of nodes
 * @param {number} i index
 */
function sameY(nodes: Node[], i: number): number {
  let index = i;
  for (; index < nodes.length - 1; index++) {
    if (nodes[index].y !== nodes[index + 1].y) return index;
  }

  return index;
}

/**
 *
 * @param {Array.<Node>} nodes node list
 */
function horizontalScan(nodes: Array<Node>) {
  nodes.sort((a, b) => a.x - b.x);
  let i = 0;
  let σ = 0;

  let lmin = nodes[0];

  while (i < nodes.length) {
    let k = sameX(nodes, i);
    let ɣ = 0;
    const u = nodes[i];

    if (u.x > lmin.x) {
      for (let m = i; m <= k; m++) {
        const v = nodes[m];
        // gamma'en peu plus
        let ɣpp = 0;

        for (let j = 0; j < i; j++) {
          const nodeJ = nodes[j];
          if (nodeJ.up === undefined)
            throw 'cannot set undefined updated position for' + nodeJ;
          ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).x, ɣpp);
        }

        // gangplanck
        const ɣp = minX(v) + ɣpp < minX(lmin) ? σ : ɣpp;

        ɣ = Math.max(ɣ, ɣp);
      }
    }

    for (let m = i; m <= k; m++) {
      const r = nodes[m];
      if (r.up === undefined) throw 'cannot set undefined updated position';
      r.up.ɣ = ɣ;
      r.up.x = minX(r) + ɣ;

      if (minX(r) < minX(lmin)) {
        lmin = r;
      }
    }

    let δ = 0;

    for (let m = i; m <= k; m++) {
      for (let j = k + 1; j < nodes.length; j++) {
        let f = force(nodes[m], nodes[j]);
        if (f.x > δ) {
          δ = f.x;
        }
      }
    }

    σ += δ;
    i = k + 1;
  }
}

/**
 *
 * @param {Array.<Node>} nodes node list
 */
function verticalScan(nodes: Array<Node>) {
  nodes.sort((a, b) => a.y - b.y);

  let i = 0;
  let lmin = nodes[0];
  let σ = 0;

  while (i < nodes.length) {
    const u = nodes[i];
    let k = sameY(nodes, i);

    let ɣ = 0;
    if (u.y > lmin.y) {
      for (let m = i; m <= k; m++) {
        let ɣpp = 0;
        let v = nodes[m];
        for (let j = 0; j < i; j++) {
          const nodeJ = nodes[j];
          if (nodeJ.up === undefined)
            throw 'cannot set undefined updated position' + nodeJ;

          ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).y, ɣpp);
        }

        let ɣp = minY(v) + ɣpp < minY(lmin) ? σ : ɣpp;

        ɣ = Math.max(ɣ, ɣp);
      }
    }
    for (let m = i; m <= k; m++) {
      let r = nodes[m];
      if (r.up === undefined) throw 'cannot set undefined updated position' + r;

      r.up.ɣ = ɣ;
      r.up.y = minY(r) + ɣ;

      if (minY(r) < minY(lmin)) {
        lmin = r;
      }
    }

    let δ = 0;
    for (let m = i; m <= k; m++) {
      for (let j = k + 1; j < nodes.length; j++) {
        let f = force(nodes[m], nodes[j]);
        if (f.y > δ) {
          δ = f.y;
        }
      }
    }
    σ += δ;
    i = k + 1;
  }
}

/**
 *
 * @param {Node} vi
 * @param {Node} vj
 */
function force(vi: Node, vj: Node): CartesianVector {
  const f = { x: 0, y: 0 };

  let δx = Δx(vi, vj);
  let δy = Δy(vi, vj);
  let aδx = Math.abs(δx);
  let aδy = Math.abs(δy);

  let gij = δy / δx;

  let Gij = (vi.height + vj.height) / (vi.width + vj.width);

  if ((Gij >= gij && gij > 0) || (-Gij <= gij && gij < 0) || gij === 0) {
    f.x = (δx / aδx) * ((vi.width + vj.width) / 2 - aδx);
    f.y = f.x * gij;
  }
  if ((Gij < gij && gij > 0) || (-Gij > gij && gij < 0)) {
    f.y = (δy / aδy) * ((vi.height + vj.height) / 2 - aδy);
    f.x = f.y / gij;
  }

  return f;
}
