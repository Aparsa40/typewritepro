import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";

const steps = [
  {
    key: "editor",
    selector: '[data-testid="monaco-editor-container"]',
    title: "ادیتور متن",
    description: "در این قسمت می‌تایپ کنید. TypeWriterPro به‌صورت اتوماتیک جهت متن فارسی را راست‌چین و متن انگلیسی را چپ‌چین می‌کند — بدون نیاز به تنظیمات!",
  },
  {
    key: "preview",
    selector: '[data-testid="markdown-preview-container"]',
    title: "پیش‌نمایش",
    description: "متن شما به‌صورت زنده در اینجا نمایش داده می‌شود. می‌توانید Markdown، فارسی، انگلیسی و حتی کد را با هم مرزش کنید.",
  },
  {
    key: "file",
    selector: '[data-testid="menu-file"]',
    title: "منوی فایل",
    description: "برای ایجاد، باز کردن یا صادر کردن فایل‌ها از این منو استفاده کنید.",
  },
  {
    key: "edit",
    selector: '[data-testid="menu-edit"]',
    title: "منوی ویرایش",
    description: "عملیات بازگشت، جستجو و ذخیره انتخاب‌ها در اینجا قرار دارد.",
  },
  {
    key: "view",
    selector: '[data-testid="menu-view"]',
    title: "منوی نمایش",
    description: "تنظیم پنل‌ها و حالت پیش‌نمایش (split، preview-only یا editor-only) را انجام دهید.",
  },
  {
    key: "tools",
    selector: '[data-testid="menu-tools"]',
    title: "منوی ابزارها و ورک‌اسپیس",
    description: "ابزارهای Markdown، ورک‌اسپیس‌ها و صفحات کاربری خودتان را در اینجا مدیریت کنید.",
  },
  {
    key: "settings",
    selector: '[data-testid="button-settings"]',
    title: "تنظیمات صفحه‌ی پیش‌فرض",
    description: "تنظیمات رنگ، فونت و طراحی صفحه‌ی اصلی را تغییر دهید. برای صفحات ورک‌اسپیس‌های خود، تنظیمات جداگانه‌ای داریم!",
  },
  {
    key: "rtl-ltr",
    selector: '[data-testid="status-bar"]',
    title: "✨ ویژگی خاص: تشخیص خودکار RTL/LTR",
    description: "TypeWriterPro یکی از تنها ادیتورهایی است که جهت متن را اتوماتیک تشخیص می‌دهد — حتی بدون Markdown! فارسی → راست‌چین، انگلیسی → چپ‌چین.",
  },
];

export function IntroTour() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const { theme } = useEditorStore();

  useEffect(() => {
    try {
      const seen = localStorage.getItem("typewriterpro-intro-seen");
      if (!seen) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const step = steps[index];
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ left: r.left, top: r.top, width: r.width, height: r.height });
    } else {
      setPos(null);
    }
  }, [visible, index, theme]);

  const close = (persist = true) => {
    setVisible(false);
    try {
      if (persist) localStorage.setItem("typewriterpro-intro-seen", "1");
    } catch {}
  };

  if (!visible) return null;

  const step = steps[index];

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Render overlay as four panels around the highlighted element so the element itself stays fully visible */}
      {pos ? (
        <>
          <div
            className="absolute bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => close(true)}
            style={{ left: 0, top: 0, width: '100%', height: Math.max(0, pos.top) }}
          />
          <div
            className="absolute bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => close(true)}
            style={{ left: 0, top: pos.top, width: Math.max(0, pos.left), height: Math.max(0, pos.height) }}
          />
          <div
            className="absolute bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => close(true)}
            style={{ left: Math.min(window.innerWidth, pos.left + pos.width), top: pos.top, width: Math.max(0, window.innerWidth - (pos.left + pos.width)), height: Math.max(0, pos.height) }}
          />
          <div
            className="absolute bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => close(true)}
            style={{ left: 0, top: Math.min(window.innerHeight, pos.top + pos.height), width: '100%', height: Math.max(0, window.innerHeight - (pos.top + pos.height)) }}
          />

          <div
            className="absolute rounded ring ring-offset-2 ring-primary pointer-events-none"
            style={{ left: pos.left - 6, top: pos.top - 6, width: pos.width + 12, height: pos.height + 12 }}
          />
        </>
      ) : (
        // If no target element is found, cover full screen with a simple overlay
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => close(true)} />
      )}

      <div
        className="absolute z-80 pointer-events-auto max-w-sm p-4 bg-card text-card-foreground rounded shadow-lg"
        style={{
          left: pos ? Math.min(pos.left + pos.width + 12, window.innerWidth - 320) : 40,
          top: pos ? Math.max(16, pos.top) : 80,
        }}
      >
        <h3 className="font-semibold mb-2">{step.title}</h3>
        <p className="text-sm mb-4">{step.description}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => close(true)}>رد کردن</Button>
          {index < steps.length - 1 ? (
            <Button size="sm" onClick={() => setIndex((i) => i + 1)}>بعدی</Button>
          ) : (
            <Button size="sm" onClick={() => close(true)}>تمام</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => close(false)}>نمایش بعدی هنگام ورود</Button>
        </div>
      </div>
    </div>
  );
}

export default IntroTour;
