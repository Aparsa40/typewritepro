import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/lib/store";
import { fontFamilies } from "@shared/schema";

export function SettingsPanel() {
  const { showSettings, toggleSettings, settings, setSettings } = useEditorStore();

  return (
    <Sheet open={showSettings} onOpenChange={toggleSettings}>
      <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto" data-testid="settings-panel">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold">Settings</SheetTitle>
          <SheetDescription>
            Customize your editing experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
              Font Settings
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => setSettings({ fontFamily: value })}
                >
                  <SelectTrigger id="font-family" data-testid="select-font-family">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="font-size">Font Size</Label>
                  <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
                </div>
                <Slider
                  id="font-size"
                  min={10}
                  max={32}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={([value]) => setSettings({ fontSize: value })}
                  data-testid="slider-font-size"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="line-height">Line Height</Label>
                  <span className="text-sm text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
                </div>
                <Slider
                  id="line-height"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => setSettings({ lineHeight: value })}
                  data-testid="slider-line-height"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="tab-size">Tab Size</Label>
                  <span className="text-sm text-muted-foreground">{settings.tabSize} spaces</span>
                </div>
                <Slider
                  id="tab-size"
                  min={2}
                  max={8}
                  step={1}
                  value={[settings.tabSize]}
                  onValueChange={([value]) => setSettings({ tabSize: value })}
                  data-testid="slider-tab-size"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
              Editor Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="word-wrap">Word Wrap</Label>
                  <p className="text-xs text-muted-foreground">
                    Wrap long lines to fit the editor width
                  </p>
                </div>
                <Switch
                  id="word-wrap"
                  checked={settings.wordWrap}
                  onCheckedChange={(checked) => setSettings({ wordWrap: checked })}
                  data-testid="switch-word-wrap"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="line-numbers">Line Numbers</Label>
                  <p className="text-xs text-muted-foreground">
                    Show line numbers in the gutter
                  </p>
                </div>
                <Switch
                  id="line-numbers"
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) => setSettings({ showLineNumbers: checked })}
                  data-testid="switch-line-numbers"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="minimap">Minimap</Label>
                  <p className="text-xs text-muted-foreground">
                    Show document overview on the side
                  </p>
                </div>
                <Switch
                  id="minimap"
                  checked={settings.showMinimap}
                  onCheckedChange={(checked) => setSettings({ showMinimap: checked })}
                  data-testid="switch-minimap"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
              Localization
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-direction">Auto Direction</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically detect RTL/LTR for Farsi and English
                  </p>
                </div>
                <Switch
                  id="auto-direction"
                  checked={settings.autoDirection}
                  onCheckedChange={(checked) => setSettings({ autoDirection: checked })}
                  data-testid="switch-auto-direction"
                />
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
