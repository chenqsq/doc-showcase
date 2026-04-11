import { ArrowRight, FileCheck2, LayoutPanelTop, LibraryBig, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activeDocItems, getActiveDocRowMeta } from '@/active-docs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HOME_SECONDARY_LINKS } from '@/shell-core';

function getDocByOrder(order: number) {
  return activeDocItems.find((item) => item.order === order);
}

export default function HomeRoute() {
  const overviewDoc = getDocByOrder(0);
  const prdDoc = getDocByOrder(1);
  const pageDoc = getDocByOrder(3);
  const archDoc = getDocByOrder(4);
  const testDoc = getDocByOrder(7);
  const manualDoc = getDocByOrder(10);

  const quickEntries = [
    {
      id: 'overview',
      title: '先看作品总览',
      description: '5 分钟看懂这是什么作品、演示主线是什么、当前做到哪一步。',
      icon: MonitorPlay,
      to: overviewDoc ? `/read/${overviewDoc.id}` : '/docs'
    },
    {
      id: 'pages',
      title: '看页面设计',
      description: '直接看学生端和后台端分别有哪些页面、每页要展示什么。',
      icon: LayoutPanelTop,
      to: pageDoc ? `/read/${pageDoc.id}` : '/docs'
    },
    {
      id: 'architecture',
      title: '看技术方案',
      description: '快速确认前端、FastAPI、PostgreSQL、ADP 各自负责什么。',
      icon: LibraryBig,
      to: archDoc ? `/read/${archDoc.id}` : '/docs'
    },
    {
      id: 'evaluation',
      title: '看评测方式',
      description: '想知道怎么演示、怎么验收、怎么给评委看，就从这里进。',
      icon: FileCheck2,
      to: manualDoc ? `/read/${manualDoc.id}` : testDoc ? `/read/${testDoc.id}` : '/docs'
    }
  ];

  const roleEntries = [
    {
      id: 'judge',
      role: '评委 / 老师',
      hint: '想快速判断作品值不值得看',
      to: prdDoc ? `/read/${prdDoc.id}` : '/docs'
    },
    {
      id: 'speaker',
      role: '答辩主讲人',
      hint: '想组织答辩主线和演示顺序',
      to: overviewDoc ? `/read/${overviewDoc.id}` : '/docs'
    },
    {
      id: 'developer',
      role: '新接手开发者',
      hint: '想知道页面、接口和后续实现怎么接',
      to: archDoc ? `/read/${archDoc.id}` : '/docs'
    },
    {
      id: 'tester',
      role: '测试 / 演示辅助',
      hint: '想看最小验收链路和演示准备',
      to: testDoc ? `/read/${testDoc.id}` : '/docs'
    }
  ];

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-20 md:px-6 md:pb-24">
      <section className="layout-panel-padding relative rounded-[var(--surface-hero-radius)] border border-border/60 bg-background/86 shadow-[var(--shadow-soft)] md:overflow-hidden md:border-border/70 md:bg-card/80 md:shadow-[var(--shadow-panel)] md:backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 hidden h-32 opacity-70 md:block"
          style={{ background: 'radial-gradient(circle at top, hsl(var(--glow-primary) / 0.26), transparent 70%)' }}
        />
        <div className="relative grid max-w-[46rem] gap-4 md:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-background/90 md:bg-background/70">比赛作品首页</Badge>
            <Badge variant="outline" className="bg-background/70">
              教育智能体应用创新赛
            </Badge>
          </div>

          <div className="grid gap-3">
            <h1 className="max-w-[18ch] font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.08] text-foreground">
              AI主导学习生命周期的自进化自学智能体平台
            </h1>
            <p className="max-w-[40rem] text-base leading-8 text-muted-foreground md:text-[1.02rem]">
              这不是单纯的聊天机器人，而是一套让学生从选科、诊断、闯关、补桥、复习到知识更新都能被 AI 持续接管的学习系统。
            </p>
            <p className="max-w-[36rem] text-sm leading-7 text-muted-foreground md:text-base">
              如果你只想快速看懂作品，先看总览；如果你想直接看页面、技术方案或评测方式，下面已经给你分好入口。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild size="lg">
              <Link to={overviewDoc ? `/read/${overviewDoc.id}` : '/docs'}>
                进入作品总览
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/docs">查看全部文档</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            快速入口
          </Badge>
          <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] leading-none text-foreground">先看你最关心的部分</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            首页不再先塞满“怎么读文档”。你只需要选一个入口，先把作品看明白。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quickEntries.map((entry) => {
            const Icon = entry.icon;

            return (
              <Link
                key={entry.id}
                to={entry.to}
                className="grid gap-3 rounded-[var(--surface-card-radius)] border border-border/60 bg-background/88 px-5 py-5 transition-colors hover:bg-background md:border-border/70 md:bg-card/76 md:shadow-[var(--shadow-soft)] md:hover:bg-card/92"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--surface-control-radius)] bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="grid gap-1">
                  <strong className="text-lg text-foreground">{entry.title}</strong>
                  <span className="text-sm leading-7 text-muted-foreground">{entry.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            按角色看
          </Badge>
          <h2 className="font-serif text-[clamp(1.9rem,2.8vw,2.8rem)] leading-none text-foreground">不同人先看不同入口</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {roleEntries.map((entry) => (
            <Link
              key={entry.id}
              to={entry.to}
              className="grid gap-2 rounded-[1.4rem] border border-border/60 bg-background/88 px-4 py-4 transition-colors hover:bg-background md:border-border/70 md:bg-card/72 md:shadow-[var(--shadow-soft)]"
            >
              <strong className="text-base text-foreground">{entry.role}</strong>
              <span className="text-sm leading-7 text-muted-foreground">{entry.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            全部作品文档
          </Badge>
          <h2 className="font-serif text-[clamp(1.9rem,2.8vw,2.8rem)] leading-none text-foreground">完整阅读顺序</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            真要从头到尾读，再按这条顺序走。这里保留完整入口，但不再把它顶成首页主视图。
          </p>
        </div>

        <div className="overflow-hidden rounded-[var(--surface-panel-radius)] border border-border/60 bg-background/88 md:border-border/70 md:bg-card/76 md:shadow-[var(--shadow-panel)] md:backdrop-blur-xl">
          <ol className="divide-y divide-border/70">
            {activeDocItems.map((item, index) => (
              <li key={item.id} className="transition-transform duration-150 md:hover:translate-x-1.5">
                <Link
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-accent/60 active:bg-accent/70 md:grid-cols-[72px,minmax(0,1fr),auto] md:items-center md:px-7 md:py-5"
                  to={`/read/${item.id}`}
                >
                  <span className="font-serif text-2xl text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <span className="grid gap-1">
                    <strong className="text-lg text-foreground">{item.title}</strong>
                    <span className="text-sm leading-7 text-muted-foreground">{item.summary}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">{getActiveDocRowMeta(item.order)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            辅助入口
          </Badge>
          <h2 className="font-serif text-[clamp(1.8rem,2.6vw,2.5rem)] leading-none text-foreground">按需进入</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            这些不是默认主线。只有联调、追源码或补充证明时再进去。
          </p>
        </div>

        <div className="grid gap-4">
          {HOME_SECONDARY_LINKS.map((entry) => {
            const Icon = entry.icon;

            return (
              <div key={entry.id} className="transition-transform duration-150 md:hover:translate-x-1.5">
                <Link
                  className="grid gap-4 rounded-[var(--surface-card-radius)] border border-border/60 bg-background/88 px-4 py-4 transition-colors hover:bg-background md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center md:border-border/70 md:bg-card/72 md:px-5 md:py-5 md:shadow-[var(--shadow-soft)] md:hover:bg-card/92"
                  to={entry.to}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--surface-control-radius)] bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="grid gap-1">
                    <strong className="text-lg text-foreground">{entry.title}</strong>
                    <span className="text-sm leading-7 text-muted-foreground">{entry.description}</span>
                  </span>
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
