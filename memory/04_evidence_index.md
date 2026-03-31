# 证据索引（Evidence Index）

- 索引版本：v1.2
- 时区：`Asia/Shanghai`
- 当前 checkpoint：`CP-20260321-1746-05`

## 1. 证据字段规范

每条证据包含以下字段（`internal_task_id` 必填，`platform_run_id` 与 `remark` 可选）：

1. `evidence_id`：唯一编号（建议 `EVD-YYYYMMDD-序号`）
2. `checkpoint_id`：对应会话接力点
3. `related_fr`：关联 FR（可多项）
4. `related_ac`：关联 AC（可多项）
5. `source`：`ADP_SCREENSHOT` 或 `LOCAL_NOTE`
6. `file_path`：截图绝对路径
7. `internal_task_id`：系统自动生成任务标识（格式：`AUTO-{checkpoint_id}-{NN}`）
8. `id_source`：`auto` 或 `platform`
9. `platform_run_id`：ADP 真实运行 ID（可选）
10. `page_path`：平台页面路径
11. `config_change`：配置改动摘要
12. `result`：执行结果
13. `error_or_code`：报错信息或异常码（无则填 `NONE`）
14. `remark`：补充说明（可选，遇到麻烦时建议填写）
15. `captured_at`：证据采集时间

## 2. 已收录证据

| evidence_id | checkpoint_id | related_fr | related_ac | source | file_path | internal_task_id | id_source | platform_run_id | page_path | result | remark |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EVD-20260321-000 | CP-20260321-1703-01 | FR-00 | N/A | LOCAL_NOTE | N/A | AUTO-CP-20260321-1703-01-01 | auto | N/A | memory-system-bootstrap | 主账本初始化完成 | "" |
| EVD-20260321-001 | CP-20260321-1711-02 | FR-00 | N/A | LOCAL_NOTE | N/A | AUTO-CP-20260321-1711-02-01 | auto | N/A | usage-test-guidance | 用户发起“怎么用”测试，进入首轮实操引导 | "" |
| EVD-20260321-002 | CP-20260321-1719-03 | FR-00 | N/A | LOCAL_NOTE | N/A | AUTO-CP-20260321-1719-03-01 | auto | N/A | task-id-rule-clarified | 明确 task_id 优先使用 ADP 实际执行 ID，无则本地生成 | "" |
| EVD-20260321-003 | CP-20260321-1724-04 | FR-00 | N/A | LOCAL_NOTE | N/A | AUTO-CP-20260321-1724-04-01 | auto | N/A | protocol-v1p1-auto-id | 证据协议升级为用户免填 task_id，系统自动生成 internal_task_id | "" |
| EVD-20260321-004 | CP-20260321-1746-05 | FR-00 | N/A | LOCAL_NOTE | N/A | AUTO-CP-20260321-1746-05-01 | auto | N/A | protocol-v1p2-remark | 证据协议升级新增备注字段，便于记录用户遇到的麻烦 | "新增可选备注字段" |

## 3. 待补证据队列

| queue_id | for_action | related_fr | required_fields | owner | status |
| --- | --- | --- | --- | --- | --- |
| PENDING-01 | 启用 ADP 长期记忆 | FR-01, FR-02 | page_path/config_change/result/error_or_code/screenshot | User | WAIT_USER |
| PENDING-02 | 固定 visitor_biz_id 并验证连续会话 | FR-03 | page_path/config_change/result/error_or_code/screenshot | User | WAIT_USER |
| PENDING-03 | 配置 custom_variables + 标签检索隔离 | FR-04, FR-10 | page_path/config_change/result/error_or_code/screenshot | User | WAIT_USER |

## 4. 证据入库规则

1. 新证据到达后，先追加本文件，再更新 `01_task_board.yaml` 对应 AC 的 `evidence_refs`。
2. 若证据缺核心字段（`page_path/config_change/result/screenshot`），则不更新 AC 状态，任务保持 `WAIT_USER`。
3. `error_or_code` 允许为 `NONE`，不阻塞推进。
4. 当 `result=失败` 或存在异常时，若 `remark` 为空，记录“建议补充备注”提示，但不阻塞入库。
5. 任一任务进入 `DONE` 前，必须至少有 1 条可回溯证据。
