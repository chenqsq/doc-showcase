# 最新交接包（Handoff）

- checkpoint_id：`CP-20260321-1746-05`
- 更新时间：`2026-03-21T17:46:00+08:00`
- 时区：`Asia/Shanghai`
- 当前阶段：`P0 优先冲刺`
- 当前主目标：先闭环 `FR-01~FR-08`

## 1. 当前 FR 状态与进展

| FR | 状态 | 进展 |
| --- | --- | --- |
| FR-01 | READY | 5% |
| FR-02 | READY | 5% |
| FR-03 | READY | 5% |
| FR-04 | READY | 5% |
| FR-05 | BACKLOG | 0% |
| FR-06 | BACKLOG | 0% |
| FR-07 | BACKLOG | 0% |
| FR-08 | BACKLOG | 0% |
| FR-09 | BACKLOG | 0% |
| FR-10 | BACKLOG | 0% |
| FR-11 | BACKLOG | 0% |
| FR-12 | BACKLOG | 0% |

## 2. 当前 AC 通过情况

- AC-01 ~ AC-14：全部 `UNTESTED`

## 3. 当前阻塞项与责任方

1. 阻塞项：ADP 侧长期记忆尚未完成实操证据回传。
   责任方：`User`
2. 阻塞项：`visitor_biz_id` 连续会话策略尚未实测回传。
   责任方：`User`
3. 阻塞项：`custom_variables + 标签` 检索隔离尚未实测回传。
   责任方：`User`

## 4. 下一步最高优先 3 项动作（含平台操作）

1. 在腾讯云 ADP 应用中开启长期记忆，设置更新频率与留存周期。
2. 在会话/API 配置中固定同一 `visitor_biz_id`，执行连续两轮对话验证记忆命中。
3. 在检索链路配置 `custom_variables`（`course_id/class_id/chapter_id/role`）并绑定标签，验证课程隔离。

## 5. 证据回传标准（固定）

- 每个动作回传：
  - 1 张截图（建议保存到 `F:/笔记/OneDrive/桌面/比赛/memory/evidence/`）
  - 关键字段：`页面路径`、`配置改动`、`执行结果`、`报错/异常码`
  - 可选字段：`platform_run_id`（若 ADP 页面可见运行 ID）
  - 可选字段：`备注`（遇到麻烦时填写）
- 说明：
  - 用户无需填写 `task_id`
  - 系统自动生成 `internal_task_id`：`AUTO-{checkpoint_id}-{NN}`

```text
页面路径:
配置改动:
执行结果:
报错/异常码: NONE
截图:
platform_run_id: (可选)
备注: (可选，遇到麻烦时填写)
```

## 6. 新线程可直接粘贴提示词

```text
你将接手“AI教师比赛项目”。先恢复记忆，不要直接改方案。
请按顺序读取：
1) F:/笔记/OneDrive/桌面/比赛/memory/00_project_memory.md
2) F:/笔记/OneDrive/桌面/比赛/memory/01_task_board.yaml
3) F:/笔记/OneDrive/桌面/比赛/memory/02_session_log.md
4) F:/笔记/OneDrive/桌面/比赛/memory/03_handoff_latest.md
5) F:/笔记/OneDrive/桌面/比赛/memory/04_evidence_index.md

然后只输出：
- FR-01~FR-12 当前状态与进展
- AC-01~AC-14 通过情况
- 当前阻塞项与责任方
- 下一步最高优先 3 项动作（含我在腾讯云平台要做的具体操作）
当前接力点：CP-20260321-1746-05
```
