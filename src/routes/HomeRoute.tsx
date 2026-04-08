import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activeDocsInOrder } from '@/catalog';
import { HOME_SECONDARY_LINKS, getRowMeta, useMediaQuery } from '@/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HomeRoute() {
  const shouldReduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const firstDoc = activeDocsInOrder[0];
  const enableMotion = isDesktop && !shouldReduceMotion;

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-20 md:px-6 md:pb-24">
      <motion.section
        className="layout-panel-padding relative rounded-[var(--surface-hero-radius)] border border-border/60 bg-background/86 shadow-[var(--shadow-soft)] md:overflow-hidden md:border-border/70 md:bg-card/80 md:shadow-[var(--shadow-panel)] md:backdrop-blur-2xl"
        initial={enableMotion ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 hidden h-32 opacity-70 md:block"
          style={{ background: 'radial-gradient(circle at top, hsl(var(--glow-primary) / 0.26), transparent 70%)' }}
        />
        <div className="relative grid max-w-[42rem] gap-4 md:gap-6">
          <motion.div
            initial={enableMotion ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Badge className="bg-background/90 md:bg-background/70">作品文档入口</Badge>
          </motion.div>

          <motion.div
            className="grid gap-3"
            initial={enableMotion ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <h1 className="max-w-[16ch] font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.08] text-foreground">
              AI主导学习生命周期的自进化自学智能体平台
            </h1>
            <p className="max-w-[34rem] text-base leading-8 text-muted-foreground md:text-[1.02rem]">
              从这里进入正式比赛交付包，按顺序查看学生主线、实时演化学习地图、闯关学习、画像笔记、知识进化后台和技术真源。
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3 pt-1"
            initial={enableMotion ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
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
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-2 pt-1"
            initial={enableMotion ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <Badge variant="outline" className="bg-background/70">
              12 篇作品文档
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              四个学生页 + 两个后台页
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              实时演化学习地图
            </Badge>
          </motion.div>
        </div>
      </motion.section>

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
            {activeDocsInOrder.map((item, index) => (
              <motion.li key={item.id} whileHover={enableMotion ? { x: 6 } : undefined}>
                <Link
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-accent/60 active:bg-accent/70 md:grid-cols-[72px,minmax(0,1fr),auto] md:items-center md:px-7 md:py-5"
                  to={`/read/${item.id}`}
                >
                  <span className="font-serif text-2xl text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <span className="grid gap-1">
                    <strong className="text-lg text-foreground">{item.title}</strong>
                    <span className="text-sm leading-7 text-muted-foreground">
                      {item.summary ?? '进入正文查看完整设计。'}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">{getRowMeta(item)}</span>
                </Link>
              </motion.li>
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
            调试知识库和技术真源不参与默认阅读顺序，只在联调、追溯实现或补充证明时使用。
          </p>
        </div>

        <div className="grid gap-4">
          {HOME_SECONDARY_LINKS.map((entry) => {
            const Icon = entry.icon;

            return (
              <motion.div key={entry.id} whileHover={enableMotion ? { x: 6 } : undefined}>
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
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
