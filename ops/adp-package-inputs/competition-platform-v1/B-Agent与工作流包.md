# 输入包 B｜Agent 与工作流包

你现在接收的是“Agent 与工作流包”。  
请据此生成 `Multi-Agent + 工作流编排` 的应用结构，不要退化为单 Agent 问答，也不要把所有职责塞给一个主控。

## 1. 应用模式与协同方式

- 应用模式固定为：`Multi-Agent`
- 协同方式固定为：`工作流编排`
- 学生主链必须采用稳定、固定、可解释的工作流
- `自由转交` 只允许作为探索性增强，不进入正式主链

## 2. 固定业务 Agent

默认生成 9 个业务 Agent：

| Agent | 主要职责 | 典型输入 | 典型输出 | 不负责什么 |
| --- | --- | --- | --- | --- |
| `StarterAgent` | 生成初始学习地图 | 科目、学科结构、画像摘要 | 第一版地图建议 | 不保存业务真状态 |
| `DiagnosisAgent` | 生成并评估短诊断 | 当前科目、基础范围、诊断回答 | 起点校准结果 | 不做长篇讲课 |
| `MapPlannerAgent` | 地图重规划 | 诊断、作答、画像、知识变更 | `RerouteEvent` | 不直接落库 |
| `TutorAgent` | 讲解、追问、引导 | 当前关卡、知识片段、画像摘要 | 流式讲解 | 不给最终评分定版 |
| `EvaluatorAgent` | 判题、评分、反馈 | 学生答案、评分点、标准思路 | 评分、错因、达标判断 | 不替代地图规划 |
| `ProfileAgent` | 更新画像 | 作答记录、行为信号、地图推进 | 画像摘要与增量 | 不规划工作流 |
| `NoteSynthAgent` | 生成笔记、导图、复习计划 | 学习过程、关键点、错因 | 笔记包 | 不做知识发布 |
| `IngestionAgent` | 资料识别、声明抽取、知识补丁生成 | 上传资料、解析结果 | `KnowledgePatch`、`EvidenceBundle` | 不直接发布到主教学区 |
| `StrategyAgent` | 影响域分析、策略快照、审计说明 | 重规划日志、发布记录、系统状态 | 策略说明、影响分析 | 不替代主链教学 |

## 3. 可选轻量主控 Agent

如果腾讯助手或模板强依赖“主控 Agent”，允许额外补一个：

`TeacherOrchestrator`

但它必须满足：

- 只做路由和收口
- 不持有业务真状态
- 不替代 9 个业务 Agent 的核心职责
- 不把整条主链重新改回“主控大包大揽”

## 4. 学生主工作流

学生主链固定为：

`选科 -> StarterAgent -> DiagnosisAgent -> MapPlannerAgent -> TutorAgent -> EvaluatorAgent -> ProfileAgent -> NoteSynthAgent`

工作流约束：

- `StarterAgent` 先生成初始地图
- `DiagnosisAgent` 负责短诊断与起点判断
- `MapPlannerAgent` 负责重排主线与插入补桥节点
- `TutorAgent` 负责流式讲解与追问
- `EvaluatorAgent` 必须输出结构化评分与错因
- `ProfileAgent` 必须在学习中和学习后更新画像
- `NoteSynthAgent` 在单关结束、一轮结束、阶段结束都可产出笔记资产

## 5. 新资料工作流

资料入库链固定为：

`上传资料 -> IngestionAgent -> SaveDoc/OCR/解析 -> 声明抽取 -> candidate -> validation -> release/rollback -> StrategyAgent 影响域重算`

工作流约束：

- `IngestionAgent` 只负责识别、切分、抽取、补丁建议
- 候选知识进入 `candidate` 区后才能被校验
- 校验通过后才能生成发布结果
- 如果冲突或低可信，只能进入候选区或归档区
- 发布后必须由 `StrategyAgent` 给出影响域与策略说明

## 6. 页面到 Agent / 工作流映射

| 页面 | 主承接 Agent / 工作流 |
| --- | --- |
| 选科与开学页 | `StarterAgent` |
| AI 学习地图页 | `DiagnosisAgent`、`MapPlannerAgent` |
| AI 闯关学习页 | `TutorAgent`、`EvaluatorAgent` |
| 笔记复习与成长页 | `ProfileAgent`、`NoteSynthAgent` |
| 资料注入与知识库演化后台 | `IngestionAgent` |
| 系统自治与策略分析后台 | `StrategyAgent` |

## 7. 推荐模型类型口径

请按 Agent 职责区分模型类型，不把全链路锁死到单模型：

| Agent | 推荐模型类型 |
| --- | --- |
| `StarterAgent` | 规划型 |
| `DiagnosisAgent` | 推理型 |
| `MapPlannerAgent` | 推理型 |
| `TutorAgent` | 讲解型 |
| `EvaluatorAgent` | 推理型 |
| `ProfileAgent` | 稳定结构化输出型 |
| `NoteSynthAgent` | 总结型 |
| `IngestionAgent` | 解析与推理型 |
| `StrategyAgent` | 规划型 |

## 8. 工作流硬约束

- 主链不允许变成自由闲聊
- 地图状态不能只存在于模型上下文
- 评分结果必须结构化，不能只给一句“你做得不错”
- 新资料不能上传即直接污染主知识区
- 后台必须能解释策略变化、发布影响和异常记录
