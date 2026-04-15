const n=`## 1. 产品定义\r
\r
\`AI主导学习生命周期的自进化自学智能体平台\` 面向自学场景，重点解决“学生不知道从哪开始学、学到一半卡住、学完没有沉淀、资料无法快速进入系统、兴趣很容易掉”的问题。\r
\r
比赛版不把平台讲成“会答题的聊天机器人”，而是讲成：\r
\r
- 会先生成学习地图\r
- 会发起短诊断并校准起点\r
- 会安排当前关卡和下一步任务\r
- 会在学习中实时插入补桥、复习、挑战和奖励节点\r
- 会更新学习画像\r
- 会生成思维导图和结构化笔记\r
- 会接收新资料并推动知识库与策略继续进化\r
\r
## 2. 比赛版需求收口\r
\r
### 2.1 一句话定义\r
\r
这是一套由 AI 主动接管学生学习生命周期、并能在新资料进入后继续进化的自学智能体平台。\r
\r
### 2.2 主闭环\r
\r
比赛演示和后续实现都优先围绕这一条主闭环：\r
\r
\`选科 -> 开始学习 -> 初始学习地图 -> 短诊断 -> 当前关卡闯关 -> 卡点触发补桥 -> 通关反馈 -> 画像更新 -> 思维导图/结构化笔记 -> 新资料入库后地图变化\`\r
\r
### 2.3 MVPp0敏捷开发\r
\r
| 类型 | 当前必须做成什么 |\r
| --- | --- |\r
| \`MVP-01\` | 学生能从“选科与开学页”一键进入 AI 接管学习 |\r
| \`MVP-02\` | 平台能生成初始学习地图，并在短诊断后重排第一版主线 |\r
| \`MVP-03\` | 学生能进入当前关卡，完成一轮讲解、作答、评分与推进 |\r
| \`MVP-04\` | 系统能在卡点时插入补桥支线，并说明为什么调整路线 |\r
| \`MVP-05\` | 学生能看到画像变化、成长反馈和至少一种复习资产 |\r
| \`MVP-06\` | 平台管理者能上传新资料，并看到知识演化记录与地图影响 |\r
\r
### 2.4 p1开发\r
\r
| 类型 | 能加分但不是第一优先级 |\r
| --- | --- |\r
| \`BONUS-01\` | 多科并行排程与跨科节奏管理 |\r
| \`BONUS-02\` | 更细的游戏化反馈，如奖励节点、挑战链、阶段 Boss 强化展示 |\r
| \`BONUS-03\` | 更完整的策略分析后台和异常审计面板 |\r
| \`BONUS-04\` | 更强的知识演化可视化与影响域对比 |\r
\r
### 2.5 非范围\r
\r
比赛版当前明确不做下面这些内容：\r
\r
- 不做营销型首页\r
- 不做重皮肤化、重卡通化的教育游戏前端\r
- 不把排行榜、积分榜作为核心叙事\r
- 不把“自动训练底层模型”写成产品核心能力\r
- 不在比赛阶段追求多学科全部做满\r
- 不把完整业务真源、复杂微服务和大规模运维体系当成当前首要目标\r
\r
## 3. 目标用户与角色职责\r
\r
| 角色 | 核心目标 | 直接使用页面 | 重点关心什么 |\r
| --- | --- | --- | --- |\r
| 学生 | 选科后被快速带入有效学习，并在学习中持续获得反馈与推进 | 选科与开学页、AI学习地图页、AI闯关学习页、笔记复习与成长页 | 下一步学什么、为什么这样学、自己有没有变强 |\r
| 平台管理者 | 注入资料、查看知识库演化、观察自治策略和异常状态 | 资料注入与知识库演化后台、系统自治与策略分析后台 | 新资料怎么影响平台、系统有没有异常、策略是否可信 |\r
| AI教师智能体群引擎 | 持续编排学习生命周期、管理地图重规划和知识演化 | 不作为独立前台角色展示 | 如何稳态编排学习、如何更新画像、如何影响后续路径 |\r
\r
## 4. 核心问题\r
\r
\`\`\`mermaid\r
flowchart TB\r
    A[学生自学效率低] --> B[不知道从哪开始]\r
    A --> C[基础薄弱时没有即时补桥]\r
    A --> D[学完没有复习资产]\r
    A --> E[资料进不来系统]\r
    A --> F[兴趣和正反馈不足]\r
\r
    B --> B1[面对整本课或整门课容易发懵]\r
    C --> C1[卡住后只能反复搜题]\r
    D --> D1[知识点、错题和笔记互相割裂]\r
    E --> E1[新资料无法快速变成可学习内容]\r
    F --> F1[只有对错，没有成长感]\r
\`\`\`\r
\r
## 5. 产品目标\r
\r
| 目标编号 | 目标内容 | 验收口径 |\r
| --- | --- | --- |\r
| \`G-01\` | 学生能在 1 次点击后进入 AI 接管学习 | 选科后点击“开始学习”，平台立即生成初始地图和当前任务 |\r
| \`G-02\` | 学习地图能实时演化 | 学习中暴露基础缺口时，系统能自动插入补桥节点并回接主线 |\r
| \`G-03\` | 学生能持续获得正反馈和成长感 | 每次关卡完成都能看到通关反馈、能力成长和地图推进 |\r
| \`G-04\` | 学习画像持续更新 | 学习过程中和每次结束后都能看到画像变化 |\r
| \`G-05\` | 笔记与复习资产自动沉淀 | 单关、一轮、阶段结束后都能生成思维导图和结构化笔记 |\r
| \`G-06\` | 新资料能自动进入知识库并影响学习路径 | 资料入库后能看到知识演化记录和地图变化 |\r
| \`G-07\` | 评委能在 5 到 8 分钟内看懂作品主价值 | 按推荐演示链路走一遍即可理解“AI 主导学习生命周期”的差异点 |\r
\r
## 6. 比赛版页面总览\r
\r
本作品固定包含 6 个核心页面，其中前 4 页是主演示链路，后 2 页是后台亮点支撑页。\r
\r
| 页面 | 主要角色 | 页面优先级 | 页面定位 |\r
| --- | --- | --- | --- |\r
| 选科与开学页 | 学生 | \`P0\` | 主链起点，负责把学生送进 AI 接管流程 |\r
| AI学习地图页 | 学生 | \`P0\` | 主视觉中心，负责证明学习路线会实时演化 |\r
| AI闯关学习页 | 学生 | \`P0\` | 真正讲、练、改、推的学习页 |\r
| 笔记复习与成长页 | 学生 | \`P0\` | 负责证明平台会沉淀复习资产与成长结果 |\r
| 资料注入与知识库演化后台 | 平台管理者 | \`P1\` | 负责证明平台会因为新资料继续变强 |\r
| 系统自治与策略分析后台 | 平台管理者 | \`P1\` | 负责证明平台可观测、可审计、可解释 |\r
\r
### 6.1 页面关系图\r
\r
\`\`\`mermaid\r
flowchart TB\r
    A[选科与开学页] --> B[AI学习地图页]\r
    B --> C[AI闯关学习页]\r
    C --> D[笔记复习与成长页]\r
    A --> E[资料注入与知识库演化后台]\r
    A --> F[系统自治与策略分析后台]\r
    E --> B\r
    F --> B\r
\`\`\`\r
\r
## 7. 核心场景链路\r
\r
本节用时序图把比赛版核心主闭环拆成“谁发起动作、谁承接请求、谁做智能体编排、谁保存真状态、谁把结果展示给用户”的完整数据链路。\r
\r
统一遵守同一条实现边界：前端只负责发起动作和展示结果，\`FastAPI\` 后端负责代理 \`ADP\`、落库、审计和回滚，\`PostgreSQL\` 保存学习与知识治理真状态，对象存储负责原始资料、导图和导出物。\r
\r
### 7.1 全局总览时序图\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
    participant Storage as 对象存储\r
\r
    Note over Frontend,ADP: 前端不直接持有 ADP 密钥，所有工作流调用与流式输出都必须先经过 FastAPI 后端代理\r
    Note over Backend,DB: 学习地图、画像、重规划日志、知识版本都以 PostgreSQL 为真状态来源，不能只存在于 ADP 上下文\r
\r
    Student->>Frontend: 1. 选高数并点击“开始学习”\r
    Frontend->>Backend: 2. 调用 /api/startup/session 创建学习启动会话\r
    Backend->>DB: 3. 读取历史画像、续学记录和演示配置\r
    Backend->>ADP: 4. 调用 StarterAgent 生成初始学习地图建议\r
    ADP-->>Backend: 5. 返回 学习地图（LearningMap） 草案和 地图节点（MapNode） 建议\r
    Backend->>DB: 6. 保存 学习启动会话（LearningSession） 和第一版地图\r
    Backend-->>Frontend: 7. 返回初始地图与推荐下一步\r
\r
    Student->>Frontend: 8. 完成短诊断并提交\r
    Frontend->>Backend: 9. 调用 /api/diagnostics/{subjectId}/submit\r
    Backend->>ADP: 10. 调用 DiagnosisAgent + MapPlannerAgent 校准起点和主线\r
    ADP-->>Backend: 11. 返回 短诊断结果（DiagnosticResult） 和 重规划事件（RerouteEvent）\r
    Backend->>DB: 12. 更新地图节点状态、推荐顺序和重规划日志\r
    Backend-->>Frontend: 13. 返回校准后的主线、补桥说明和推荐关卡\r
\r
    Student->>Frontend: 14. 进入当前关卡并开始作答\r
    Frontend->>Backend: 15. 调用 /api/learning/sessions 创建闯关会话\r
    Backend->>DB: 16. 读取当前节点、画像摘要和知识片段\r
    Backend->>ADP: 17. 调用 TutorAgent 开始流式讲解\r
    ADP-->>Backend: 18. 持续输出讲解增量、关卡提问和阶段提示\r
    Backend-->>Frontend: 19. 代理 SSE 给前端展示\r
    Frontend->>Backend: 20. 调用 /api/learning/sessions/{sessionId}/answers 提交作答\r
    Backend->>ADP: 21. 调用 EvaluatorAgent、ProfileAgent、NoteSynthAgent 产出评分和沉淀结果\r
    ADP-->>Backend: 22. 返回评分建议、成长反馈、画像增量和笔记草稿\r
    Backend->>DB: 23. 保存 闯关作答记录（CheckpointAttempt）、成长反馈事件（FeedbackEvent）、学习画像快照（LearnerProfileSnapshot）、笔记资产包（NoteBundle）\r
    Backend->>Storage: 24. 保存思维导图、导出笔记和关联资源\r
    Backend-->>Frontend: 25. 返回通关反馈、画像变化和复习资产\r
\r
    Student->>Frontend: 26. 上传新资料或进入后台查看知识演化\r
    Frontend->>Backend: 27. 调用 /api/ingestion/upload 创建资料入库任务\r
    Backend->>Storage: 28. 保存原始资料文件\r
    Backend->>DB: 29. 写入 资料入库任务（IngestionTask） 状态 = uploaded\r
    Backend->>ADP: 30. 调用 IngestionAgent 解析资料并生成 知识补丁（KnowledgePatch）\r
    ADP-->>Backend: 31. 返回知识补丁、证据摘要和候选建议\r
    Backend->>DB: 32. 推进入库状态 uploaded -> parsing -> extracted -> validating -> candidate\r
    Frontend->>Backend: 33. 管理员审核后调用 /api/knowledge/releases\r
    Backend->>DB: 34. 写入 校验报告（ValidationReport） 和 知识发布（KnowledgeRelease） 或回滚记录\r
    Backend->>ADP: 35. 调用 StrategyAgent 重算影响域与后续地图推荐\r
    ADP-->>Backend: 36. 返回 策略快照（StrategySnapshot） 和影响说明\r
    Backend->>DB: 37. 更新受影响章节、地图推荐和审计日志\r
    Backend-->>Frontend: 38. 后台展示发布结果，学生前台后续请求感知地图变化\r
\r
    Note over Backend,DB: 知识变更必须先经过候选与校验，再发布或回滚，不能上传即直接污染主教学区\r
\`\`\`\r
\r
这条链路证明什么：平台不是只会聊天的问答页面，而是从学习启动、学习推进到知识进化都形成闭环。\r
\r
必须落库的关键状态：\`LearningSession\`、\`LearningMap\`、\`RerouteEvent\`、\`CheckpointAttempt\`、\`LearnerProfileSnapshot\`、\`IngestionTask\`、\`KnowledgeRelease\`、\`StrategySnapshot\`。\r
\r
### 7.2 场景一：选科与开学链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
\r
    Note over Backend,ADP: StarterAgent 只负责给出起图建议，不直接保存 学习启动会话（LearningSession） 和 学习地图（LearningMap）\r
\r
    Student->>Frontend: 1. 选择高等数学并点击“开始学习”\r
    Frontend->>Backend: 2. 调用 /api/startup/session 创建学习启动会话\r
    Backend->>DB: 3. 查询学生历史画像、最近学习记录和推荐起点\r
    Backend->>DB: 4. 创建 学习启动会话（LearningSession） 初始记录\r
    Backend->>ADP: 5. 调用 StarterAgent 生成第一版地图和起点建议\r
    ADP-->>Backend: 6. 返回 学习地图（LearningMap） 草案、当前节点和推荐下一步\r
    Backend->>DB: 7. 保存 学习地图（LearningMap） 与 地图节点（MapNode） 状态\r
    Backend-->>Frontend: 8. 返回会话编号、当前地图、推荐节点和跳转入口\r
    Frontend-->>Student: 9. 自动进入 AI学习地图页\r
\`\`\`\r
\r
这条链路证明什么：学生不是先输入长问题再慢慢试探，而是一点击就被送入 AI 组织好的学习起点。\r
\r
必须落库的关键状态：\`LearningSession\`、\`LearningMap\`、\`MapNode\`、历史续学记录。\r
\r
### 7.3 场景二：地图生成与短诊断校准链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
\r
    Note over Frontend,Backend: 前端只展示结构化地图与推荐下一步，不自己拼装重规划逻辑\r
\r
    Frontend->>Backend: 1. 请求当前学习地图与诊断入口\r
    Backend->>DB: 2. 读取当前 学习地图（LearningMap）、节点状态和画像摘要\r
    Backend-->>Frontend: 3. 返回初始地图、当前节点和短诊断问题\r
    Student->>Frontend: 4. 完成短诊断并提交答案\r
    Frontend->>Backend: 5. 调用 /api/diagnostics/{subjectId}/submit\r
    Backend->>ADP: 6. 调用 DiagnosisAgent 评估基础缺口与起点偏差\r
    ADP-->>Backend: 7. 返回 短诊断结果（DiagnosticResult）\r
    Backend->>ADP: 8. 调用 MapPlannerAgent 生成 重规划事件（RerouteEvent）\r
    ADP-->>Backend: 9. 返回主线重排、补桥建议和推荐下一节点\r
    Backend->>DB: 10. 更新 LearningMap、MapNode 状态和 RerouteEvent 日志\r
    Backend-->>Frontend: 11. 返回校准后的主线、调整原因和推荐动作\r
    Frontend-->>Student: 12. 展示“当前在哪里、下一步去哪、为什么这样安排”\r
\`\`\`\r
\r
这条链路证明什么：地图不是静态目录，而是会根据学生当前基础自动重排的学习路线。\r
\r
必须落库的关键状态：\`DiagnosticResult\`、\`RerouteEvent\`、\`LearningMap\`、\`MapNode\` 状态变化。\r
\r
### 7.4 场景三：实时闯关学习链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
\r
    Note over Frontend,ADP: 流式讲解统一由 FastAPI 后端代理，前端只消费 SSE，不直接连接 ADP\r
\r
    Student->>Frontend: 1. 点击当前推荐关卡进入 AI闯关学习页\r
    Frontend->>Backend: 2. 调用 /api/learning/sessions 创建闯关会话\r
    Backend->>DB: 3. 读取当前地图节点、画像摘要和命中的知识片段\r
    Backend->>ADP: 4. 调用 TutorAgent 启动流式讲解\r
    ADP-->>Backend: 5. SSE：讲解增量（tutor_delta）\r
    Backend-->>Frontend: 6. 代理讲解增量并实时展示\r
    ADP-->>Backend: 7. SSE：关卡提问（checkpoint_prompt）\r
    Backend-->>Frontend: 8. 代理关卡提问与作答要求\r
    Student->>Frontend: 9. 提交答案\r
    Frontend->>Backend: 10. 调用 /api/learning/sessions/{sessionId}/answers\r
    Backend->>ADP: 11. 调用 EvaluatorAgent 评分并判断是否达标\r
    ADP-->>Backend: 12. 返回评分建议、错因和反馈摘要（feedback_summary）\r
    Backend->>DB: 13. 保存 闯关作答记录（CheckpointAttempt） 和 成长反馈事件（FeedbackEvent）\r
    Backend-->>Frontend: 14. 返回评分结果、成长提示和下一步动作\r
    ADP-->>Backend: 15. SSE：完成（done）\r
    Backend-->>Frontend: 16. 结束本轮流式会话并更新页面状态\r
\`\`\`\r
\r
这条链路证明什么：平台会真实地“讲、练、改、推”，而不是只生成一段静态答案。\r
\r
必须落库的关键状态：\`CheckpointAttempt\`、\`FeedbackEvent\`、闯关会话状态、下一步动作结果。\r
\r
### 7.5 场景四：补桥与回主线链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
\r
    Note over Backend,DB: 所有影响学习路线的调整都必须写入 重规划事件（RerouteEvent） 和审计日志，保证后续可回看、可解释\r
\r
    Student->>Frontend: 1. 连续答错、长时间卡住或反复追问同类问题\r
    Frontend->>Backend: 2. 上报失败尝试、停留时长、遗忘回落等风险信号\r
    Backend->>DB: 3. 汇总 CheckpointAttempt、FeedbackEvent 和当前画像风险\r
    Backend->>ADP: 4. 调用 MapPlannerAgent 判断是否触发补桥\r
    ADP-->>Backend: 5. 返回 重规划事件（RerouteEvent） 和 bridge_required 建议\r
    Backend->>DB: 6. 写入重规划日志，切换 MapNode 为补桥支线\r
    Backend-->>Frontend: 7. 返回补桥原因、补桥节点和回主线条件\r
    Frontend-->>Student: 8. 地图页展示“为什么调整路线”\r
\r
    Student->>Frontend: 9. 完成补桥节点学习并达标\r
    Frontend->>Backend: 10. 提交补桥完成结果\r
    Backend->>DB: 11. 更新补桥节点为 passed，恢复原主线节点状态\r
    Backend->>ADP: 12. 再次调用 MapPlannerAgent 确认回主线路径\r
    ADP-->>Backend: 13. 返回回接主线建议和下一主线节点\r
    Backend->>DB: 14. 写入回主线日志和新的推荐节点\r
    Backend-->>Frontend: 15. 地图回到主线，并展示新的推荐顺序\r
\`\`\`\r
\r
这条链路证明什么：补桥不是惩罚，而是系统识别风险后主动接住学生、再把学生送回主线的编排能力。\r
\r
必须落库的关键状态：\`RerouteEvent\`、\`MapNode\` 的 \`bridge_required/passed/current\` 状态、审计日志、回主线记录。\r
\r
### 7.6 场景五：笔记复习沉淀与画像更新链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Student as 学生\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
    participant Storage as 对象存储\r
\r
    Note over ADP,DB: ADP 负责生成画像摘要和笔记草稿，最终版本化画像与笔记资产由后端保存\r
\r
    Student->>Frontend: 1. 单关、一轮或阶段学习结束后进入成长页\r
    Frontend->>Backend: 2. 请求成长反馈、画像变化、笔记和复习计划\r
    Backend->>DB: 3. 读取本轮作答记录、反馈事件和当前画像\r
    Backend->>ADP: 4. 调用 ProfileAgent 更新 学习画像快照（LearnerProfileSnapshot）\r
    ADP-->>Backend: 5. 返回掌握度、薄弱点、错误模式和节奏变化\r
    Backend->>ADP: 6. 调用 NoteSynthAgent 生成 笔记资产包（NoteBundle） 和导图草稿\r
    ADP-->>Backend: 7. 返回结构化笔记、错题回顾、复习计划和导图内容\r
    Backend->>DB: 8. 保存 LearnerProfileSnapshot 和 NoteBundle\r
    Backend->>Storage: 9. 保存思维导图、导出笔记和关联资源\r
    Backend-->>Frontend: 10. 返回成长曲线、画像变化、笔记摘要和复习计划\r
    Student->>Frontend: 11. 打开某次笔记或思维导图\r
    Frontend->>Backend: 12. 查询笔记详情、画像历史和复习计划\r
    Backend->>DB: 13. 读取笔记索引、画像历史和复习任务\r
    Backend->>Storage: 14. 读取导图资源和导出文件\r
    Backend-->>Frontend: 15. 返回笔记详情、导图地址和复习清单\r
\`\`\`\r
\r
这条链路证明什么：学习结果会被沉淀成可回看、可复习、可继续利用的资产，而不是会话结束就消失。\r
\r
必须落库的关键状态：\`LearnerProfileSnapshot\`、\`NoteBundle\`、复习计划、画像历史和资源索引。\r
\r
### 7.7 场景六：资料注入与知识进化链路\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Admin as 平台管理者\r
    participant Frontend as 前端\r
    participant Backend as FastAPI后端\r
    participant DB as PostgreSQL\r
    participant ADP as ADP平台\r
    participant Storage as 对象存储\r
\r
    Note over Backend,DB: 资料入库必须经过 uploaded -> parsing -> extracted -> validating -> candidate，再决定发布、归档、失败或后续回滚\r
\r
    Admin->>Frontend: 1. 上传讲义、题单、图片或录音资料\r
    Frontend->>Backend: 2. 调用 /api/ingestion/upload 创建资料入库任务\r
    Backend->>Storage: 3. 保存原始资料文件\r
    Backend->>DB: 4. 写入 资料入库任务（IngestionTask） 状态 = uploaded\r
    Backend->>ADP: 5. 调用 IngestionAgent 执行 OCR、解析、声明抽取和知识补丁生成\r
    ADP-->>Backend: 6. 返回 知识补丁（KnowledgePatch） 与证据摘要\r
    Backend->>DB: 7. 推进入库状态 uploaded -> parsing -> extracted -> validating\r
    Backend->>DB: 8. 写入 校验报告（ValidationReport），候选状态 = candidate\r
    Backend-->>Frontend: 9. 后台展示候选知识、冲突记录和影响范围\r
    Admin->>Frontend: 10. 审核候选知识并选择发布\r
    Frontend->>Backend: 11. 调用 /api/knowledge/releases 提交知识发布\r
\r
    alt 校验通过并发布\r
        Backend->>DB: 12. 写入 知识发布（KnowledgeRelease），状态 = released\r
        Backend->>ADP: 13. 调用 StrategyAgent 计算受影响章节、地图节点和学生范围\r
        ADP-->>Backend: 14. 返回 策略快照（StrategySnapshot） 和影响说明\r
        Backend->>DB: 15. 更新策略快照、影响域和后续地图推荐\r
        Backend-->>Frontend: 16. 展示发布结果与地图影响\r
        Admin->>Frontend: 17. 如发布后发现问题，发起回滚\r
        Frontend->>Backend: 18. 提交知识回滚请求\r
        Backend->>DB: 19. 记录回滚原因、目标版本和影响范围\r
        Backend-->>Frontend: 20. 返回回滚完成与重新生效的稳定版本\r
    else 存在冲突或低可信\r
        Backend->>DB: 12. 将候选知识标记为 archived 或 failed\r
        Backend-->>Frontend: 13. 展示未发布原因、冲突点和处理建议\r
    end\r
\`\`\`\r
\r
这条链路证明什么：平台会因为新资料继续变强，但新知识不会绕过校验门禁直接污染主教学区。\r
\r
必须落库的关键状态：\`IngestionTask\`、\`KnowledgePatch\`、\`ValidationReport\`、\`KnowledgeRelease\`、回滚记录、\`StrategySnapshot\` 和影响域日志。\r
\r
\r
\r
## 8. 页面分析\r
\r
### 8.1 选科与开学页\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 让学生不需要先会提问，而是直接进入被 AI 接管的学习流程 |\r
| 使用角色 | 学生 |\r
| 页面入口 | 系统首页默认首屏、上次学习续接入口 |\r
| 首屏重点 | 科目选择、推荐起点、开始学习按钮、最近学习入口 |\r
| 核心模块 | 科目卡片、多科勾选区、推荐起点卡、开始学习按钮、最近学习记录 |\r
| 用户动作 | 选一门或多门课、查看推荐起点、点击开始学习、恢复上次进度 |\r
| AI 动作 | 根据学科与历史画像准备初始学习起点和启动会话 |\r
| 关键状态 | 未选科、已选单科、已选多科、可直接续学 |\r
| 常见失败 | 无可用科目、历史画像读取失败、启动会话失败 |\r
| 页面完成后去向 | 进入 AI学习地图页 |\r
| 验收点 | 学生 1 次点击后进入学习主链，不需要先输入长问题 |\r
\r
### 8.2 AI学习地图页\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 让学生看见 AI 自动生成且会持续演化的学习地图 |\r
| 使用角色 | 学生 |\r
| 页面入口 | 开学页启动后自动进入；闯关完成后回到此页看推进结果 |\r
| 首屏重点 | 当前阶段、当前主线节点、推荐下一步、补桥或重规划提示 |\r
| 核心模块 | 科目切换、阶段分区、节点状态、主线轨迹、补桥支线、阶段 Boss、推荐下一步、重规划说明 |\r
| 用户动作 | 查看当前主线、进入推荐节点、展开补桥原因、回看已解锁阶段 |\r
| AI 动作 | 生成地图、诊断后重排、学习中实时插入补桥/复习/挑战节点 |\r
| 关键状态 | 初始地图、短诊断后重排、学习中实时调整、阶段解锁 |\r
| 常见失败 | 地图为空、节点状态不同步、重规划失败 |\r
| 页面完成后去向 | 进入 AI闯关学习页 |\r
| 验收点 | 评委能一眼看懂“当前在哪里、下一步去哪、为什么这样安排” |\r
\r
### 8.3 AI闯关学习页\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 完成当前关卡的讲解、练习、判题、反馈和推进 |\r
| 使用角色 | 学生 |\r
| 页面入口 | 从学习地图页点击当前推荐节点进入 |\r
| 首屏重点 | 当前关卡目标、通过条件、AI 流式讲解区、作答区 |\r
| 核心模块 | 当前关卡卡、流式讲解区、作答区、即时反馈卡、能力成长提示、下一步动作区 |\r
| 用户动作 | 提问、作答、请求示例、查看讲解、继续下一步 |\r
| AI 动作 | 讲解、追问、判题、反馈、输出地图推进建议、触发补桥或挑战 |\r
| 关键状态 | 讲解中、等待作答、评分完成、通过、补桥、挑战成功 |\r
| 常见失败 | 流式中断、题目识别失败、评分失败、上下文续接失败 |\r
| 页面完成后去向 | 通过时回地图页继续推进；补桥时跳到补桥节点；阶段结束时可去笔记复习与成长页 |\r
| 验收点 | 至少能演示一轮“讲解 -> 作答 -> 反馈 -> 地图推进/补桥”的完整闭环 |\r
\r
### 8.4 笔记复习与成长页\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 证明平台不是只会讲题，还会沉淀复习资产和成长结果 |\r
| 使用角色 | 学生 |\r
| 页面入口 | 单关、一轮或阶段学习结束后进入；也可从地图页查看成长结果 |\r
| 首屏重点 | 思维导图、结构化笔记、今日复习任务、成长变化 |\r
| 核心模块 | 思维导图区、结构化笔记区、错题回顾、复习计划、学习画像、成长曲线 |\r
| 用户动作 | 查看笔记、展开错题、查看复习任务、回看画像变化 |\r
| AI 动作 | 生成关卡摘要、结构化笔记、思维导图、阶段总结和复习计划 |\r
| 关键状态 | 单关总结、一轮总结、阶段总结、待复习提醒 |\r
| 常见失败 | 笔记未生成、导图渲染失败、画像未刷新 |\r
| 页面完成后去向 | 返回地图页继续学习，或进入下一轮复习任务 |\r
| 验收点 | 至少可见一份思维导图或结构化笔记，以及一次画像更新 |\r
\r
### 8.5 资料注入与知识库演化后台\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 证明平台会因为新资料进入而继续变强，而不是只吃旧知识 |\r
| 使用角色 | 平台管理者、需要上传资料的学生 |\r
| 页面入口 | 后台导航入口 |\r
| 首屏重点 | 上传面板、识别状态、知识资产包、演化版本和影响范围 |\r
| 核心模块 | 上传区、识别状态流、知识资产包预览、演化记录、影响范围、回滚入口 |\r
| 用户动作 | 上传资料、查看识别状态、查看知识资产包、确认影响范围、回看演化记录 |\r
| AI 动作 | 识别、切分、标注、结构化、形成知识资产包、输出演化记录 |\r
| 关键状态 | 待上传、识别中、候选中、入库完成、影响已生效 |\r
| 常见失败 | OCR/ASR 失败、入库失败、演化冲突 |\r
| 页面完成后去向 | 返回后台继续查看影响，或切回学习地图页确认地图变化 |\r
| 验收点 | 新资料进入后，评委能看到知识演化记录和地图影响 |\r
\r
### 8.6 系统自治与策略分析后台\r
\r
| 项目 | 页面定义 |\r
| --- | --- |\r
| 页面目标 | 证明平台不是死板规则，而是会观察、会记录、会自我修正 |\r
| 使用角色 | 平台管理者 |\r
| 页面入口 | 后台导航入口 |\r
| 首屏重点 | Agent 状态、策略快照、重规划日志、异常状态 |\r
| 核心模块 | Agent 状态区、策略快照、重规划日志、画像更新日志、异常告警、审计与回滚 |\r
| 用户动作 | 查看 Agent 状态、查看策略变化、回看异常、审计回滚 |\r
| AI 动作 | 记录重规划事件、生成策略快照、输出画像变化与异常说明 |\r
| 关键状态 | 正常运行、策略更新、告警待处理、回滚完成 |\r
| 常见失败 | Agent 失联、策略冲突、日志写入失败 |\r
| 页面完成后去向 | 继续回看后台数据，或回到学习地图页验证前台影响 |\r
| 验收点 | 评委能看到“平台自治”不是口号，而是有日志、有策略、有异常记录 |\r
\r
## 9. 功能需求\r
\r
| 编号 | 能力 | 说明 | 优先级 |\r
| --- | --- | --- | --- |\r
| \`FR-01\` | 选科与开学 | 支持单科或多科选择，并建立学习启动会话 | P0 |\r
| \`FR-02\` | 初始学习地图生成 | 基于学科结构、知识资产和已有画像生成第一版地图 | P0 |\r
| \`FR-03\` | 短诊断校准 | 通过轻量诊断修正学生起点和地图顺序 | P0 |\r
| \`FR-04\` | 实时地图重规划 | 在学习中实时插入补桥、复习、挑战和奖励节点 | P0 |\r
| \`FR-05\` | AI闯关学习会话 | 支持讲解、追问、作答、评分、流式反馈和下一步推进 | P0 |\r
| \`FR-06\` | 学习画像持续更新 | 支持掌握度、薄弱点、错误模式和节奏偏好持续更新 | P0 |\r
| \`FR-07\` | 笔记与思维导图生成 | 在单关、一轮和阶段结束后生成复习资产 | P0 |\r
| \`FR-08\` | 多科并行调度 | 支持多门课并行，生成全局学习排程 | P1 |\r
| \`FR-09\` | 资料注入与自动入库 | 支持上传资料后自动识别、结构化、入库和演化记录 | P0 |\r
| \`FR-10\` | 后台自治分析 | 展示 Agent 协同、策略版本、异常告警和回滚审计 | P1 |\r
| \`FR-11\` | REST + SSE 接口开放 | 支持前后端、Agent 编排与流式交付 | P1 |\r
| \`FR-12\` | 评委演示模式 | 支持准备固定演示链路、演示账号、演示数据和备用回退方案 | P0 |\r
\r
## 10. 非功能需求与协作前置\r
\r
| 编号 | 类别 | 要求 |\r
| --- | --- | --- |\r
| \`NFR-01\` | 可演示性 | 第一屏必须直接进入学生主线，不做营销首页 |\r
| \`NFR-02\` | 一致性 | 作品名、页面名、对象名、引擎名和技术栈保持一致 |\r
| \`NFR-03\` | 单机高可用 | 支持守护进程、健康检查、优雅重启和备份恢复 |\r
| \`NFR-04\` | AI 友好维护 | 前后端职责清晰，结构稳定，便于 AI 连续开发 |\r
| \`NFR-05\` | 可扩学科 | 高数之外可按同一对象契约扩科 |\r
| \`NFR-06\` | 安全接入 | 模型密钥和调用能力后端托管，前端不暴露敏感凭证 |\r
| \`NFR-07\` | 页面可解释性 | 每个核心页面都必须让人看懂“现在在哪、下一步去哪、为什么这样安排” |\r
| \`NFR-08\` | 比赛演示可靠性 | 主演示链路需要有固定账号、固定数据和失败降级方案 |\r
\r
### 10.1 ADP 平台协作前置\r
\r
凡是涉及腾讯 ADP 控制台、工作流配置、浏览器调试、发布检查的需求，统一遵守下面这条协作约束：\r
\r
- 由你先登录腾讯 ADP 控制台并保持会话有效\r
- 我再接手浏览器做配置、联调、核查与取证\r
- 会话失效、验证码、二次确认出现时，任务暂停等待人工恢复登录\r
- 平台账号口令不写入仓库、不写入文档正文、不写入脚本\r
\r
### 10.2 性能需求\r
\r
当前性能口径采用“比赛演示优先”，目标是保证首屏可感知、主链不断、流式讲解稳定、后台治理可回看，不按高并发生产系统来写。\r
\r
| 编号 | 类别 | 要求 |\r
| --- | --- | --- |\r
| \`NFR-09\` | 首屏可见性 | 学生主线首屏 3 秒内必须看到“选科 / 开始学习 / 最近学习入口”，后台核心页 3 秒内必须看到首个关键状态块 |\r
| \`NFR-10\` | 轻量读接口响应 | \`GET /api/startup/subjects\`、\`GET /api/startup/resume\`、\`GET /api/ops/healthz\` 在正常情况下 1 秒内返回 |\r
| \`NFR-11\` | 启动与诊断响应 | \`POST /api/startup/session\` 5 秒内返回学习启动会话和第一版学习地图；\`POST /api/diagnostics/{subjectId}/submit\` 4 秒内返回短诊断结果和重规划结果 |\r
| \`NFR-12\` | 流式学习体验 | \`GET /api/learning/sessions/{sessionId}/stream\` 2 秒内收到首条 SSE 事件；中断时必须有重连提示或降级提示 |\r
| \`NFR-13\` | 即时反馈与异步沉淀 | \`POST /api/learning/sessions/{sessionId}/answers\` 3 秒内返回即时反馈；\`GET /api/learning/sessions/{sessionId}/feedback\` 在 10 秒内能查到 \`ready\` 或明确的 \`failed\` |\r
| \`NFR-14\` | 后台治理可见性 | 上传后 3 秒内能在任务列表看到入库任务；候选列表、发布结果、影响域查询 2 秒内返回 |\r
| \`NFR-15\` | 单机演示并发下限 | 支持 1 条主 SSE 学习会话、1 个后台操作员和 5 个以内只读查看同时存在，主演示链路不能因后台查看而明显卡死 |\r
\r
## 11. 边界与非范围\r
\r
| 项目 | 当前边界 |\r
| --- | --- |\r
| 第一示范学科 | 高等数学 |\r
| 科目策略 | 正式支持多科并行计划，但比赛演示优先高数主线 |\r
| 游戏化强度 | 中强度闯关化，不做重度游戏化皮肤 |\r
| 模型能力 | 强调知识库自更新和策略自优化，不写成自动训练底层模型 |\r
| 部署形态 | 单机服务，不拆微服务 |\r
| 排行机制 | 不把积分榜和排行榜作为核心叙事 |\r
| 平台控制台协作 | 登录前置由人工完成，AI 不接管账号登录动作 |\r
\r
## 12. 成功标准\r
\r
| 指标 | 目标 |\r
| --- | --- |\r
| 启动链路完整性 | 能跑通“选科 -> 开始学习 -> 初始地图 -> 短诊断 -> 第一关” |\r
| 地图实时重规划 | 学习中出现基础缺口时，能自动插入补桥节点并回主线 |\r
| 即时正反馈 | 每次关卡完成都能给出成长反馈和地图推进 |\r
| 画像更新可见性 | 学习过程和学习结束后都能看到画像变化 |\r
| 复习资产完整性 | 能生成思维导图、结构化笔记和复习计划 |\r
| 资料进化能力 | 新资料入库后可看到演化记录和地图受影响 |\r
| 页面可演示性 | 6 个核心页面都有明确目标、入口、状态和验收点 |\r
| 评委理解成本 | 评委 5 到 8 分钟内能看懂平台价值和差异点 |\r
\r
## 13. 推荐演示顺序\r
\r
优先演示这条链：\r
\r
\`选高数 -> 开始学习 -> 初始地图 -> 短诊断 -> 当前关卡 -> 卡点触发补桥 -> 通关反馈 -> 画像更新 -> 生成思维导图 -> 新资料入库后地图变化\`\r
\r
这条演示链的价值在于：\r
\r
- 同时覆盖学生主线、地图实时演化、画像更新和后台自进化\r
- 比“只展示聊天和知识库”更能体现系统性\r
- 更容易让评委理解这不是问答工具，而是一套会组织学习的智能体平台\r
`;export{n as default};
