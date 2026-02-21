import React, { useState } from 'react';
import { C, F, typography } from '../tokens';
import { Button } from '../components/subpool/Button';
import { InputField } from '../components/subpool/InputField';
import { StatusPill } from '../components/subpool/StatusPill';
import { Avatar } from '../components/subpool/Avatar';
import { StatCard } from '../components/subpool/StatCard';
import { PoolCard } from '../components/subpool/PoolCard';
import { TrustBadge } from '../components/subpool/TrustBadge';
import { VerifiedBadge } from '../components/subpool/VerifiedBadge';
import { NotificationItem } from '../components/subpool/NotificationItem';
import { ToastNotification } from '../components/subpool/ToastNotification';
import { EmptyState } from '../components/subpool/EmptyState';
import { OverflowMenu } from '../components/subpool/OverflowMenu';
import { SlotFillBar } from '../components/subpool/SlotFillBar';
import { ProAnalytics } from '../components/subpool/ProAnalytics';
import { ProPaywallModal } from '../components/subpool/ProPaywallModal';
import { ReportModal } from '../components/subpool/ReportModal';
import { ReviewModal } from '../components/subpool/ReviewModal';
import { VerificationModal } from '../components/subpool/VerificationModal';

// Import shadcn/ui components
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Toggle } from '../components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

