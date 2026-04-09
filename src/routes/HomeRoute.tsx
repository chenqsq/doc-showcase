import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activeDocItems, getActiveDocRowMeta } from '@/active-docs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HOME_SECONDARY_LINKS } from '@/shell-core';

export default function HomeRoute() {
  const firstDoc = activeDocItems[0];

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-20 md:px-6 md:pb-24">
      <section className="layout-panel-padding relative rounded-[var(--surface-hero-radius)] border border-border/60 bg-background/86 shadow-[var(--shadow-soft)] md:overflow-hidden md:border-border/70 md:bg-card/80 md:shadow-[var(--shadow-panel)] md:backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 hidden h-32 opacity-70 md:block"
          style={{ background: 'radial-gradient(circle at top, hsl(var(--glow-primary) / 0.26), transparent 70%)' }}
        />
        <div className="relative grid max-w-[42rem] gap-4 md:gap-6">
          <div>
            <Badge className="bg-background/90 md:bg-background/70">唯一正式主线</Badge>
          </div>

          <div className="grid gap-3">
            <h1 className="max-w-[16ch] font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.08] text-foreground">
              AI主导学习生命周期的自进化自学智能体平台
            </h1>
            <p className="max-w-[34rem] text-base leading-8 text-muted-foreground md:text-[1.02rem]">
              从这里进入唯一正式作品主线，按顺序查看学生主线、实时演化学习地图、闯关学习、画像笔记与知识进化后台；技术溯源和工程参考只在需要时进入。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {firstDoc ? (
              <Button asChild size="lg">
                <Link to={`/read/${firstDoc.id}`}>
                  从作品总览开始
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="lg">
              <Link to="/docs">查看文档列表</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="bg-background/70">
              12 篇作品文档
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              四个学生页 + 两个后台页
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              实时演化学习地图
            </Badge>
          </div>
        </div>
      </section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            推荐阅读顺序
          </Badge>
          <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] leading-none text-foreground">作品文档</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            先读作品总览和 PRD，再进入学习地图、页面、架构、算法、接口与比赛交付文档。
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
          <h2 className="font-serif text-[clamp(1.9rem,2.8vw,2.8rem)] leading-none text-foreground">按需进入</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            调试知识库和技术参考不参与默认阅读顺序，只在联调、追溯实现或补充证明时使用。
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
