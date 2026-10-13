export type ProblemRow = {
  n: string;
  title: string;
  body: string;
};

export const problem = {
  eyebrow: "What this usually looks like",
  headline: "Every tool works. Together they don't.",
  lead: "A person is holding two systems together with their hands. Early on that person is the founder, pasting a booking into a spreadsheet at midnight and telling themselves it's fine because there are only four a week. Later it's a team, and the four became forty, and someone still opens the form, copies the name, opens the CRM, pastes it, sends the welcome email, creates the account, assigns the task, and pings the person who needs to know. It works until the day it doesn't, and by then a lead has sat for four days and nobody noticed.",
  rows: [
    {
      n: "01",
      title: "Nothing is set up yet, so you are the system",
      body: "There is no CRM, no follow-up, no place a lead lands. Every enquiry gets answered manually or gets missed, and the ceiling on how many clients you can take is your own inbox.",
    },
    {
      n: "02",
      title: "Nobody owns the automations you have",
      body: "There is a Zap, a Make scenario, a GHL workflow someone built two years ago. When it breaks, the first question is who built this, and the second is whether anyone can touch it safely.",
    },
    {
      n: "03",
      title: "Your data can't answer basic questions",
      body: "It lives in the CRM, three spreadsheets, and a platform nobody logs into. Asking what is happening in the business turns into a two-day project.",
    },
  ] as ProblemRow[],
  callout:
    "The cost isn't dramatic. That's what makes it dangerous. It shows up as slower follow-up, a launch that takes three weeks of coordination every single time, and a technical backlog that gets longer while everyone stays busy.",
} as const;
