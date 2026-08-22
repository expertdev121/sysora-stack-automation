export const process = {
  eyebrow: "How we work",
  headline: "Four stages. In that order, every time.",
  rail: {
    from: "A dozen disconnected tools",
    to: "One system that runs",
  },
  stages: [
    { number: "01", title: "Map", caption: "What exists today" },
    { number: "02", title: "Design", caption: "What it should do" },
    { number: "03", title: "Build", caption: "Shipped with guardrails" },
    { number: "04", title: "Run", caption: "Kept alive as you grow" },
  ],
  details: [
    {
      number: "01",
      title: "Map",
      body: "We look at how your business runs today. The tools, the handoffs, the places where a person is holding two systems together. This is where most of the real problems surface, and they're rarely the ones you called about.",
    },
    {
      number: "02",
      title: "Design",
      body: "We decide what the system should do before we build anything. Where AI adds value, where automation is enough, and where a simpler process beats both.",
    },
    {
      number: "03",
      title: "Build",
      body: "We build it, with error handling, monitoring, and documentation, because a clever automation that breaks every week is not a system.",
    },
    {
      number: "04",
      title: "Run",
      body: "If you want us to stay, we maintain it, improve it, and keep it working while your business changes around it.",
    },
  ],
} as const;
