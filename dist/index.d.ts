import { Algorithm } from 'agora-graph';
/**
 * Executes the Push Force Scan' (PFS') algorithm on this graph
 *
 * @param {Graph} graph graph to update
 * @param {object} [options] options
 * @param {number} options.padding padding to add between nodes
 */
export declare const pfsPrime: import("agora-graph").Function<{
    padding: number;
}>;
export declare const PFSPAlgorithm: Algorithm<{
    padding: number;
}>;
export default PFSPAlgorithm;
