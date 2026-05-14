import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Braces,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Filter,
  Lock,
  Network,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

type FeatureCard = {
  icon: React.ElementType;
  title: string;
  body: string;
  tone?: 'primary' | 'ai' | 'light';
  wide?: boolean;
};

const colors = {
  background: '#f8f9ff',
  containerLow: '#eff4ff',
  container: '#e5eeff',
  containerHigh: '#dce9ff',
  surface: '#ffffff',
  text: '#0b1c30',
  muted: '#464555',
  outline: '#c7c4d8',
  primary: '#3525cd',
  primaryContainer: '#4f46e5',
  secondary: '#006591',
  secondaryContainer: '#39b8fd',
  deepIndigo: '#170426',
  aiAccent: '#00D1FF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  slate900: '#0F172A',
};

const featureCards: FeatureCard[] = [
  {
    icon: Users,
    title: 'Automatic Agent Assignment',
    body: 'Load-balanced routing assigns tickets by availability, historical expertise, and live queue pressure.',
    tone: 'light',
    wide: true,
  },
  {
    icon: Shield,
    title: 'Role-based Access',
    body: 'Granular permissions protect admins, agents, users, JWT endpoints, and MongoDB schemas.',
    tone: 'primary',
  },
  {
    icon: Filter,
    title: 'Real-time Filtering',
    body: 'Status, priority, category, and ownership filters keep high-volume queues scannable.',
    tone: 'light',
  },
  {
    icon: Lock,
    title: 'Secure Authentication',
    body: 'Token-based sessions and protected routes keep every operational surface locked down.',
    tone: 'ai',
  },
];

const stackItems = [
  { title: 'TypeScript', subtitle: 'Type-safe architecture', icon: Code2 },
  { title: 'MongoDB', subtitle: 'Mongoose modeling', icon: Database },
  { title: 'Node.js', subtitle: 'Express framework', icon: Braces },
  { title: 'React 18', subtitle: 'Modern frontend', icon: Network },
];

const statusRows = [
  { label: 'Critical', value: '09', color: colors.error },
  { label: 'AI routed', value: '42', color: colors.aiAccent },
  { label: 'Resolved', value: '128', color: colors.success },
];

