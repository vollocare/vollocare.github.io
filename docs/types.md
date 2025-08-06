# 類型定義

## 概述

本頁面列出了遊戲中所有的自定義類型。

## InputEventCallback

**描述**: 無描述

**定義**: `export type InputEventCallback = (event: InputEvent) => void;`

**檔案**: `src/systems/InputSystem.ts`

---

## UIEventCallback

**描述**: 無描述

**定義**: `export type UIEventCallback = (event: UIEvent) => void;`

**檔案**: `src/systems/UISystem.ts`

---

## Vector2D

**描述**: 無描述

**定義**: `export type Vector2D = {`

**檔案**: `src/types/common.ts`

---

## Vector3D

**描述**: 無描述

**定義**: `export type Vector3D = Vector2D & {`

**檔案**: `src/types/common.ts`

---

## Range

**描述**: 無描述

**定義**: `export type Range = {`

**檔案**: `src/types/common.ts`

---

## BoundingBox

**描述**: 無描述

**定義**: `export type BoundingBox = {`

**檔案**: `src/types/common.ts`

---

## PerformanceRating

**描述**: 無描述

**定義**: `export type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';`

**檔案**: `src/utils/PerformanceMonitor.ts`

---

