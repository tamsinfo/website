/**
 * The seven-step delivery process shown on Home ("How we work") and About ("Our
 * process"). Copy is identical in desktop/home.jsx and desktop/about.jsx.
 */

export interface ProcessStep {
  readonly title: string;
  readonly detail: string;
}

export const PROCESS_INTRO =
  "Seven steps, the same every time, so you always know which one you are in.";

export const PROCESS_STEPS: readonly ProcessStep[] = [
  { title: "Discovery and understanding", detail: "Your challenges, goals and expectations" },
  { title: "Strategic planning", detail: "Roadmap, approach, timelines and milestones" },
  { title: "Tailored solution design", detail: "Built around your needs, no templates" },
  { title: "Agile execution", detail: "Iterative, transparent, regular updates" },
  { title: "Quality assurance", detail: "Rigorous testing and validation" },
  { title: "Deployment and implementation", detail: "Smooth rollout with documentation" },
  { title: "Continuous support", detail: "Ongoing optimisation and enhancement" },
];
