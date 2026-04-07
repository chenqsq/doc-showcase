import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activeDocsInOrder } from '@/catalog';
import { HOME_SECONDARY_LINKS, getRowMeta } from '@/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HomeRoute() {
  const shouldReduceMotion = useReducedMotion();
  const firstDoc = activeDocsInOrder[0];

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-24 md:px-6">
      <motion.section
        className="layout-panel-padding relative overflow-hidden rounded-[2.4rem] border border-border/70 bg-card/80 shadow-[var(--shadow-panel)] backdrop-blur-2xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-32 opacity-70"
          style={{ background: 'radial-gradient(circle at top, hsl(var(--glow-primary) / 0.26), transparent 70%)' }}
        />
        <div className="relative grid max-w-[42rem] gap-5 md:gap-6">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Badge>开发文档入口</Badge>
          </motion.div>

          <motion.div
            className="grid gap-3"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <h1 className="max-w-[12ch] font-serif text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.04] tracking-[-0.02em] text-foreground">
              AI 自主引导学习平台开发文档
            </h1>
            <p className="max-w-[34rem] text-base leading-8 text-muted-foreground md:text-[1.02rem]">
              首页只负责说明入口：先进入开发文档，再按顺序阅读；调试资料和归档按需查看。
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3 pt-1"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            {firstDoc ? (
              <Button asChild size="lg">
                <Link to={`/read/${firstDoc.id}`}>
                  从开发总览开始
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
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <Badge variant="outline" className="bg-background/70">
              10 篇开发文档
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              调试资料按需进入
            </Badge>
            <Badge variant="outline" className="bg-background/70">
              主题可切换并记忆
            </Badge>
          </motion.div>
        </div>
      </motion.section>

      <section className="layout-panel-gap grid">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit bg-background/70">
            推荐阅读顺序
          </Badge>
          <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] leading-none text-foreground">开发文档</h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            先读基础入口，再进入学习闭环、系统架构、平台集成和测试验证。
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/76 shadow-[var(--shadow-panel)] backdrop-blur-xl">
          <ol className="divide-y divide-border/70">
            {activeDocsInOrder.map((item, index) => (
              <motion.li key={item.id} whileHover={shouldReduceMotion ? undefined : { x: 6 }}>
                <Link
                  className="grid gap-3 px-5 py-5 transition-colors hover:bg-accent/60 md:grid-cols-[72px,minmax(0,1fr),auto] md:items-center md:px-7"
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
            调试知识库和归档不参与默认阅读顺序，只在联调、验证或回看历史资料时使用。
          </p>
        </div>

        <div className="grid gap-4">
          {HOME_SECONDARY_LINKS.map((entry) => {
            const Icon = entry.icon;

            return (
              <motion.div key={entry.id} whileHover={shouldReduceMotion ? undefined : { x: 6 }}>
                <Link
                  className="grid gap-4 rounded-[1.8rem] border border-border/70 bg-card/72 px-5 py-5 shadow-[var(--shadow-soft)] transition-colors hover:bg-card/92 md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center"
                  to={entry.to}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
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
