export type EngineeringCard = {
  n: string;
  title: string;
  body: string;
  stack: string[];
};

export type PipelineStep = {
  n: string;
  title: string;
  body: string;
  tool: string;
  /** The final two steps light up mint; the first two stay neutral. */
  lit: "none" | "soft" | "strong";
};

export const engineering = {
  eyebrow: "Engineering",
  headline: "Sometimes the tool you need doesn't exist.",
  lead: 'You\'ve looked. There\'s a platform that does two thirds of it, an integration that covers another piece, and a gap in the middle nobody sells a product for. "We looked at every tool and none of them do this." At that point connecting software stops being the answer, and someone has to write the thing.',
  claim: "We build applications end to end and we keep running them afterwards.",
  cards: [
    {
      n: "01",
      title: "Application",
      body: "React and Next.js on the front. Node.js, Python and Laravel behind it. Authentication, roles, dashboards, admin, and the APIs the rest of your stack talks to.",
      stack: ["React", "Next.js", "Node.js", "Python", "Laravel"],
    },
    {
      n: "02",
      title: "Data",
      body: "Schema designed before anything is written, migrations tracked, backups configured, and a restore that has been tested rather than assumed.",
      stack: ["PostgreSQL", "MySQL", "Supabase", "Neon"],
    },
    {
      n: "03",
      title: "Infrastructure",
      body: "AWS, including EC2 and S3, Cloudflare for DNS, CDN and protection, and Docker so the thing that runs in production is the thing that was tested.",
      stack: ["AWS", "EC2", "S3", "Cloudflare", "Docker"],
    },
    {
      n: "04",
      title: "Delivery",
      body: "A staging environment that matches production, so a deploy is a decision rather than an event.",
      stack: ["GitHub", "Bitbucket", "Jenkins", "GitHub Actions"],
    },
  ] as EngineeringCard[],
  pipeline: {
    label: "The pipeline, every time",
    status: "Green build",
    steps: [
      {
        n: "01",
        title: "Commit",
        body: "Every change reviewed and versioned, nothing edited live on a server.",
        tool: "GitHub / Bitbucket",
        lit: "none",
      },
      {
        n: "02",
        title: "Build",
        body: "The pipeline runs, dependencies install, the image is built the same way every time.",
        tool: "Actions / Jenkins",
        lit: "none",
      },
      {
        n: "03",
        title: "Staging",
        body: "A copy that matches production, where the thing gets tested before anyone sees it.",
        tool: "Docker",
        lit: "soft",
      },
      {
        n: "04",
        title: "Production",
        body: "Released on your infrastructure, monitored, with a rollback that has been tested.",
        tool: "AWS / Cloudflare",
        lit: "strong",
      },
    ] as PipelineStep[],
    footnote:
      "A staging environment that matches production, so a deploy is a decision rather than an event.",
  },
  run: {
    title: "And then we run it",
    body: "Most builds end at handover. A repo gets transferred, an invoice gets paid, and six months later a dependency breaks and nobody remembers how the deploy works. The fourth stage of how we work applies here the same way it applies to an automation. We monitor it, patch it, keep the dependencies current, and add to it when the business needs more.",
  },
  boundary: {
    label: "Where we stop",
    body: "Sysora builds tools, internal applications and the systems around them. We are not the right team for a multi-year enterprise platform that needs its own product organisation, and we will say so on the first call rather than three months in. We also do not take on a build we are not willing to maintain.",
  },
} as const;
