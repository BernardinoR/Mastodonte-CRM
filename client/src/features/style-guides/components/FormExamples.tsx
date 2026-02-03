import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Slider } from "@/shared/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Toggle } from "@/shared/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { Calendar } from "@/shared/components/ui/calendar";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { Label } from "@/shared/components/ui/label";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export default function FormExamples() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <div className="space-y-6">
      {/* Slider */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Slider</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          <p className="text-sm text-muted-foreground">Valor: {sliderValue[0]}</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Slider } from "@/shared/components/ui/slider"`}
          </code>
        </CardContent>
      </Card>

      {/* RadioGroup */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">RadioGroup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup defaultValue="opt1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="opt1" id="r1" />
              <Label htmlFor="r1">Opção 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="opt2" id="r2" />
              <Label htmlFor="r2">Opção 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="opt3" id="r3" />
              <Label htmlFor="r3">Opção 3</Label>
            </div>
          </RadioGroup>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"`}
          </code>
        </CardContent>
      </Card>

      {/* Toggle */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Toggle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Toggle aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle aria-label="Toggle italic">
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle aria-label="Toggle underline">
              <Underline className="h-4 w-4" />
            </Toggle>
          </div>
          <div className="flex gap-2">
            <Toggle variant="outline" aria-label="Toggle outline">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle disabled aria-label="Toggle disabled">
              <Italic className="h-4 w-4" />
            </Toggle>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Toggle } from "@/shared/components/ui/toggle"`}
          </code>
        </CardContent>
      </Card>

      {/* ToggleGroup */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">ToggleGroup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Single selection:</p>
            <ToggleGroup type="single" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Multiple selection:</p>
            <ToggleGroup type="multiple">
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group"`}
          </code>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Calendar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border inline-block"
          />
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { Calendar } from "@/shared/components/ui/calendar"`}
          </code>
        </CardContent>
      </Card>

      {/* InputOTP */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">InputOTP</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <code className="text-xs bg-muted px-2 py-1 rounded block">
            {`import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/shared/components/ui/input-otp"`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