export function DesignSystem() {
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [progressValue, setProgressValue] = useState(65);
  const [sliderValue, setSliderValue] = useState([50]);
  const [radioValue, setRadioValue] = useState('option1');
  const [showProModal, setShowProModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Sample data for components
  const sampleNotification = {
    id: '1',
    title: 'New investment opportunity',
    description: 'A pool you follow has reached 80% funding',
    timestamp: '2 min ago',
    unread: true,
    type: 'info' as const,
  };

  const samplePoolData = {
    id: '1',
    title: 'Tech Startup Fund',
    description: 'Early-stage tech companies',
    raised: 45000,
    goal: 100000,
    daysLeft: 23,
    status: 'open' as const,
    roi: '12.5%',
    investors: 12,
    verified: true,
  };

  const sampleSlotFillData = {
    slots: 10,
    filled: 7,
    costPerSlot: 1000,
    remaining: 3,
  };

  const sampleProData = {
    features: [
      { name: 'Advanced Analytics', available: true },
      { name: 'Priority Support', available: true },
      { name: 'Custom Reports', available: false },
      { name: 'API Access', available: false },
    ],
    price: '$29/month',
  };

  return (
    <div style={{ 
      backgroundColor: C.bgBase, 
      color: C.textPrimary, 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: F.syne,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ ...typography.displayHero, marginBottom: '2rem' }}>
        SubPool Design System
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Color Palette Section */}
        <Section title="Color Palette">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ColorSwatch color={C.bgBase} name="Background Base" />
            <ColorSwatch color={C.bgSurface} name="Background Surface" />
            <ColorSwatch color={C.bgHover} name="Background Hover" />
            <ColorSwatch color={C.borderDefault} name="Border Default" />
            <ColorSwatch color={C.borderAccent} name="Border Accent" />
            <ColorSwatch color={C.textPrimary} name="Text Primary" />
            <ColorSwatch color={C.textMuted} name="Text Muted" />
            <ColorSwatch color={C.accentLime} name="Accent Lime" />
            <ColorSwatch color={C.accentLimeDark} name="Accent Lime Dark" />
            <ColorSwatch color={C.statusSuccess} name="Status Success" />
            <ColorSwatch color={C.statusWarning} name="Status Warning" />
            <ColorSwatch color={C.statusDanger} name="Status Danger" />
          </div>
        </Section>

        {/* Typography Section */}
        <Section title="Typography">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={typography.displayHero}>Display Hero (48px)</div>
            <div style={typography.displayTitle}>Display Title (28px)</div>
            <div style={typography.displayHeading}>Display Heading (22px)</div>
            <div style={typography.displaySubheading}>Display Subheading (17px)</div>
            <div style={typography.bodyDefault}>Body Default (14px)</div>
            <div style={typography.bodySmall}>Body Small (12px)</div>
            <div style={typography.monoDefault}>Mono Default (13px)</div>
            <div style={typography.monoSmall}>Mono Small (11px)</div>
            <div style={typography.monoLabel}>Mono Label (10px)</div>
          </div>
        </Section>

        {/* Buttons Section */}
        <Section title="Buttons">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </Section>

        {/* Input Fields Section */}
        <Section title="Input Fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InputField label="Email" placeholder="Enter your email" />
            <InputField label="Password" placeholder="Enter your password" />
            <InputField label="Error State" placeholder="Error input" forceState="error" helperText="This field has an error" />
          </div>
        </Section>

        {/* Status Pills Section */}
        <Section title="Status Pills">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusPill variant="open" />
            <StatusPill variant="full" />
            <StatusPill variant="pending" />
            <StatusPill variant="owed" />
            <StatusPill variant="paid" />
            <StatusPill variant="active" />
            <StatusPill variant="success" />
          </div>
        </Section>

        {/* Avatars Section */}
        <Section title="Avatars">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Avatar initials="JD" size="sm" />
            <Avatar initials="JD" size="md" />
            <Avatar initials="JD" size="lg" />
            {/* Avatar doesn't support xl size */}
          </div>
        </Section>

        {/* Cards Section */}
        <Section title="Cards">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <StatCard label="Total Invested" value="$45,678" subtext="+12.5%" />
            <PoolCard 
              status="open"
              platformEmoji="🚀"
              platformName="Tech Startup Fund"
              planName="Early-stage tech companies"
              pricePerSlot="1000"
              ownerInitials="JS"
              ownerName="John Smith"
              slotsTotal={10}
              slotsFilled={7}
            />
          </div>
        </Section>

        {/* Badges Section */}
        <Section title="Badges">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <TrustBadge icon="🛡️" label="Trusted" />
            <VerifiedBadge />
          </div>
        </Section>

        {/* Notifications Section */}
        <Section title="Notifications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <NotificationItem 
              icon="📢"
              title="New investment opportunity" 
              body="A pool you follow has reached 80% funding" 
              timestamp="2 min ago" 
              read={false}
            />
            {notificationVisible && (
              <ToastNotification
                message="This is a toast notification"
              />
            )}
            <Button onClick={() => setNotificationVisible(true)}>Show Toast</Button>
          </div>
        </Section>

        {/* Empty States Section */}
        <Section title="Empty States">
          <div style={{ height: '200px' }}>
            <EmptyState 
              emoji="🔍"
              title="No pools yet"
              body="Start by creating your first investment pool"
              ctaLabel="Create Pool"
              onCta={() => {}}
            />
          </div>
        </Section>

        {/* Overflow Menu Section */}
        <Section title="Overflow Menu">
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <OverflowMenu
              options={[
                { label: 'Edit', onClick: () => console.log('Edit clicked') },
                { label: 'Delete', onClick: () => console.log('Delete clicked') },
                { label: 'Share', onClick: () => console.log('Share clicked') },
              ]}
            />
          </div>
        </Section>

        {/* Shadcn/UI Components Section */}
        <Section title="Shadcn/UI Components">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Alert>
              <div>This is an alert component</div>
            </Alert>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox checked={checkboxChecked} onCheckedChange={(checked) => setCheckboxChecked(!!checked)} />
              <Label htmlFor="checkbox">Checkbox</Label>
            </div>
            
            <Input 
              placeholder="Regular input" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <Textarea placeholder="Textarea" />
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            
            <Separator />
            
            <Skeleton style={{ height: 20, width: '100%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Label htmlFor="switch">Switch</Label>
              <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Tabs defaultValue="account" className="w-full">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">Account content</TabsContent>
              <TabsContent value="password">Password content</TabsContent>
            </Tabs>
            
            <Toggle>Toggle</Toggle>
            
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Accordion</AccordionTrigger>
                <AccordionContent>Accordion content</AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Progress value={progressValue} className="w-full" />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Label>Slider</Label>
              <Slider
                value={sliderValue}
                onValueChange={(value) => setSliderValue(value)}
                max={100}
                step={1}
                className="w-full"
              />
              <span>{sliderValue[0]}</span>
            </div>
            
            <RadioGroup value={radioValue} onValueChange={setRadioValue}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RadioGroupItem value="option1" id="option1" />
                  <Label htmlFor="option1">Option 1</Label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RadioGroupItem value="option2" id="option2" />
                  <Label htmlFor="option2">Option 2</Label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RadioGroupItem value="option3" id="option3" />
                  <Label htmlFor="option3">Option 3</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </Section>
      </div>
    </div>
  );
}

// Helper components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ 
      backgroundColor: C.bgSurface, 
      borderRadius: '8px', 
      padding: '1.5rem', 
      border: `1px solid ${C.borderDefault}` 
    }}>
      <h2 style={{ ...typography.displaySubheading, marginBottom: '1rem' }}>{title}</h2>
      {children}
    </div>
  );
}

function ColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: color, 
          border: `1px solid ${C.borderDefault}`,
          borderRadius: '4px' 
        }} 
      />
      <div>
        <div style={{ ...typography.bodyDefault, color: C.textPrimary }}>{name}</div>
        <div style={{ ...typography.monoSmall, color: C.textMuted }}>{color.toUpperCase()}</div>
      </div>
    </div>
  );
}