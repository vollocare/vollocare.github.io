import { IVector } from '../types/vector';
import { BoundingBox } from '../types/common';
export interface ISpatialObject {
    position: IVector;
    r?: number;
    getBounds?(): BoundingBox;
}
export interface QuadTreeNode<T extends ISpatialObject> {
    bounds: BoundingBox;
    objects: T[];
    children: QuadTreeNode<T>[];
    level: number;
}
export declare class QuadTree<T extends ISpatialObject> {
    private root;
    private maxObjects;
    private maxLevel;
    private totalObjects;
    private queryCount;
    private insertCount;
    constructor(bounds: BoundingBox, maxObjects?: number, maxLevel?: number);
    private createNode;
    clear(): void;
    insert(obj: T): void;
    private insertIntoNode;
    private split;
    private getChildIndex;
    private getObjectBounds;
    queryRange(bounds: BoundingBox): T[];
    private queryRangeInNode;
    queryPoint(point: IVector, radius?: number): T[];
    queryNearest(point: IVector, maxDistance?: number): T | null;
    queryKNearest(point: IVector, k: number, maxDistance?: number): T[];
    private boundsIntersect;
    private calculateDistance;
    remove(obj: T): boolean;
    private removeFromNode;
    getStats(): QuadTreeStats;
    private countNodes;
    private getMaxDepth;
    private getAverageObjectsPerLeaf;
    private collectLeafNodes;
    render(p: p5Instance, showObjects?: boolean): void;
    private renderNode;
    resetStats(): void;
}
export interface QuadTreeStats {
    totalObjects: number;
    totalNodes: number;
    maxDepth: number;
    queryCount: number;
    insertCount: number;
    averageObjectsPerLeaf: number;
}
//# sourceMappingURL=SpatialPartitioning.d.ts.map