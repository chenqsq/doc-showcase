# 比赛持久化记忆系统主档（AI教师项目）

- 项目名称：课堂知识重构与自适应伴学智能体（AI教师版）
- 记忆系统版本：v1.2
- 主账本位置：`F:/笔记/OneDrive/桌面/比赛/memory/`
- 主账本策略：本地文件为唯一 truth source；ADP 长期记忆为运行时补充
- 时区：`Asia/Shanghai`
- 当前接力点：`CP-20260321-1746-05`
- 最近更新时间：`2026-03-21T17:46:00+08:00`

## 1. 项目目标

建立可持续、可审计、可跨线程交接的比赛记忆系统，满足以下强约束：

1. 每次对话必须进行一次记忆提交。
2. 每次提交必须包含：任务状态更新、进展百分比、证据索引、最新交接提示词。
3. 任务追踪粒度固定为 FR/AC 双层。
4. 执行节奏固定为 P0 优先（FR-01~FR-08 先闭环）。

## 2. 当前关键决策（已冻结）

1. 双层并行：本地主账本 + ADP 长期记忆补充。
2. 任务追踪：FR + AC 双层追踪。
3. 推进策略：P0 优先冲刺，再推进 P1/P2。
4. 证据格式：每次平台操作回传 `1 张截图 + 3-5 个关键字段`。

## 3. 统一状态机

- `TaskStatus`：`BACKLOG | READY | DOING | WAIT_USER | BLOCKED | VERIFYING | DONE`
- `ACStatus`：`UNTESTED | PASS | FAIL | WAIVED`
- 默认迁移：`READY -> DOING -> VERIFYING -> DONE`
- 阻塞迁移：任意状态可迁移到 `BLOCKED`
- 缺证据迁移：任意待验收状态迁移到 `WAIT_USER`
- 约束：证据不全不得进入 `VERIFYING` 和 `DONE`

## 4. 进展计算规则

- 标准公式：`progress = (milestone_done / 6) * 100`
- 6 个里程碑：`策略`、`配置`、`联调`、`证据`、`AC`、`演示`
- 启动基线：处于 `READY` 且尚未开始里程碑时，默认 `5%`（便于排期看板识别）

## 5. 每轮记忆提交流程（强制 SOP）

1. 更新 `01_task_board.yaml`：状态、进展、阻塞、下一动作、checkpoint。
2. 追加 `02_session_log.md`：决策增量、操作结果、风险变化。
3. 更新 `04_evidence_index.md`：新增证据索引或待补证据项。
4. 重写 `03_handoff_latest.md`：最新交接包与新线程提示词。
5. 在回复末尾输出记忆提交回执：`checkpoint_id + 变更摘要`。

## 6. ADP 协同规则（防止跨线程记忆丢失）

1. 在 ADP 开启长期记忆，并固定更新频率与留存周期。
2. API/会话层固定同一 `visitor_biz_id`，保证同一用户记忆连续命中。
3. 检索范围通过 `custom_variables + 标签` 控制，防止跨课程串记忆。
4. 关键参数改动必须回传截图与字段，未回传视为未完成。

## 7. 风险与兜底

1. 风险：用户证据回传不完整。
   处理：任务状态置 `WAIT_USER`，不进入 `VERIFYING/DONE`。
2. 风险：ADP 配置漂移导致记忆不连续。
   处理：在每轮日志记录 `visitor_biz_id` 和变量策略摘要。
3. 风险：新线程交接遗漏上下文。
   处理：必须从 `03_handoff_latest.md` 复制交接提示词发起新线程。

## 8. 本轮后续优先动作（Top 3）

1. 在 ADP 应用中启用长期记忆并截图回传。
2. 固化 `visitor_biz_id` 策略并回传字段。
3. 建立 `custom_variables` 的课程/班级/章节/角色检索边界并回传结果。

## 9. 证据 ID 规则（v1.1）

证据回传改为“用户免填 `task_id`”，规则如下：

1. 用户只需回传：`页面路径`、`配置改动`、`执行结果`、`报错/异常码`、`截图`。
2. 用户可选补充：`platform_run_id`、`备注`（遇到麻烦时建议填写）。
3. `platform_run_id` 改为可选字段（若页面可见 ADP 运行 ID 可附加）。
3. 系统自动生成 `internal_task_id`：
   - 格式：`AUTO-{checkpoint_id}-{NN}`
   - 示例：`AUTO-CP-20260321-1746-05-01`
4. 若用户提供 `platform_run_id`，则 `id_source=platform`；否则 `id_source=auto`。
5. `remark` 默认为空字符串，不影响入库和状态推进。
6. `internal_task_id` 由系统唯一维护，不要求用户手填。
