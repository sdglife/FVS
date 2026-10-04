"use client";

import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { DeckSize } from "@/lib/types";
import {
  startRespondent,
  recordSwipe,
  completeRespondent,
  type StartRespondentResult,
} from "./actions";

type KeywordGroup = [string, { slug: string; label: string }[]];
type Step = "register" | "keywords" | "deckSize" | "swipe" | "recap";

const MAX_KEYWORDS = 3;

export function Wizard({
  token,
  keywordGroups,
  deckSizes,
}: {
  token: string;
  keywordGroups: KeywordGroup[];
  deckSizes: DeckSize[];
}) {
  const [step, setStep] = useState<Step>("register");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Collected across steps; respondent row is only created once all of it
  // is known (end of the deckSize step) — see PRD §4.2.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [chosenKeywords, setChosenKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState("");

  const [respondent, setRespondent] = useState<StartRespondentResult | null>(null);
  const [cursor, setCursor] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const totalSlotsUsed = chosenKeywords.length + (customKeyword.trim() ? 1 : 0);

  function toggleKeyword(slug: string) {
    setChosenKeywords((prev) => {
      if (prev.includes(slug)) return prev.filter((k) => k !== slug);
      if (prev.length + (customKeyword.trim() ? 1 : 0) >= MAX_KEYWORDS) return prev;
      return [...prev, slug];
    });
  }

  async function pickDeckSize(deckSize: DeckSize) {
    setPending(true);
    setError(null);
    try {
      const result = await startRespondent({
        token,
        name,
        email: email || undefined,
        phone: phone || undefined,
        brandName,
        chosenKeywords,
        customKeywordText: customKeyword || undefined,
        deckSize,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.deck.length === 0) {
        setError(
          "No matching reference images yet for those keywords — try different ones."
        );
        return;
      }
      setRespondent(result);
      setStep("swipe");
    } finally {
      setPending(false);
    }
  }

  async function swipe(direction: "like" | "pass") {
    if (!respondent) return;
    const image = respondent.deck[cursor];
    if (direction === "like") {
      setLikedIds((prev) => new Set(prev).add(image.id));
    }
    recordSwipe(respondent.respondentId, image.id, direction).catch((err) =>
      console.error("recordSwipe failed", err)
    );

    const next = cursor + 1;
    if (next >= respondent.deck.length) {
      setPending(true);
      try {
        await completeRespondent(respondent.respondentId);
      } finally {
        setPending(false);
        setStep("recap");
      }
    } else {
      setCursor(next);
    }
  }

  if (step === "register") {
    return (
      <StepShell title="Let's get started">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return setError("Name is required.");
            if (!email.trim() && !phone.trim())
              return setError("Enter an email or phone number.");
            setError(null);
            setStep("keywords");
          }}
          className="flex flex-col gap-3"
        >
          <Field label="Your name">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone (if no email)">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Brand name">
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} required className={inputClass} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <PrimaryButton type="submit">Next</PrimaryButton>
        </form>
      </StepShell>
    );
  }

  if (step === "keywords") {
    return (
      <StepShell title="Pick 3 words for your vibe">
        <p className="text-sm text-zinc-500">
          {totalSlotsUsed}/{MAX_KEYWORDS} selected
        </p>
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
          {keywordGroups.map(([group, keywords]) => (
            <div key={group}>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{group}</p>
              <div className="flex flex-wrap gap-2 py-1">
                {keywords.map((kw) => {
                  const active = chosenKeywords.includes(kw.slug);
                  const disabled = !active && totalSlotsUsed >= MAX_KEYWORDS;
                  return (
                    <button
                      key={kw.slug}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleKeyword(kw.slug)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        active
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-zinc-300 dark:border-zinc-700"
                      } ${disabled ? "opacity-30" : ""}`}
                    >
                      {kw.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Field label="Not seeing it? Type your own">
          <input
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            disabled={totalSlotsUsed >= MAX_KEYWORDS && !customKeyword}
            className={inputClass}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PrimaryButton
          type="button"
          onClick={() => {
            if (totalSlotsUsed === 0) return setError("Pick at least one keyword.");
            setError(null);
            setStep("deckSize");
          }}
        >
          Next
        </PrimaryButton>
      </StepShell>
    );
  }

  if (step === "deckSize") {
    return (
      <StepShell title="How many cards?">
        <div className="flex flex-wrap gap-2">
          {deckSizes.map((size) => (
            <button
              key={size}
              type="button"
              disabled={pending}
              onClick={() => pickDeckSize(size)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              {size}
            </button>
          ))}
        </div>
        {pending && <p className="text-sm text-zinc-500">Building your deck…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </StepShell>
    );
  }

  if (step === "swipe" && respondent) {
    const image = respondent.deck[cursor];
    return (
      <div className="flex flex-1 flex-col items-center gap-4 px-4 py-6">
        <p className="text-sm text-zinc-500">
          {cursor + 1} / {respondent.deck.length}
        </p>
        <SwipeCard key={image.id} imageUrl={image.image_url} onSwipe={swipe} />
        <div className="flex gap-6">
          <RoundButton onClick={() => swipe("pass")} label="✕" />
          <RoundButton onClick={() => swipe("like")} label="✓" />
        </div>
      </div>
    );
  }

  // recap
  const likedCount = likedIds.size;
  return (
    <StepShell title="Thanks!">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You liked {likedCount} image{likedCount === 1 ? "" : "s"}. We&apos;ll take it from here.
      </p>
    </StepShell>
  );
}

function SwipeCard({
  imageUrl,
  onSwipe,
}: {
  imageUrl: string;
  onSwipe: (direction: "like" | "pass") => void;
}) {
  const [exiting, setExiting] = useState<"like" | "pass" | null>(null);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExiting("like");
      onSwipe("like");
    } else if (info.offset.x < -threshold) {
      setExiting("pass");
      onSwipe("pass");
    }
  }

  return (
    <motion.div
      drag={exiting ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        exiting
          ? { x: exiting === "like" ? 400 : -400, opacity: 0, rotate: exiting === "like" ? 15 : -15 }
          : { x: 0, opacity: 1, rotate: 0 }
      }
      transition={{ duration: 0.25 }}
      className="aspect-[3/4] w-full max-w-sm cursor-grab touch-none overflow-hidden rounded-2xl bg-zinc-100 shadow-lg active:cursor-grabbing dark:bg-zinc-900"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external/hotlinked sources, see PRD §5 */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.div>
  );
}

function RoundButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-300 text-xl dark:border-zinc-700"
      aria-label={label === "✓" ? "Like" : "Pass"}
    >
      {label}
    </button>
  );
}

function StepShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-lg font-semibold">{title}</h1>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
    />
  );
}

const inputClass =
  "rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
