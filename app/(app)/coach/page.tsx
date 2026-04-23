"use client";

import { Card, TopBar } from "../../_ui/blocks";
import { TouchButton } from "../../_ui/TouchButton";

export default function CoachPage() {
  return (
    <div className="min-h-dvh">
      <TopBar title="Coach" subtitle="Quick answers mid-session." />
      <div className="px-4 pt-4 space-y-4">
        <Card className="p-4">
          <div className="text-[13px] text-white/60">LiftAI</div>
          <div className="mt-2 text-[15px] leading-6">
            Tell me what feels off: knees, hips, low back, or bar path — and I’ll
            adjust cues + load for the next set.
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TouchButton variant="secondary" size="md">
              Knee cave
            </TouchButton>
            <TouchButton variant="secondary" size="md">
              Low back
            </TouchButton>
            <TouchButton variant="secondary" size="md">
              Too heavy
            </TouchButton>
            <TouchButton variant="secondary" size="md">
              Form check
            </TouchButton>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[15px] font-semibold tracking-tight">
            Micro-coaching mode
          </div>
          <div className="mt-2 text-[13px] leading-6 text-white/70">
            Tap an issue and I’ll give a single cue, a single change, and a
            single target for the next rep. Minimal fluff while you’re training.
          </div>
        </Card>
      </div>
    </div>
  );
}

