// SpatialPartitioning - 空間分割系統，使用 QuadTree 優化碰撞檢測和鄰近查詢
/// <reference path="../types/p5.d.ts" />
export class QuadTree {
    constructor(bounds, maxObjects = 10, maxLevel = 5) {
        // 統計資料
        this.totalObjects = 0;
        this.queryCount = 0;
        this.insertCount = 0;
        this.maxObjects = maxObjects;
        this.maxLevel = maxLevel;
        this.root = this.createNode(bounds, 0);
    }
    createNode(bounds, level) {
        return {
            bounds,
            objects: [],
            children: [],
            level
        };
    }
    // 清空 QuadTree
    clear() {
        this.root.objects = [];
        this.root.children = [];
        this.totalObjects = 0;
    }
    // 插入物件
    insert(obj) {
        this.insertIntoNode(this.root, obj);
        this.totalObjects++;
        this.insertCount++;
    }
    insertIntoNode(node, obj) {
        // 如果節點有子節點，嘗試插入到子節點
        if (node.children.length > 0) {
            const childIndex = this.getChildIndex(node, obj);
            if (childIndex !== -1) {
                this.insertIntoNode(node.children[childIndex], obj);
                return;
            }
        }
        // 插入到當前節點
        node.objects.push(obj);
        // 檢查是否需要分割
        if (node.objects.length > this.maxObjects && node.level < this.maxLevel) {
            if (node.children.length === 0) {
                this.split(node);
            }
            // 重新分配物件到子節點
            for (let i = node.objects.length - 1; i >= 0; i--) {
                const childIndex = this.getChildIndex(node, node.objects[i]);
                if (childIndex !== -1) {
                    this.insertIntoNode(node.children[childIndex], node.objects[i]);
                    node.objects.splice(i, 1);
                }
            }
        }
    }
    // 分割節點成四個子節點
    split(node) {
        const bounds = node.bounds;
        const midX = (bounds.left + bounds.right) / 2;
        const midY = (bounds.top + bounds.bottom) / 2;
        const level = node.level + 1;
        // 西北 (top-left)
        node.children[0] = this.createNode({
            left: bounds.left,
            right: midX,
            top: bounds.top,
            bottom: midY
        }, level);
        // 東北 (top-right)
        node.children[1] = this.createNode({
            left: midX,
            right: bounds.right,
            top: bounds.top,
            bottom: midY
        }, level);
        // 西南 (bottom-left)
        node.children[2] = this.createNode({
            left: bounds.left,
            right: midX,
            top: midY,
            bottom: bounds.bottom
        }, level);
        // 東南 (bottom-right)
        node.children[3] = this.createNode({
            left: midX,
            right: bounds.right,
            top: midY,
            bottom: bounds.bottom
        }, level);
    }
    // 獲取物件應該屬於哪個子節點
    getChildIndex(node, obj) {
        if (node.children.length === 0)
            return -1;
        const bounds = this.getObjectBounds(obj);
        const nodeBounds = node.bounds;
        const midX = (nodeBounds.left + nodeBounds.right) / 2;
        const midY = (nodeBounds.top + nodeBounds.bottom) / 2;
        // 檢查物件是否完全在某個象限內
        const inTopHalf = bounds.bottom <= midY;
        const inBottomHalf = bounds.top >= midY;
        const inLeftHalf = bounds.right <= midX;
        const inRightHalf = bounds.left >= midX;
        if (inTopHalf) {
            if (inLeftHalf)
                return 0; // 西北
            if (inRightHalf)
                return 1; // 東北
        }
        else if (inBottomHalf) {
            if (inLeftHalf)
                return 2; // 西南
            if (inRightHalf)
                return 3; // 東南
        }
        return -1; // 跨越多個象限
    }
    // 獲取物件的邊界框
    getObjectBounds(obj) {
        if (obj.getBounds) {
            return obj.getBounds();
        }
        const radius = obj.r || 1;
        return {
            left: obj.position.x - radius,
            right: obj.position.x + radius,
            top: obj.position.y - radius,
            bottom: obj.position.y + radius
        };
    }
    // 查詢範圍內的物件
    queryRange(bounds) {
        const results = [];
        this.queryRangeInNode(this.root, bounds, results);
        this.queryCount++;
        return results;
    }
    queryRangeInNode(node, bounds, results) {
        // 檢查範圍是否與節點邊界相交
        if (!this.boundsIntersect(node.bounds, bounds)) {
            return;
        }
        // 檢查節點中的物件
        for (const obj of node.objects) {
            const objBounds = this.getObjectBounds(obj);
            if (this.boundsIntersect(objBounds, bounds)) {
                results.push(obj);
            }
        }
        // 遞歸查詢子節點
        for (const child of node.children) {
            this.queryRangeInNode(child, bounds, results);
        }
    }
    // 查詢點附近的物件
    queryPoint(point, radius = 0) {
        const bounds = {
            left: point.x - radius,
            right: point.x + radius,
            top: point.y - radius,
            bottom: point.y + radius
        };
        return this.queryRange(bounds);
    }
    // 查詢最近的物件
    queryNearest(point, maxDistance = Infinity) {
        const candidates = this.queryPoint(point, maxDistance);
        let nearest = null;
        let nearestDistance = maxDistance;
        for (const obj of candidates) {
            const distance = this.calculateDistance(point, obj.position);
            if (distance < nearestDistance) {
                nearest = obj;
                nearestDistance = distance;
            }
        }
        return nearest;
    }
    // 查詢 k 個最近的物件
    queryKNearest(point, k, maxDistance = Infinity) {
        const candidates = this.queryPoint(point, maxDistance);
        // 計算距離並排序
        const withDistance = candidates.map(obj => ({
            obj,
            distance: this.calculateDistance(point, obj.position)
        }));
        withDistance.sort((a, b) => a.distance - b.distance);
        return withDistance.slice(0, k).map(item => item.obj);
    }
    // 檢查兩個邊界框是否相交
    boundsIntersect(bounds1, bounds2) {
        return !(bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom);
    }
    // 計算兩點間距離
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // 移除物件（效能較低，適合偶爾使用）
    remove(obj) {
        return this.removeFromNode(this.root, obj);
    }
    removeFromNode(node, obj) {
        // 從當前節點移除
        const index = node.objects.indexOf(obj);
        if (index !== -1) {
            node.objects.splice(index, 1);
            this.totalObjects--;
            return true;
        }
        // 從子節點移除
        for (const child of node.children) {
            if (this.removeFromNode(child, obj)) {
                return true;
            }
        }
        return false;
    }
    // 獲取統計資訊
    getStats() {
        return {
            totalObjects: this.totalObjects,
            totalNodes: this.countNodes(this.root),
            maxDepth: this.getMaxDepth(this.root),
            queryCount: this.queryCount,
            insertCount: this.insertCount,
            averageObjectsPerLeaf: this.getAverageObjectsPerLeaf()
        };
    }
    countNodes(node) {
        let count = 1;
        for (const child of node.children) {
            count += this.countNodes(child);
        }
        return count;
    }
    getMaxDepth(node) {
        if (node.children.length === 0) {
            return node.level;
        }
        let maxDepth = node.level;
        for (const child of node.children) {
            maxDepth = Math.max(maxDepth, this.getMaxDepth(child));
        }
        return maxDepth;
    }
    getAverageObjectsPerLeaf() {
        const leafNodes = [];
        this.collectLeafNodes(this.root, leafNodes);
        if (leafNodes.length === 0)
            return 0;
        const totalObjects = leafNodes.reduce((sum, node) => sum + node.objects.length, 0);
        return totalObjects / leafNodes.length;
    }
    collectLeafNodes(node, leafNodes) {
        if (node.children.length === 0) {
            leafNodes.push(node);
        }
        else {
            for (const child of node.children) {
                this.collectLeafNodes(child, leafNodes);
            }
        }
    }
    // 渲染 QuadTree（調試用）
    render(p, showObjects = false) {
        this.renderNode(p, this.root, showObjects);
    }
    renderNode(p, node, showObjects) {
        const bounds = node.bounds;
        // 繪製節點邊界
        p.stroke(100, 100, 100, 100);
        p.strokeWeight(1);
        p.noFill();
        p.rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        // 繪製物件（如果啟用）
        if (showObjects) {
            p.fill(255, 0, 0, 100);
            p.noStroke();
            for (const obj of node.objects) {
                const radius = obj.r || 2;
                p.circle(obj.position.x, obj.position.y, radius * 2);
            }
        }
        // 繪製子節點
        for (const child of node.children) {
            this.renderNode(p, child, showObjects);
        }
    }
    // 重設統計
    resetStats() {
        this.queryCount = 0;
        this.insertCount = 0;
    }
}
//# sourceMappingURL=SpatialPartitioning.js.map