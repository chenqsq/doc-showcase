const n=`# 比赛版 API 文档\r
\r
这份文档只保留比赛版真正需要的主链接口，写法以中文为主，英文只保留在路径、对象名和字段名里。\r
\r
## 1. 接口总览\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["前端页面"] --> B["FastAPI 后端"]\r
    B --> C["PostgreSQL 真状态"]\r
    B --> D["腾讯 ADP"]\r
    B --> E["COS / MinIO"]\r
\`\`\`\r
\r
| 方向 | 负责什么 | 不做什么 |\r
| --- | --- | --- |\r
| 前端 -> 后端 | 页面动作、状态读取、流式展示 | 不直接调用 ADP |\r
| 后端 -> 数据库 | 保存学习主链、画像、知识治理、审计真状态 | 不保存大文件正文 |\r
| 后端 -> ADP | 调用讲解、诊断、抽取、策略相关智能体 | 不把业务真状态留在 ADP |\r
| 后端 -> 对象存储 | 上传原始资料、导图、导出资源 | 不负责结构化查询 |\r
\r
## 2. 通用约定\r
\r
| 项目 | 约定 |\r
| --- | --- |\r
| 基础协议 | \`HTTPS + JSON\` |\r
| 流式协议 | 前端收 \`SSE\`，后端对 ADP 用 \`HTTP SSE V2\` |\r
| 时间格式 | \`ISO-8601\` |\r
| 跟踪编号 | \`X-Trace-Id\` |\r
| 幂等键 | \`Idempotency-Key\` |\r
\r
### 2.1 成功响应\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "traceId": "trace_20260414_001",\r
  "data": {},\r
  "message": "ok"\r
}\r
\`\`\`\r
\r
### 2.2 失败响应\r
\r
\`\`\`json\r
{\r
  "success": false,\r
  "traceId": "trace_20260414_001",\r
  "error": {\r
    "code": "LEARNING_STREAM_TIMEOUT",\r
    "message": "流式讲解超时，已切换到稳定结果",\r
    "recoverable": true,\r
    "suggestion": "可以继续当前节点，也可以稍后重试"\r
  }\r
}\r
\`\`\`\r
\r
### 2.3 错误码分组\r
\r
| 前缀 | 含义 | 示例 |\r
| --- | --- | --- |\r
| \`STARTUP_\` | 启动会话相关错误 | \`STARTUP_SUBJECT_NOT_FOUND\` |\r
| \`MAP_\` | 地图生成与重规划错误 | \`MAP_REROUTE_FAILED\` |\r
| \`LEARNING_\` | 闯关学习错误 | \`LEARNING_STREAM_TIMEOUT\` |\r
| \`PROFILE_\` | 画像沉淀错误 | \`PROFILE_GENERATION_FAILED\` |\r
| \`NOTE_\` | 笔记与导图错误 | \`NOTE_GENERATION_PENDING\` |\r
| \`KNOWLEDGE_\` | 知识治理错误 | \`KNOWLEDGE_CONFLICT_BLOCKED\` |\r
| \`OPS_\` | 运维与审计错误 | \`OPS_HEALTHCHECK_FAILED\` |\r
\r
## 3. 核心对象口径\r
\r
| 中文名 | 对象名 | 用途 |\r
| --- | --- | --- |\r
| 学习启动会话 | \`LearningSession\` | 记录一次正式学习链路的开始 |\r
| 学习地图 | \`LearningMap\` | 记录当前主线、支线、阶段和推荐路径 |\r
| 地图节点 | \`MapNode\` | 记录地图中的具体学习节点 |\r
| 短诊断结果 | \`DiagnosticResult\` | 记录短诊断判断和起点校准 |\r
| 重规划事件 | \`RerouteEvent\` | 记录补桥、回主线、降难等路线调整 |\r
| 学习任务 | \`LearningTask\` | 记录某个节点下的具体闯关任务 |\r
| 闯关作答记录 | \`CheckpointAttempt\` | 记录学生一次作答和评分结果 |\r
| 成长反馈事件 | \`FeedbackEvent\` | 记录一次即时反馈和推进结果 |\r
| 学习画像快照 | \`LearnerProfileSnapshot\` | 记录当前掌握度、薄弱点和风险信号 |\r
| 笔记资产包 | \`NoteBundle\` | 记录结构化笔记、导图和复习计划 |\r
| 资料入库任务 | \`IngestionTask\` | 记录一份资料的入库处理状态 |\r
| 知识补丁 | \`KnowledgePatch\` | 记录抽取出的结构化知识声明 |\r
| 候选知识 | \`KnowledgeCandidate\` | 记录等待审核的候选知识 |\r
| 校验报告 | \`ValidationReport\` | 记录可信度判断和门禁结论 |\r
| 知识发布 | \`KnowledgeRelease\` | 记录正式发布结果和影响范围 |\r
| 知识回滚 | \`KnowledgeRollback\` | 记录回滚原因、目标版本和影响范围 |\r
| 策略快照 | \`StrategySnapshot\` | 记录发布或重规划后的策略状态 |\r
\r
## 4. 关键状态口径\r
\r
### 4.1 学习任务会话状态\r
\r
| 状态 | 中文含义 |\r
| --- | --- |\r
| \`pending\` | 待开始 |\r
| \`streaming\` | 正在流式讲解 |\r
| \`waiting_answer\` | 等待学生作答 |\r
| \`evaluating\` | 正在评分 |\r
| \`completed\` | 已完成 |\r
| \`aborted\` | 已中止 |\r
\r
### 4.2 沉淀状态\r
\r
| 状态 | 中文含义 |\r
| --- | --- |\r
| \`pending\` | 已触发，后台处理中 |\r
| \`ready\` | 画像和笔记已生成 |\r
| \`failed\` | 沉淀失败，需要重试 |\r
\r
### 4.3 知识入库状态\r
\r
| 状态 | 中文含义 |\r
| --- | --- |\r
| \`uploaded\` | 已上传 |\r
| \`parsing\` | 解析中 |\r
| \`extracted\` | 已抽取知识声明 |\r
| \`validating\` | 校验中 |\r
| \`candidate\` | 进入候选区 |\r
| \`released\` | 已发布 |\r
| \`archived\` | 已归档 |\r
| \`failed\` | 失败 |\r
\r
## 5. 学习启动与地图接口\r
\r
### 5.1 \`GET /api/startup/subjects\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询当前可选科目 |\r
| 关键返回 | 科目列表、推荐科目、推荐理由 |\r
\r
响应示例：\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "data": {\r
    "subjects": [\r
      {\r
        "subjectId": "math",\r
        "subjectName": "高等数学",\r
        "recommended": true,\r
        "reason": "比赛版默认演示主科目"\r
      }\r
    ]\r
  }\r
}\r
\`\`\`\r
\r
### 5.2 \`GET /api/startup/resume\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询最近学习入口 |\r
| 关键返回 | 最近会话、最近地图、当前节点、推荐下一步 |\r
\r
### 5.3 \`POST /api/startup/session\`\r
\r
这条接口一体完成“创建学习启动会话 + 返回第一版学习地图”，不再要求前端额外调用单独的初始地图接口。\r
\r
请求示例：\r
\r
\`\`\`json\r
{\r
  "studentId": "demo_student_001",\r
  "selectedSubjects": ["math"],\r
  "priorityMode": "single_subject"\r
}\r
\`\`\`\r
\r
响应示例：\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "data": {\r
    "selection": {\r
      "selectionId": "selection_001",\r
      "studentId": "demo_student_001",\r
      "subjects": ["math"],\r
      "priorityMode": "single_subject"\r
    },\r
    "session": {\r
      "sessionId": "learn_sess_001",\r
      "activeSubjectId": "math",\r
      "status": "started"\r
    },\r
    "learningMap": {\r
      "mapId": "map_math_001",\r
      "subjectId": "math",\r
      "currentNodeId": "node_pre_bridge_001",\r
      "recommendedNextNodeId": "node_limit_diag_001",\r
      "explain": "先补函数图像直觉，再进入极限短诊断",\r
      "stages": []\r
    }\r
  }\r
}\r
\`\`\`\r
\r
## 6. 诊断与地图重规划接口\r
\r
### 6.1 \`POST /api/diagnostics/{subjectId}/submit\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 提交短诊断答案并触发地图校准 |\r
| 关键返回 | \`DiagnosticResult\`、\`RerouteEvent\`、更新后的 \`LearningMap\` |\r
\r
请求示例：\r
\r
\`\`\`json\r
{\r
  "sessionId": "learn_sess_001",\r
  "answers": [\r
    {\r
      "questionId": "diag_limit_001",\r
      "answer": "函数值和极限值总是一样"\r
    }\r
  ]\r
}\r
\`\`\`\r
\r
响应示例：\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "data": {\r
    "diagnosticResult": {\r
      "diagnosticId": "diag_001",\r
      "score": 58,\r
      "decision": "insert_bridge",\r
      "weakFoundations": ["函数图像直觉"]\r
    },\r
    "rerouteEvent": {\r
      "eventId": "reroute_001",\r
      "triggerType": "weak_foundation",\r
      "studentMessage": "先补函数图像直觉，再回到极限"\r
    },\r
    "learningMap": {\r
      "mapId": "map_math_001",\r
      "currentNodeId": "node_bridge_graph_001",\r
      "recommendedNextNodeId": "node_bridge_graph_001"\r
    }\r
  }\r
}\r
\`\`\`\r
\r
## 7. 闯关学习与异步沉淀接口\r
\r
### 7.1 \`GET /api/learning/tasks/{taskId}\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询当前闯关任务详情 |\r
| 关键返回 | \`LearningTask\`、目标、通过条件、难度 |\r
\r
### 7.2 \`POST /api/learning/sessions\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 创建学习任务会话 |\r
| 关键返回 | \`taskSessionId\`、当前状态、关联任务编号 |\r
\r
### 7.3 \`GET /api/learning/sessions/{sessionId}/stream\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 由后端代理 ADP，向前端输出 SSE |\r
| 事件类型 | \`tutor_delta\`、\`checkpoint_prompt\`、\`feedback_summary\`、\`reroute_event\`、\`done\` |\r
\r
事件示例：\r
\r
\`\`\`text\r
event: tutor_delta\r
data: {"text":"先看函数图像的变化趋势"}\r
\`\`\`\r
\r
### 7.4 \`POST /api/learning/sessions/{sessionId}/answers\`\r
\r
这条接口只保证返回即时反馈，不同步返回完整画像、笔记和导图。\r
\r
请求示例：\r
\r
\`\`\`json\r
{\r
  "taskId": "task_limit_001",\r
  "answerText": "我觉得极限就是函数值",\r
  "answerPayload": {\r
    "stepByStep": []\r
  }\r
}\r
\`\`\`\r
\r
响应示例：\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "data": {\r
    "attempt": {\r
      "attemptId": "attempt_001",\r
      "score": 62,\r
      "passed": false,\r
      "errorPattern": "混淆函数值与极限值"\r
    },\r
    "feedbackEvent": {\r
      "feedbackId": "feedback_001",\r
      "passed": false,\r
      "summaryText": "方向对了一半，但关键概念仍混淆"\r
    },\r
    "nextAction": {\r
      "actionType": "insert_bridge",\r
      "targetNodeId": "node_bridge_graph_001"\r
    },\r
    "settlementStatus": {\r
      "profile": "pending",\r
      "notes": "pending"\r
    }\r
  }\r
}\r
\`\`\`\r
\r
### 7.5 \`GET /api/learning/sessions/{sessionId}/feedback\`\r
\r
这条接口是会话沉淀查询接口，用来读取异步生成的画像和笔记结果。\r
\r
响应示例：\r
\r
\`\`\`json\r
{\r
  "success": true,\r
  "data": {\r
    "settlementStatus": "ready",\r
    "profileSnapshot": {\r
      "profileId": "profile_001",\r
      "frustrationRisk": 0.42,\r
      "weakFoundations": ["函数图像直觉"]\r
    },\r
    "noteBundle": {\r
      "notePackId": "note_pack_001",\r
      "structuredNotes": [],\r
      "reviewPlan": []\r
    },\r
    "assets": [\r
      {\r
        "assetId": "asset_mindmap_001",\r
        "assetType": "mind_map"\r
      }\r
    ]\r
  }\r
}\r
\`\`\`\r
\r
## 8. 资料入库与知识治理接口\r
\r
### 8.1 \`POST /api/ingestion/upload\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 上传资料并创建资料入库任务 |\r
| 关键返回 | \`IngestionTask\`、当前状态、资料来源编号 |\r
\r
### 8.2 \`GET /api/ingestion/tasks\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询入库任务列表和进度 |\r
| 关键返回 | 任务状态、进度、错误信息、资料标题 |\r
\r
### 8.3 \`GET /api/knowledge/candidates\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询候选知识和待审核列表 |\r
| 关键返回 | 候选知识、可信度、冲突摘要、校验结论 |\r
\r
### 8.4 \`POST /api/knowledge/releases\`\r
\r
当前比赛版用这条接口统一承接“发布”与“回滚”两类动作。\r
\r
请求示例：\r
\r
\`\`\`json\r
{\r
  "action": "release",\r
  "candidateId": "candidate_001",\r
  "operatorId": "admin_demo"\r
}\r
\`\`\`\r
\r
回滚请求示例：\r
\r
\`\`\`json\r
{\r
  "action": "rollback",\r
  "releaseId": "release_001",\r
  "reason": "发现知识声明和教材口径冲突",\r
  "operatorId": "admin_demo"\r
}\r
\`\`\`\r
\r
返回重点：\r
\r
- 发布时返回 \`KnowledgeRelease\`\r
- 回滚时返回 \`KnowledgeRollback\`\r
- 两种动作都会返回 \`StrategySnapshot\`\r
- 如影响学习主链，还会返回受影响会话的新地图版本摘要\r
\r
### 8.5 \`GET /api/knowledge/releases/{releaseId}\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询发布结果、影响域和地图版本变化 |\r
| 关键返回 | 发布结果、回滚信息、策略快照、受影响地图版本 |\r
\r
## 9. 系统自治接口\r
\r
### 9.1 \`GET /api/ops/healthz\`\r
\r
| 项目 | 内容 |\r
| --- | --- |\r
| 用途 | 查询系统健康状态 |\r
| 关键返回 | API 状态、数据库状态、ADP 状态、对象存储状态 |\r
\r
## 10. 前端页面到接口映射\r
\r
| 页面 | 读取接口 | 写入接口 |\r
| --- | --- | --- |\r
| 选科与开学页 | \`GET /api/startup/subjects\`、\`GET /api/startup/resume\` | \`POST /api/startup/session\` |\r
| AI学习地图页 | 当前地图来自启动返回或会话恢复 | \`POST /api/diagnostics/{subjectId}/submit\` |\r
| AI闯关学习页 | \`GET /api/learning/tasks/{taskId}\`、\`GET /api/learning/sessions/{sessionId}/stream\` | \`POST /api/learning/sessions\`、\`POST /api/learning/sessions/{sessionId}/answers\` |\r
| 笔记复习与成长页 | \`GET /api/learning/sessions/{sessionId}/feedback\` | 无 |\r
| 资料注入后台 | \`GET /api/ingestion/tasks\`、\`GET /api/knowledge/candidates\`、\`GET /api/knowledge/releases/{releaseId}\` | \`POST /api/ingestion/upload\`、\`POST /api/knowledge/releases\` |\r
| 系统自治后台 | \`GET /api/ops/healthz\` | 无 |\r
\r
## 11. 验收口径\r
\r
- 启动后一次拿到学习启动会话和第一版学习地图。\r
- 短诊断后能看到短诊断结果、重规划事件和地图变化。\r
- 作答后先拿到即时反馈，画像和笔记通过查询接口异步可见。\r
- 知识发布后能看到影响域、新地图版本和必要时的回滚结果。\r
\r
## 12. 接口性能约定\r
\r
当前性能口径采用“比赛演示优先”，这里写的是用户可感知的接口表现，不是高并发生产指标。\r
\r
| 接口 | 性能约定 | 说明 |\r
| --- | --- | --- |\r
| \`GET /api/startup/subjects\` | 正常情况下 1 秒内返回 | 只返回可选科目和推荐理由，不做复杂聚合 |\r
| \`GET /api/startup/resume\` | 正常情况下 1 秒内返回 | 只返回最近学习入口和必要状态 |\r
| \`POST /api/startup/session\` | 5 秒内返回 | 必须一次返回学习启动会话和第一版学习地图 |\r
| \`POST /api/diagnostics/{subjectId}/submit\` | 4 秒内返回 | 必须返回短诊断结果、重规划事件和更新后的地图 |\r
| \`GET /api/learning/sessions/{sessionId}/stream\` | 2 秒内收到首条 SSE 事件 | 这里的目标是首条事件时间，不是整段教学完成时间 |\r
| \`POST /api/learning/sessions/{sessionId}/answers\` | 3 秒内返回即时反馈 | 返回的是即时反馈，不等于完整沉淀已完成 |\r
| \`GET /api/learning/sessions/{sessionId}/feedback\` | 10 秒内查到 \`ready\` 或明确的 \`failed\` | 这条接口负责查询异步沉淀结果 |\r
| \`GET /api/ingestion/tasks\` | 2 秒内返回 | 上传后 3 秒内应能在任务列表看到新任务 |\r
| \`GET /api/ops/healthz\` | 正常情况下 1 秒内返回 | 用于启动前检查和日常巡检 |\r
`;export{n as default};
