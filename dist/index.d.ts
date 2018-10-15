import { Graph } from 'agora-graph';
import { Result } from 'agora-algorithm';
export default pfsPrime;
/**
 * Executes the Push Force Scan' (PFS') algorithm on this graph
 *
 * @param {Graph} graph graph to update
 * @param {object} [options] options
 * @param {number} options.padding padding to add between nodes
 */
export declare function pfsPrime(graph: Graph, options?: object): Result;
