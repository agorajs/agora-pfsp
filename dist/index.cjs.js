'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));
var agoraGraph = require('agora-graph');

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
/**
 * Executes the Push Force Scan' (PFS') algorithm on this graph
 *
 * @param {Graph} graph graph to update
 * @param {object} [options] options
 * @param {number} options.padding padding to add between nodes
 */

var pfsPrime = agoraGraph.createFunction(function (graph) {

  // TODO: add padding
  _.forEach(graph.nodes, function (n) {
    n.up = {
      x: n.x,
      y: n.y,
      ɣ: 0
    };
  });

  horizontalScan(graph.nodes);

  _.forEach(graph.nodes, function (n) {
    if (n.up === undefined) throw 'cannot set undefined updated position';
    n.up.ɣ = 0;
  });

  verticalScan(graph.nodes);

  _.forEach(graph.nodes, function (n) {
    if (n.up === undefined) throw 'cannot update undefined updated position';
    n.x = n.up.x + n.width / 2;
    n.y = n.up.y + n.height / 2;
    delete n.up;
  });

  return {
    graph: graph
  };
});
var PFSPAlgorithm = {
  name: "PFS'",
  algorithm: pfsPrime
};
/**
 *
 * @param {Array.<Node>} nodes list of nodes
 * @param {number} i index
 */

function sameX(nodes, i) {
  var index = i;

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


function sameY(nodes, i) {
  var index = i;

  for (; index < nodes.length - 1; index++) {
    if (nodes[index].y !== nodes[index + 1].y) return index;
  }

  return index;
}
/**
 *
 * @param {Array.<Node>} nodes node list
 */


function horizontalScan(nodes) {
  nodes.sort(function (a, b) {
    return a.x - b.x;
  });
  var i = 0;
  var σ = 0;
  var lmin = nodes[0];

  while (i < nodes.length) {
    var k = sameX(nodes, i);
    var ɣ = 0;
    var u = nodes[i];

    if (u.x > lmin.x) {
      for (var m = i; m <= k; m++) {
        var v = nodes[m]; // gamma'en peu plus

        var ɣpp = 0;

        for (var j = 0; j < i; j++) {
          var nodeJ = nodes[j];
          if (nodeJ.up === undefined) throw 'cannot set undefined updated position for' + nodeJ;
          ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).x, ɣpp);
        } // gangplanck


        var ɣp = agoraGraph.minX(v) + ɣpp < agoraGraph.minX(lmin) ? σ : ɣpp;
        ɣ = Math.max(ɣ, ɣp);
      }
    }

    for (var _m = i; _m <= k; _m++) {
      var r = nodes[_m];
      if (r.up === undefined) throw 'cannot set undefined updated position';
      r.up.ɣ = ɣ;
      r.up.x = agoraGraph.minX(r) + ɣ;

      if (agoraGraph.minX(r) < agoraGraph.minX(lmin)) {
        lmin = r;
      }
    }

    var δ = 0;

    for (var _m2 = i; _m2 <= k; _m2++) {
      for (var _j = k + 1; _j < nodes.length; _j++) {
        var f = force(nodes[_m2], nodes[_j]);

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


function verticalScan(nodes) {
  nodes.sort(function (a, b) {
    return a.y - b.y;
  });
  var i = 0;
  var lmin = nodes[0];
  var σ = 0;

  while (i < nodes.length) {
    var u = nodes[i];
    var k = sameY(nodes, i);
    var ɣ = 0;

    if (u.y > lmin.y) {
      for (var m = i; m <= k; m++) {
        var ɣpp = 0;
        var v = nodes[m];

        for (var j = 0; j < i; j++) {
          var nodeJ = nodes[j];
          if (nodeJ.up === undefined) throw 'cannot set undefined updated position' + nodeJ;
          ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).y, ɣpp);
        }

        var ɣp = agoraGraph.minY(v) + ɣpp < agoraGraph.minY(lmin) ? σ : ɣpp;
        ɣ = Math.max(ɣ, ɣp);
      }
    }

    for (var _m3 = i; _m3 <= k; _m3++) {
      var r = nodes[_m3];
      if (r.up === undefined) throw 'cannot set undefined updated position' + r;
      r.up.ɣ = ɣ;
      r.up.y = agoraGraph.minY(r) + ɣ;

      if (agoraGraph.minY(r) < agoraGraph.minY(lmin)) {
        lmin = r;
      }
    }

    var δ = 0;

    for (var _m4 = i; _m4 <= k; _m4++) {
      for (var _j2 = k + 1; _j2 < nodes.length; _j2++) {
        var f = force(nodes[_m4], nodes[_j2]);

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


function force(vi, vj) {
  var f = {
    x: 0,
    y: 0
  };
  var δx = agoraGraph.Δx(vi, vj);
  var δy = agoraGraph.Δy(vi, vj);
  var aδx = Math.abs(δx);
  var aδy = Math.abs(δy);
  var gij = δy / δx;
  var Gij = (vi.height + vj.height) / (vi.width + vj.width);

  if (Gij >= gij && gij > 0 || -Gij <= gij && gij < 0 || gij === 0) {
    f.x = δx / aδx * ((vi.width + vj.width) / 2 - aδx);
    f.y = f.x * gij;
  }

  if (Gij < gij && gij > 0 || -Gij > gij && gij < 0) {
    f.y = δy / aδy * ((vi.height + vj.height) / 2 - aδy);
    f.x = f.y / gij;
  }

  return f;
}

exports.PFSPAlgorithm = PFSPAlgorithm;
exports.default = PFSPAlgorithm;
exports.pfsPrime = pfsPrime;
