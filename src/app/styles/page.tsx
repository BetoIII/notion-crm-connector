"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, FileText, Phone, Folder, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StylesPage() {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Redirect to home if not in development
    if (!isDevelopment) {
      router.push('/');
    }
  }, [isDevelopment, router]);

  // Don't render anything if not in development
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="min-h-screen texture-shag grain-overlay">
      {/* Header */}
      <div className="texture-wood border-b-4 border-wood-dark p-6 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-cream text-embossed">
              80s RETRO OFFICE DESIGN SYSTEM
            </h1>
            <p className="text-cream/80 font-body text-sm mt-1">
              Component Library & Style Guide
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-8 space-y-8">

        {/* Color Palette */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">COLOR PALETTE</h2>

          <div className="space-y-6">
            {/* Wood Tones */}
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Wood Tones</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(25, 35%, 25%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">wood-dark</div>
                    <div className="text-smoke text-xs">Dark walnut</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(28, 42%, 48%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">wood-medium</div>
                    <div className="text-smoke text-xs">Medium oak</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(35, 55%, 68%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">wood-light</div>
                    <div className="text-smoke text-xs">Light wood</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amber */}
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Amber (CRT Glow)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal glow-amber"
                    style={{ backgroundColor: 'hsl(38, 92%, 58%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">amber-glow</div>
                    <div className="text-smoke text-xs">Bright amber</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(38, 72%, 45%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">amber-dim</div>
                    <div className="text-smoke text-xs">Dimmed amber</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Neutrals */}
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Neutrals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(42, 28%, 88%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">cream</div>
                    <div className="text-smoke text-xs">Aged paper</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(36, 38%, 72%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">tan</div>
                    <div className="text-smoke text-xs">Shag carpet</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2"
                    style={{ backgroundColor: 'hsl(0, 0%, 18%)', borderColor: 'hsl(28, 42%, 48%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">charcoal</div>
                    <div className="text-smoke text-xs">Dark text</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(30, 8%, 25%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">smoke</div>
                    <div className="text-smoke text-xs">Muted text</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accents */}
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Accents</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(18, 78%, 52%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">burnt-orange</div>
                    <div className="text-smoke text-xs">Phone buttons</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-20 rounded border-2 border-charcoal"
                    style={{ backgroundColor: 'hsl(82, 28%, 45%)' }}
                  ></div>
                  <div className="font-body text-sm">
                    <div className="font-bold">olive</div>
                    <div className="text-smoke text-xs">Vintage green</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">TYPOGRAPHY</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Headings (Courier Prime)</h3>
              <div className="space-y-2">
                <h1 className="text-4xl font-heading text-charcoal">Heading 1 - The Quick Brown Fox</h1>
                <h2 className="text-3xl font-heading text-charcoal">Heading 2 - The Quick Brown Fox</h2>
                <h3 className="text-2xl font-heading text-charcoal">Heading 3 - The Quick Brown Fox</h3>
                <h4 className="text-xl font-heading text-charcoal">Heading 4 - The Quick Brown Fox</h4>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Body Text (IBM Plex Mono)</h3>
              <div className="space-y-2">
                <p className="text-base font-body text-charcoal">
                  Base text: The quick brown fox jumps over the lazy dog. 0123456789
                </p>
                <p className="text-sm font-body text-charcoal">
                  Small text: The quick brown fox jumps over the lazy dog. 0123456789
                </p>
                <p className="text-xs font-body text-charcoal">
                  Extra small text: The quick brown fox jumps over the lazy dog. 0123456789
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Text Effects</h3>
              <div className="space-y-3">
                <p className="text-xl text-charcoal text-embossed">Embossed Text Effect</p>
                <p className="text-xl font-bold font-body uppercase tracking-wide text-charcoal">
                  UPPERCASE TRACKING
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Textures */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">TEXTURES & EFFECTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-32 texture-wood rounded border-2 border-charcoal p-4 flex items-center justify-center">
                <span className="text-cream font-bold font-body">texture-wood</span>
              </div>
              <p className="text-sm font-body text-smoke">Wood grain with vertical lines</p>
            </div>

            <div className="space-y-2">
              <div className="h-32 texture-shag rounded border-2 border-charcoal p-4 flex items-center justify-center">
                <span className="text-charcoal font-bold font-body">texture-shag</span>
              </div>
              <p className="text-sm font-body text-smoke">Shag carpet dot pattern</p>
            </div>

            <div className="space-y-2">
              <div className="h-32 texture-paper rounded border-2 border-charcoal p-4 flex items-center justify-center">
                <span className="text-charcoal font-bold font-body">texture-paper</span>
              </div>
              <p className="text-sm font-body text-smoke">Paper with noise overlay</p>
            </div>

            <div className="space-y-2">
              <div className="h-32 effect-scanlines bg-charcoal rounded border-2 border-wood-light p-4 flex items-center justify-center">
                <span className="text-amber-glow font-bold font-body">effect-scanlines</span>
              </div>
              <p className="text-sm font-body text-smoke">CRT scanline overlay</p>
            </div>

            <div className="space-y-2">
              <div className="h-32 glow-amber bg-amber-glow rounded border-2 border-charcoal p-4 flex items-center justify-center">
                <span className="text-wood-dark font-bold font-body">glow-amber</span>
              </div>
              <p className="text-sm font-body text-smoke">Amber glow box shadow</p>
            </div>

            <div className="space-y-2">
              <div className="h-32 texture-paper card-paper rounded p-4 flex items-center justify-center">
                <span className="text-charcoal font-bold font-body">card-paper</span>
              </div>
              <p className="text-sm font-body text-smoke">Paper card with shadow + border</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">BUTTONS</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default (Amber Glow)</Button>
                <Button variant="secondary">Secondary (Wood)</Button>
                <Button variant="outline">Outline (Burnt Orange)</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">FORM ELEMENTS</h2>

          <div className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label>Input Field (Index Card Style)</Label>
              <Input placeholder="Enter text here..." />
            </div>

            <div className="space-y-2">
              <Label>Textarea (Paper Texture)</Label>
              <Textarea placeholder="Enter longer text here..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Select Dropdown</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                  <SelectItem value="option4">Option 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Checkboxes (Vintage Style)</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="check1" defaultChecked />
                <label htmlFor="check1" className="text-sm font-body text-charcoal cursor-pointer">
                  Checked checkbox
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="check2" />
                <label htmlFor="check2" className="text-sm font-body text-charcoal cursor-pointer">
                  Unchecked checkbox
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="check3" disabled />
                <label htmlFor="check3" className="text-sm font-body text-charcoal opacity-50 cursor-not-allowed">
                  Disabled checkbox
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">BADGES (STICKY NOTE STYLE)</h2>

          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default (Amber)</Badge>
            <Badge variant="secondary">Secondary (Tan)</Badge>
            <Badge variant="success">Success (Olive)</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        {/* Tabs */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">TABS (FILE FOLDER STYLE)</h2>

          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">
                <Folder className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="tab2">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="tab3">
                <Phone className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tab1" className="texture-paper border-2 border-wood-light border-t-0 rounded-b p-4">
              <p className="font-body text-charcoal">
                This is the Documents tab content. Notice the file folder appearance with the
                rounded top corners and the paper texture background.
              </p>
            </TabsContent>

            <TabsContent value="tab2" className="texture-paper border-2 border-wood-light border-t-0 rounded-b p-4">
              <p className="font-body text-charcoal">
                This is the Templates tab content with the same file folder styling.
              </p>
            </TabsContent>

            <TabsContent value="tab3" className="texture-paper border-2 border-wood-light border-t-0 rounded-b p-4">
              <p className="font-body text-charcoal">
                This is the Messages tab content. Each tab maintains consistent styling.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Cards */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">CARDS (PAPER TEXTURE)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description with body font</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-charcoal">
                  This is a card with paper texture background, wood borders, and subtle shadow.
                  Perfect for displaying content in the retro office aesthetic.
                </p>
              </CardContent>
            </Card>

            <Card className="rotate-slight-right">
              <CardHeader>
                <CardTitle>Rotated Card</CardTitle>
                <CardDescription>With slight rotation effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-charcoal">
                  This card has a slight rotation applied for a "laid on desk" feel.
                  Use sparingly for visual interest.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dialog */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">DIALOG (MODAL)</h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>DIALOG TITLE</DialogTitle>
                <DialogDescription>
                  This is a dialog with paper texture, wood borders, and the retro office styling.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Example Input</Label>
                  <Input placeholder="Type something..." />
                </div>
                <p className="font-body text-sm text-smoke">
                  Dialogs use the same paper texture and styling as other components for consistency.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Icons & Status */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">ICONS & STATUS INDICATORS</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Icon Sizes</h3>
              <div className="flex flex-wrap items-center gap-6">
                <CheckCircle2 className="h-4 w-4 text-olive" />
                <CheckCircle2 className="h-6 w-6 text-olive" />
                <CheckCircle2 className="h-8 w-8 text-olive" />
                <CheckCircle2 className="h-12 w-12 text-olive" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-body text-charcoal mb-3 uppercase tracking-wide">Status Messages</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded border-2 border-olive bg-olive/20">
                  <CheckCircle2 className="h-5 w-5 text-olive flex-shrink-0" />
                  <p className="font-body text-sm text-charcoal">Success message with olive green styling</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded border-2 border-amber-glow bg-amber-glow/20">
                  <AlertCircle className="h-5 w-5 text-amber-dim flex-shrink-0" />
                  <p className="font-body text-sm text-charcoal">Warning message with amber styling</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded border-2 border-destructive bg-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="font-body text-sm text-charcoal">Error message with destructive styling</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">ANIMATIONS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal">Amber Glow Pulse</h3>
              <div
                className="flex items-center justify-center h-32 rounded animate-pulse-glow"
                style={{ backgroundColor: 'hsl(38, 92%, 58%)' }}
              >
                <span className="font-bold font-body" style={{ color: 'hsl(25, 35%, 25%)' }}>
                  animate-pulse-glow
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal">Rotate Dial (Loading)</h3>
              <div
                className="flex items-center justify-center h-32 border-2 rounded"
                style={{ backgroundColor: 'hsl(42, 28%, 88%)', borderColor: 'hsl(35, 55%, 68%)' }}
              >
                <div
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-rotate-dial"
                  style={{ borderColor: 'hsl(38, 92%, 58%)', borderTopColor: 'transparent' }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal">Hover Lift Effect</h3>
              <Button className="w-full">Hover Over Me</Button>
              <p className="text-xs font-body text-smoke">Buttons lift on hover with shadow increase</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal">Card Rotation</h3>
              <Card className="rotate-slight-left hover:rotate-0 transition-transform duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <p className="font-body text-sm">Hover to straighten</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Layout Patterns */}
        <section className="texture-paper card-paper p-6 rounded">
          <h2 className="text-2xl font-bold font-heading text-charcoal mb-4">LAYOUT PATTERNS</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal mb-2">
                Wood Panel Banner
              </h3>
              <div className="texture-wood border-4 border-wood-dark p-4 rounded">
                <h4 className="font-heading text-xl text-cream text-embossed">SECTION HEADER</h4>
                <p className="font-body text-sm text-cream/80 mt-1">
                  Use for page headers and important section dividers
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal mb-2">
                Office Nameplate
              </h3>
              <div className="inline-block texture-wood border-2 border-wood-dark px-5 py-2.5 shadow-lg">
                <span className="text-xs font-bold font-body uppercase tracking-wider text-cream">
                  LABEL TEXT
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal mb-2">
                Index Card Stack
              </h3>
              <div className="relative h-32 w-64">
                <div className="absolute inset-0 texture-paper card-paper rotate-slight-right"></div>
                <div className="absolute inset-0 texture-paper card-paper rotate-slight-left transform translate-y-2"></div>
                <div className="absolute inset-0 texture-paper card-paper flex items-center justify-center transform translate-y-4">
                  <span className="font-body text-sm text-charcoal">Top Card</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold font-body uppercase tracking-wide text-charcoal mb-2">
                CRT Display Effect
              </h3>
              <div className="bg-charcoal p-4 rounded border-2 border-wood-medium effect-scanlines">
                <p className="text-amber-glow font-body text-sm font-mono">
                  &gt; SYSTEM READY_
                  <br />
                  &gt; AWAITING INPUT...
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="texture-wood border-2 border-wood-dark p-6 rounded text-center">
          <p className="font-heading text-cream text-lg mb-2">
            80s RETRO OFFICE DESIGN SYSTEM
          </p>
          <p className="font-body text-cream/80 text-sm">
            All components maintain the nostalgic office aesthetic while preserving modern functionality
          </p>
        </div>

      </div>
    </div>
  );
}
