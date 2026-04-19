

# 仓库差异对照（上次拉取 vs 本次拉取）

**上次拉取节点**：`Add dynamic category CRUD`（2026-04-09/10）
**本次最新节点**：`fix: Floor Plan table editing` (2026-04-18，本地提交)，GitHub 主分支可见最新为 2026-04-17 系列

新增 **~14 个新提交**，主题集中在：**Supabase 全量化迁移、Buffet 自助餐、Floor Zones、Promotions、动态定价、实时订阅**。

---

## 一、新增数据库 Migration（5 个）

| 文件 | 内容 |
|---|---|
| `03_buffet_mode.sql` | 自助餐模式：buffet plan / 餐别 / 计时 |
| `04_floor_zones.sql` | 楼层区域（Zones）独立表 |
| `05_promotions.sql` | 促销表（含 GMV 贡献统计）|
| `06_pricing_strategies.sql` | 动态定价策略表 |
| `07_floor_layout.sql` | 桌子坐标 / canvas 尺寸持久化 |
| `08_orders_payment_method.sql` | orders 增加 payment_method 字段 |

> 配合 `feat: migrate to own Supabase project with full schema + seed data`（2026-04-17）—— 完整自有 schema + 种子数据。

## 二、新增前端页面

| 新页面 | 说明 |
|---|---|
| `src/pages/KDSPage.tsx` | **独立可操作 KDS**（之前只有 Admin 内嵌只读版）|
| `src/pages/KioskOrdering.tsx` | **完整 Kiosk 自助点餐流程** |
| `src/pages/QROrdering.tsx` | 重构后的 **QR 点餐**（替代原 `/order`）|
| `src/pages/admin/AdminBuffet.tsx` | **自助餐管理后台** |

## 三、新增数据访问层 `src/lib/db-*.ts`（12 个）

完整 Supabase 数据访问抽象层，覆盖：
`db-buffet / db-crm / db-inventory / db-menu / db-orders / db-pricing / db-promotions / db-queue / db-settings / db-staff / db-table / db-zone`

> 对应提交 `feat: full Supabase integration - connect all stores and pages` 与 `feat: migrate all remaining hardcoded data to Supabase`，并且 `delete mock-data.ts` —— **mock 数据彻底移除**。

## 四、新增组件目录

- `src/components/auth/` — 登录/认证组件
- `src/components/kiosk/` — Kiosk 子组件
- `src/components/qr/` — QR 子组件
- `src/components/ErrorBoundary.tsx`
- `src/components/GrainBackground.tsx`

## 五、新增 hook

- `src/hooks/useZones.tsx` — Floor Zones CRUD + Supabase 持久化

## 六、关键功能性提交摘要

- **Buffet Mode 全实现**（`feat: buffet mode — full implementation`）
- **Floor Plan**：Zone CRUD、桌位编辑、画布尺寸、全屏卡片、点击编辑修复
- **Realtime 订阅**：`fix: add realtime subscription to MobilePOS`
- **AdminFinance / AdminBuffet 接入真实 DB**
- **AdminPromotions** 多次健壮性修复（white screen、null-safe gmvContribution）
- **MobilePOS 静态导入**修复（`fix: replace dynamic import with static`）
- **Buffet 导航位置调整**（放到 Menu 之下）

---

## 七、与本项目当前状态的差距

我们当前项目对应 Apr 9 节点；本次新增的差距清单：

| 类别 | 我们目前 | 仓库新增 | 缺口 |
|---|---|---|---|
| 数据层 | 本地 store + mock-data | Supabase + db-*.ts 抽象层 | **整层未迁移** |
| KDS | Admin 内只读 | 独立 `/kds` 可操作 | 缺独立页 |
| Kiosk | 无 | `/kiosk` 完整流程 | 缺整页 |
| QR | `/order` 简化版 | `/qr` 完整 + 会员/支付模式 | 需重构 |
| Buffet | 无 | 全套 schema + 后台 | 完全缺失 |
| Floor Zones | 无 | 独立 zones + 持久化布局 | 缺失 |
| Promotions | 静态 | DB + GMV 贡献统计 | 需接 DB |
| 动态定价 | 本地 store | DB 策略表 | 需接 DB |
| Realtime | 无 | MobilePOS 已订阅 | 未实现 |
| Mock 数据 | 仍在 | 已删除 | — |

---

## 八、建议下一步实施顺序

1. **数据库基线对齐**：导入 8 个 migration（03–08 + 3 个时间戳基线）
2. **db-*.ts 数据访问层** 引入并替换 store
3. 接入 **Realtime**（MobilePOS / KDS / Pickup）
4. 新增 **`/kds`、`/kiosk`、`/qr`** 三个完整页面
5. 新增 **AdminBuffet** + Buffet schema 联调
6. **Floor Zones / 动态定价 / Promotions** 接入 DB
7. 移除 mock-data，添加 ErrorBoundary