const Landing: React.FC = () => {
  return (
    <main
      className="min-h-screen overflow-hidden text-[#0b1c30]"
      style={{ backgroundColor: colors.background, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
    >
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#c7c4d8]/70 bg-[#f8f9ff]/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold"
            style={{ color: colors.primary, fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}
            aria-label="SuperOps home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#3525cd] text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            SuperOps
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#464555] md:flex">
            <a className="text-[#3525cd]" href="#platform">Platform</a>
            <a className="transition hover:text-[#0b1c30]" href="#solutions">Solutions</a>
            <a className="transition hover:text-[#0b1c30]" href="#ai">AI features</a>
            <a className="transition hover:text-[#0b1c30]" href="#pricing">Pricing</a>
            <a className="transition hover:text-[#0b1c30]" href="#resources">Resources</a>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link className="hidden text-[#3525cd] transition hover:text-[#170426] sm:block" to="/login">
              Login
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[#3525cd] px-4 py-2 text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#4f46e5]"
              to="/signup"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <section id="platform" className="relative pt-28">
        <div className="absolute inset-x-0 top-16 h-[560px] bg-[linear-gradient(135deg,#eff4ff_0%,#f8f9ff_50%,#dce9ff_100%)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase text-[#004666]">
              <Bot className="h-3.5 w-3.5 text-[#006591]" />
              Groq AI-powered infrastructure
            </div>
            <h1
              className="max-w-3xl text-[40px] font-bold leading-[48px] sm:text-[40px]"
              style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}
            >
              Supercharge Your Support with <span className="text-[#3525cd]">AI-Driven</span> Ticket Management
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-[#464555]">
              A high-density support command center for MSPs, built with TypeScript, React, MongoDB, and AI-assisted categorization that turns operational noise into precise action.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3525cd] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#4f46e5]" to="/signup">
                <Sparkles className="h-4 w-4" />
                Create Free Account
              </Link>
              <a className="inline-flex items-center justify-center rounded-lg border border-[#3525cd] bg-white/60 px-6 py-3 text-sm font-semibold text-[#3525cd] backdrop-blur transition hover:bg-white" href="#resources">
                View Documentation
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[#c7c4d8] bg-white/70 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl">
              <div className="rounded-xl border border-[#00D1FF]/25 bg-[#170426] p-4 text-[#eaf1ff] shadow-[0_0_60px_rgba(0,209,255,0.15)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#89ceff]">Operations Console</p>
                    <p className="text-sm text-[#eaf1ff]/70">Live AI triage and service health</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold">Ticket velocity</span>
                        <span className="rounded-full bg-[#00D1FF]/15 px-2 py-1 text-xs font-semibold text-[#00D1FF]">AI live</span>
                      </div>
                      <div className="flex h-28 items-end gap-1">
                        {[32, 48, 44, 64, 58, 78, 50, 72, 86, 62, 92, 74, 88, 66, 96].map((height) => (
                          <span key={height} className="flex-1 rounded-t bg-[#39b8fd]" style={{ height: `${height}%`, opacity: 0.35 + height / 160 }} />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {statusRows.map((row) => (
                        <div key={row.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <p className="text-xs text-[#eaf1ff]/60">{row.label}</p>
                          <p className="mt-2 text-2xl font-bold" style={{ color: row.color }}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['DB timeout', 'Auth latency', 'Backup drift', 'Patch window'].map((ticket, index) => (
                      <div key={ticket} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold">{ticket}</span>
                          <span className="h-2 w-2 rounded-full bg-[#00D1FF]" />
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-2 rounded-full bg-[#00D1FF]" style={{ width: `${86 - index * 13}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase text-[#777587]">Trusted by industry-leading MSPs</p>
        <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-[#464555]">
          <span>CloudPulse</span>
          <span>DataForge</span>
          <span>NetArmor</span>
          <span>SysStream</span>
        </div>
      </section>

      <section id="ai" className="bg-white px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[32px] font-semibold leading-10" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
              The Groq-Powered AI Edge
            </h2>
            <p className="mt-4 text-base leading-6 text-[#464555]">
              Groq analyzes ticket titles and descriptions in milliseconds, producing structured categorization and priority detection before agents open the queue.
            </p>
          </div>
          <div className="mt-12 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#c7c4d8] bg-[#f8f9ff] p-5">
                <span className="mb-2 inline-flex rounded-full bg-[#0F172A] px-2.5 py-1 text-xs font-semibold uppercase text-white">Raw input</span>
                <p className="text-sm leading-5 text-[#464555]">The production database is unresponsive and we are seeing 500 errors across all dashboards since the 10AM deploy.</p>
              </div>
              <ChevronDown className="mx-auto my-6 h-7 w-7 text-[#3525cd]" />
              <div className="rounded-2xl border border-[#00D1FF]/50 bg-[#00D1FF]/10 p-5 shadow-[0_0_40px_rgba(0,209,255,0.15)] backdrop-blur">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#3525cd] px-2.5 py-1 text-xs font-semibold uppercase text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI assisted
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-semibold text-[#93000a]">Priority: Critical</span>
                  <span className="rounded-full bg-[#e2dfff] px-3 py-1 text-xs font-semibold text-[#3323cc]">Category: Database</span>
                  <span className="rounded-full bg-[#c9e6ff] px-3 py-1 text-xs font-semibold text-[#004c6e]">SLA: 14 min</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border-l-4 border-[#00D1FF] bg-white/70 p-4">
                  <p className="text-sm font-semibold text-[#0b1c30]">Suggested Agent: DB-OnCall-01</p>
                  <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h3 className="text-2xl font-semibold" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
                Seamless Reliability
              </h3>
              <p className="mt-4 leading-6 text-[#464555]">
                The backend sends ticket metadata to Groq for structured JSON output. If AI is unavailable, SuperOps falls back to local keyword heuristics.
              </p>
              <ul className="mt-6 space-y-3 text-sm font-medium text-[#0b1c30]">
                {['Millisecond latency with Groq API', 'Local keyword fallback protection', 'AI output validated as structured JSON'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-[#eff4ff] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[32px] font-semibold leading-10" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
                Engineered for Efficiency
              </h2>
              <p className="mt-2 text-[#464555]">Everything you need to manage enterprise support at scale.</p>
            </div>
            <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#3525cd]" href="#resources">
              View All Features
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              const isPrimary = feature.tone === 'primary';
              const isAi = feature.tone === 'ai';
              return (
                <article
                  key={feature.title}
                  className={[
                    'rounded-2xl border p-7 transition hover:shadow-[0_4px_20px_rgba(15,23,42,0.05)]',
                    isPrimary ? 'border-[#4f46e5] bg-[#3525cd] text-white' : '',
                    isAi ? 'border-[#00D1FF]/50 bg-white/80 shadow-[0_0_40px_rgba(0,209,255,0.15)]' : '',
                    !isPrimary && !isAi ? 'border-[#c7c4d8] bg-white' : '',
                    feature.wide ? 'lg:col-span-2' : '',
                  ].join(' ')}
                >
                  <Icon className={isPrimary ? 'h-7 w-7 text-white' : 'h-7 w-7 text-[#3525cd]'} />
                  <h3 className="mt-8 text-xl font-semibold" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className={isPrimary ? 'mt-3 leading-6 text-[#dad7ff]' : 'mt-3 leading-6 text-[#464555]'}>{feature.body}</p>
                  {feature.wide && (
                    <div className="mt-6 grid min-h-[160px] overflow-hidden rounded-lg border border-[#c7c4d8] bg-[#0F172A] sm:grid-cols-3">
                      <div className="bg-[#39b8fd]/25" />
                      <div className="bg-[#00D1FF]/25" />
                      <div className="bg-[#170426]" />
                    </div>
                  )}
                  {isPrimary && (
                    <div className="mt-24 flex items-center justify-between border-t border-white/25 pt-5 text-xs font-semibold">
                      <span>Security Audit Passed</span>
                      <Shield className="h-4 w-4" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="resources" className="bg-[#170426] px-4 py-16 text-[#eaf1ff] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[32px] font-semibold leading-10" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
              Built for Developers, by Developers
            </h2>
            <p className="mt-5 max-w-xl leading-6 text-[#eaf1ff]/75">
              SuperOps is built on a modern, high-performance stack that keeps deployment simple and operational surfaces easy to reason about.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {stackItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <Icon className="mb-3 h-5 w-5 text-[#00D1FF]" />
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-[#eaf1ff]/55">{item.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-[#00D1FF]/25 bg-[#0F172A] p-5 font-mono text-sm shadow-[0_0_60px_rgba(0,209,255,0.15)]">
            <div className="mb-4 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
            </div>
            <pre className="overflow-x-auto text-xs leading-6 text-[#eaf1ff]/80 sm:text-sm">
{`// Groq integration handler
const categorizeTicket = async (title, desc) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [...],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    return localKeywordFallback(title, desc);
  }
};`}
            </pre>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#3525cd] px-4 py-14 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="text-[32px] font-semibold leading-10" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>
            Ready to automate your helpdesk?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-6 text-[#dad7ff]">
            Join MSP teams transforming support operations with SuperOps AI. Get started in minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#3525cd] transition hover:bg-[#e2dfff]" to="/signup">
              <Zap className="h-4 w-4" />
              Create Free Account
            </Link>
            <Link className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20" to="/login">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#213145] px-4 py-10 text-[#eaf1ff] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Geist, Inter, ui-sans-serif, system-ui, sans-serif' }}>SuperOps</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#eaf1ff]/65">
              Built for high-performance MSPs. The intelligence layer for modern IT infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#eaf1ff]/75">
            <a href="#pricing">Privacy Policy</a>
            <a href="#pricing">Terms of Service</a>
            <a href="#solutions">Security</a>
            <a href="#platform">Status</a>
            <a href="#resources">Contact Support</a>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-[1440px] text-sm text-[#eaf1ff]/45">Copyright 2026 SuperOps AI. Built for high-performance MSPs.</p>
      </footer>
    </main>
  );
};

export default Landing;
