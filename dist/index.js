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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var agora_graph_1 = require("agora-graph");
exports.default = pfsPrime;
/**
 * Executes the Push Force Scan' (PFS') algorithm on this graph
 *
 * @param {Graph} graph graph to update
 * @param {object} [options] options
 * @param {number} options.padding padding to add between nodes
 */
function pfsPrime(graph, options) {
    // TODO: add padding
    if (options === void 0) { options = { padding: 0 }; }
    lodash_1.default.forEach(graph.nodes, function (n) {
        n.up = { x: n.x, y: n.y, ɣ: 0 };
    });
    horizontalScan(graph.nodes);
    lodash_1.default.forEach(graph.nodes, function (n) {
        if (n.up === undefined)
            throw 'cannot set undefined updated position';
        n.up.ɣ = 0;
    });
    verticalScan(graph.nodes);
    lodash_1.default.forEach(graph.nodes, function (n) {
        if (n.up === undefined)
            throw 'cannot update undefined updated position';
        n.x = n.up.x + n.width / 2;
        n.y = n.up.y + n.height / 2;
        delete n.up;
    });
    return { graph: graph };
}
exports.pfsPrime = pfsPrime;
/**
 *
 * @param {Array.<Node>} nodes list of nodes
 * @param {number} i index
 */
function sameX(nodes, i) {
    var index = i;
    for (; index < nodes.length - 1; index++) {
        if (nodes[index].x !== nodes[index + 1].x)
            return index;
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
        if (nodes[index].y !== nodes[index + 1].y)
            return index;
    }
    return index;
}
/**
 *
 * @param {Array.<Node>} nodes node list
 */
function horizontalScan(nodes) {
    nodes.sort(function (a, b) { return a.x - b.x; });
    var i = 0;
    var σ = 0;
    var lmin = nodes[0];
    while (i < nodes.length) {
        var k = sameX(nodes, i);
        var ɣ = 0;
        var u = nodes[i];
        if (u.x > lmin.x) {
            for (var m = i; m <= k; m++) {
                var v = nodes[m];
                // gamma'en peu plus
                var ɣpp = 0;
                for (var j = 0; j < i; j++) {
                    var nodeJ = nodes[j];
                    if (nodeJ.up === undefined)
                        throw 'cannot set undefined updated position for' + nodeJ;
                    ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).x, ɣpp);
                }
                // gangplanck
                var ɣp = agora_graph_1.minX(v) + ɣpp < agora_graph_1.minX(lmin) ? σ : ɣpp;
                ɣ = Math.max(ɣ, ɣp);
            }
        }
        for (var m = i; m <= k; m++) {
            var r = nodes[m];
            if (r.up === undefined)
                throw 'cannot set undefined updated position';
            r.up.ɣ = ɣ;
            r.up.x = agora_graph_1.minX(r) + ɣ;
            if (agora_graph_1.minX(r) < agora_graph_1.minX(lmin)) {
                lmin = r;
            }
        }
        var δ = 0;
        for (var m = i; m <= k; m++) {
            for (var j = k + 1; j < nodes.length; j++) {
                var f = force(nodes[m], nodes[j]);
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
    nodes.sort(function (a, b) { return a.y - b.y; });
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
                    if (nodeJ.up === undefined)
                        throw 'cannot set undefined updated position' + nodeJ;
                    ɣpp = Math.max(nodeJ.up.ɣ + force(nodeJ, v).y, ɣpp);
                }
                var ɣp = agora_graph_1.minY(v) + ɣpp < agora_graph_1.minY(lmin) ? σ : ɣpp;
                ɣ = Math.max(ɣ, ɣp);
            }
        }
        for (var m = i; m <= k; m++) {
            var r = nodes[m];
            if (r.up === undefined)
                throw 'cannot set undefined updated position' + r;
            r.up.ɣ = ɣ;
            r.up.y = agora_graph_1.minY(r) + ɣ;
            if (agora_graph_1.minY(r) < agora_graph_1.minY(lmin)) {
                lmin = r;
            }
        }
        var δ = 0;
        for (var m = i; m <= k; m++) {
            for (var j = k + 1; j < nodes.length; j++) {
                var f = force(nodes[m], nodes[j]);
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
    var f = { x: 0, y: 0 };
    var δx = agora_graph_1.Δx(vi, vj);
    var δy = agora_graph_1.Δy(vi, vj);
    var aδx = Math.abs(δx);
    var aδy = Math.abs(δy);
    var gij = δy / δx;
    var Gij = (vi.height + vj.height) / (vi.width + vj.width);
    if ((Gij >= gij && gij > 0) || (-Gij <= gij && gij < 0) || gij === 0) {
        f.x = δx / aδx * ((vi.width + vj.width) / 2 - aδx);
        f.y = f.x * gij;
    }
    if ((Gij < gij && gij > 0) || (-Gij > gij && gij < 0)) {
        f.y = δy / aδy * ((vi.height + vj.height) / 2 - aδy);
        f.x = f.y / gij;
    }
    return f;
}
