import { NewMeetingDialog } from '../NewMeetingDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function NewMeetingDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <NewMeetingDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => console.log('Meeting created:', data)}
      />
    </div>
  );
}
