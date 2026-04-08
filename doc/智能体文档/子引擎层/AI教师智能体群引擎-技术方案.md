# AI教师智能体群引擎 技术方案

> 文档层级：子引擎层  
> 文档目的：说明智能体群的职责拆分、工作流协作和平台接入方式  
> 核心结论：技术方案重点不是堆模型，而是让地图生成、教学推进、画像更新、笔记沉淀和资料入库稳定协同

## 1. Agent 角色

| Agent | 职责 | 主要输出 |
| --- | --- | --- |
| `StarterAgent` | 生成初始地图 | `AI学习地图` |
| `DiagnosisAgent` | 执行短诊断 | `重规划事件` |
| `MapPlannerAgent` | 学习中重规划地图 | 新节点与回主线条件 |
| `TutorAgent` | 讲解与引导 | 流式教学内容 |
| `EvaluatorAgent` | 评分与成长反馈 | `成长反馈事件` |
| `ProfileAgent` | 画像更新 | `学习画像` |
| `NoteSynthAgent` | 思维导图与结构化笔记 | `复习笔记包` |
| `IngestionAgent` | 资料识别和自动入库 | `知识资产包` |
| `StrategyAgent` | 策略快照和日志汇总 | `策略快照` |

## 2. 工作流主链

`选科 -> StarterAgent -> DiagnosisAgent -> MapPlannerAgent -> TutorAgent / EvaluatorAgent -> ProfileAgent -> NoteSynthAgent`

新资料链路：

`上传资料 -> IngestionAgent -> 知识资产包 -> 知识演化记录 -> MapPlannerAgent`

## 3. 技术要求

- 流式讲解统一承接 `HTTP SSE V2`
- 每轮作答必须输出结构化评分结果
- 每次重规划必须输出结构化事件，而不是只给自然语言说明
- 笔记生成与资料入库都必须落主数据，不做一次性临时结果

