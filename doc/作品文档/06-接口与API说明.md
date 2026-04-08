# 知脉课堂接口与 API 说明

> 文档层级：作品接口文档  
> 文档目的：说明对外公开接口、上下文字段、流式事件和对象结构  
> 核心结论：作品统一采用 `REST + SSE` 混合接口，前端不直连 ADP，统一由后端代理并沉淀业务对象

## 1. 接口设计原则

- 写接口先围绕业务对象，而不是平台字段
- 流式回复统一走 `SSE`
- `AppKey` 只允许后端托管
- `visitor_biz_id`、`custom_variables` 保持稳定透传

## 2. 基础约定

| 项目 | 说明 |
| --- | --- |
| 基础路径 | `/api/v1` |
| 返回格式 | JSON |
| 流式协议 | `text/event-stream` |
| 认证方式 | 后端会话 / 管理端 Token / 评委访问凭证 |
| 时间格式 | ISO 8601 |

## 3. 公共上下文字段

| 字段 | 说明 |
| --- | --- |
| `visitor_biz_id` | 终端用户唯一标识 |
| `role` | `student` / `teacher` / `admin` |
| `course_id` | 当前课程标识 |
| `class_id` | 当前班级标识 |
| `chapter_id` | 当前章节标识 |
| `custom_variables` | 课程、班级、来源等扩展上下文 |

## 4. 公共对象摘要

| 对象 | 关键字段 |
| --- | --- |
| `课堂素材包` | `materialPackId`、`courseId`、`chapterId`、`assets[]`、`parseStatus` |
| `知识重构结果` | `reconstructionId`、`highlights[]`、`difficulties[]`、`conceptMap` |
| `学习会话` | `sessionId`、`visitorBizId`、`currentTask`、`sessionStatus` |
| `任务卡` | `taskCardId`、`goal`、`successCriteria`、`fallbackRule` |
| `掌握度快照` | `snapshotId`、`masteryLevel`、`riskLevel`、`nextAction` |
| `错题画像` | `wrongQuestionId`、`causeTags[]`、`variantTasks[]`、`reviewStatus` |
| `教师洞察摘要` | `insightId`、`classRisk`、`topMistakes[]`、`interventions[]` |
| `访问凭证` | `credentialId`、`role`、`expiresAt`、`accessScope` |

## 5. 七组核心能力接口

### 5.1 素材上传 / 解析

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/materials/upload` | `POST` | 上传音频、文档、图片 |
| `/materials/{id}` | `GET` | 查询素材包详情 |
| `/materials/{id}/parse` | `POST` | 触发或重试解析 |

核心响应：

```json
{
  "materialPackId": "mp_20260408_001",
  "parseStatus": "processing",
  "acceptedAssets": 4
}
```

### 5.2 知识重构查询

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/reconstructions/{materialPackId}` | `GET` | 查询知识重构结果 |
| `/reconstructions/{materialPackId}/summary` | `GET` | 获取课堂摘要 |

### 5.3 学习会话创建

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/sessions` | `POST` | 创建或续接学习会话 |
| `/sessions/{sessionId}` | `GET` | 查询会话状态与当前任务 |

示例请求：

```json
{
  "visitor_biz_id": "stu-demo-001",
  "role": "student",
  "course_id": "math-advanced",
  "chapter_id": "m02"
}
```

### 5.4 流式伴学对话

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/sessions/{sessionId}/stream` | `POST` + `SSE` | 流式返回讲解、提示、下一步动作 |

SSE 事件类型建议：

- `message`
- `hint`
- `exercise`
- `mastery`
- `done`
- `error`

### 5.5 作答提交与评分

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/sessions/{sessionId}/answers` | `POST` | 提交作答内容 |
| `/sessions/{sessionId}/mastery` | `GET` | 查询掌握度快照 |

### 5.6 教师洞察查询

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/teacher/insights` | `GET` | 查询班级洞察概览 |
| `/teacher/insights/{insightId}` | `GET` | 查询某次洞察详情 |

### 5.7 管理配置与访问校验

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/admin/courses` | `GET/POST` | 课程配置管理 |
| `/admin/credentials` | `GET/POST` | 访问凭证管理 |
| `/admin/access/check` | `POST` | 访问合法性校验 |

## 6. 错误码建议

| 错误码 | 含义 |
| --- | --- |
| `40001` | 参数缺失 |
| `40002` | 文件格式不支持 |
| `40101` | 访问凭证无效 |
| `40301` | 角色无权限 |
| `40401` | 资源不存在 |
| `40901` | 会话状态冲突 |
| `50201` | ADP 服务异常 |
| `50301` | 流式服务不可用 |

## 7. 与腾讯 ADP 的映射

| 业务字段 | ADP 映射 |
| --- | --- |
| `visitor_biz_id` | `VisitorId` |
| `AppKey` | `bot_app_key` |
| `custom_variables` | 自定义上下文变量 |
| `sessionId` | `ConversationId` |

## 8. 接口验收重点

- 能跑通“上传 -> 重构 -> 会话 -> 流式讲解 -> 作答 -> 洞察”
- SSE 事件能被前端稳定消费
- 业务对象能写回数据库
- 访问凭证与角色限制有效

## 下一篇建议阅读

1. [07-测试验证与预期效果.md](./07-测试验证与预期效果.md)
2. [10-访问与评测手册.md](./10-访问与评测手册.md)
3. [11-开发技术文档.md](./11-开发技术文档.md)
